-- Verified gallery authority layer:
-- - galleries.verified_at / verified_by
-- - verification_events tagging (method + gallery id) when table supports it
-- - service-role admin RPC to verify a gallery
-- - enrich gallery_verify_artwork to record verification_events source

-- ---------------------------------------------------------------------------
-- 1) galleries verification metadata
-- ---------------------------------------------------------------------------
alter table public.galleries
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'galleries_verified_by_fkey'
  ) then
    alter table public.galleries
      add constraint galleries_verified_by_fkey
      foreign key (verified_by) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then null;
end $$;

comment on column public.galleries.verified is
  'Authority flag: verified galleries may perform trusted verification actions.';

-- ---------------------------------------------------------------------------
-- 2) verification_events tagging (optional; depends on table shape)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'verification_events'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'verification_events' and column_name = 'verified_by_gallery_id'
    ) then
      -- column exists; no-op
      null;
    else
      execute 'alter table public.verification_events add column verified_by_gallery_id uuid';
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'verification_events' and column_name = 'verification_method'
    ) then
      null;
    else
      execute 'alter table public.verification_events add column verification_method text';
    end if;

    -- FK (best-effort)
    begin
      if not exists (
        select 1 from pg_constraint where conname = 'verification_events_verified_by_gallery_id_fkey'
      ) then
        execute 'alter table public.verification_events add constraint verification_events_verified_by_gallery_id_fkey foreign key (verified_by_gallery_id) references public.galleries (id) on delete set null';
      end if;
    exception when invalid_foreign_key then null;
    end;

    -- Method constraint (best-effort; skip if existing enum incompatibilities)
    begin
      if exists (
        select 1
        from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        join pg_namespace n on n.oid = t.relnamespace
        where n.nspname = 'public'
          and t.relname = 'verification_events'
          and c.conname = 'verification_events_verification_method_check'
      ) then
        execute 'alter table public.verification_events drop constraint verification_events_verification_method_check';
      end if;
      execute $ct$
        alter table public.verification_events
          add constraint verification_events_verification_method_check
          check (
            verification_method is null
            or lower(trim(verification_method)) in ('gallery', 'admin', 'certificate')
          )
      $ct$;
    exception when others then
      null;
    end;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Service-role admin RPC: verify / unverify a gallery (no self-verification)
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_gallery_verified(
  p_gallery_id uuid,
  p_verified boolean,
  p_verified_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') != 'service_role' then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;
  if p_gallery_id is null then
    raise exception 'Missing gallery id' using errcode = '22023';
  end if;
  if p_verified_by is null then
    raise exception 'verified_by required' using errcode = '22023';
  end if;

  update public.galleries
  set
    verified = coalesce(p_verified, false),
    verified_by = case when coalesce(p_verified, false) then p_verified_by else null end,
    verified_at = case when coalesce(p_verified, false) then now() else null end
  where id = p_gallery_id;
end;
$$;

revoke all on function public.admin_set_gallery_verified(uuid, boolean, uuid) from public;
grant execute on function public.admin_set_gallery_verified(uuid, boolean, uuid) to service_role;

comment on function public.admin_set_gallery_verified(uuid, boolean, uuid) is
  'Service-role only: set galleries.verified + verified_by + verified_at.';

-- ---------------------------------------------------------------------------
-- 4) Enhance gallery_verify_artwork to emit verification_events source (if table supports it)
-- ---------------------------------------------------------------------------
create or replace function public.gallery_verify_artwork(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ok boolean;
  v_gallery_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select ar.gallery_id
  into v_gallery_id
  from public.artworks aw
  inner join public.artists ar on ar.id = aw.artist_id
  inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
  inner join public.galleries g on g.id = gu.gallery_id
  where aw.id = p_artwork_id
    and gu.user_id = auth.uid()
    and g.verified is true
  limit 1;

  v_ok := v_gallery_id is not null;
  if not v_ok then
    raise exception 'Not authorized for gallery verification' using errcode = '42501';
  end if;

  update public.artworks a
  set
    verification_status = 'verified',
    verification_hash = encode(
      digest(
        concat_ws(
          '|',
          coalesce(a.title::text, ''),
          coalesce(a.artist_id::text, ''),
          coalesce(a.registry_id::text, ''),
          coalesce(a.created_at::text, '')
        ),
        'sha256'
      ),
      'hex'
    ),
    approved_by = auth.uid(),
    approved_at = now()
  where a.id = p_artwork_id
    and a.verification_status is distinct from 'verified';

  -- Best-effort: record a verification event tagged as gallery verification.
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'verification_events'
  )
  and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'verification_events' and column_name = 'artwork_id'
  )
  and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'verification_events' and column_name = 'verification_method'
  ) then
    begin
      insert into public.verification_events (artwork_id, verification_method, verified_by_gallery_id, created_at)
      values (p_artwork_id, 'gallery', v_gallery_id, now());
    exception when others then
      null;
    end;
  end if;
end;
$$;

revoke all on function public.gallery_verify_artwork(uuid) from public;
grant execute on function public.gallery_verify_artwork(uuid) to authenticated;

