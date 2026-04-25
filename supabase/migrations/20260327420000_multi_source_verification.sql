-- Multi-source verification signals via verification_events.
-- Keeps artworks.verification_status for now, but begins deriving it from events.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1) verification_events table (create or extend)
-- ---------------------------------------------------------------------------
create table if not exists public.verification_events (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  source text not null,
  source_id uuid,
  status text not null default 'confirmed',
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- If the table already existed, add missing columns before constraints/policies reference them.
alter table public.verification_events add column if not exists artwork_id uuid;
alter table public.verification_events add column if not exists source text;
alter table public.verification_events add column if not exists source_id uuid;
alter table public.verification_events add column if not exists status text;
alter table public.verification_events add column if not exists metadata jsonb;
alter table public.verification_events add column if not exists created_at timestamptz;

-- Backfill defaults for older rows
update public.verification_events
set status = 'confirmed'
where status is null or trim(coalesce(status, '')) = '';

-- Normalize any legacy status values before adding CHECK constraint.
update public.verification_events
set status = case
  when lower(trim(coalesce(status, ''))) in ('confirmed', 'revoked') then lower(trim(status))
  else 'confirmed'
end
where status is not null;

update public.verification_events
set source = case
  when lower(trim(coalesce(verification_method, ''))) = 'gallery' then 'gallery'
  when lower(trim(coalesce(verification_method, ''))) = 'certificate' then 'certificate'
  when lower(trim(coalesce(verification_method, ''))) = 'admin' then 'system'
  else 'system'
end
where source is null or trim(coalesce(source, '')) = '';

update public.verification_events
set created_at = now()
where created_at is null;

-- Back/compat columns from earlier iterations (keep if present)
alter table public.verification_events add column if not exists verification_method text;
alter table public.verification_events add column if not exists verified_by_gallery_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'verification_events_source_check') then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'verification_events' and column_name = 'source'
    ) then
      alter table public.verification_events
        add constraint verification_events_source_check
        check (source in ('artist', 'gallery', 'certificate', 'system'));
    end if;
  end if;
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'verification_events_status_check') then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'verification_events' and column_name = 'status'
    ) then
      alter table public.verification_events
        add constraint verification_events_status_check
        check (status in ('confirmed', 'revoked'));
    end if;
  end if;
exception when duplicate_object then null;
end $$;

create index if not exists verification_events_artwork_created_desc_idx
  on public.verification_events (artwork_id, created_at desc, id desc);
create index if not exists verification_events_source_idx
  on public.verification_events (source);

-- ---------------------------------------------------------------------------
-- 2) RLS
-- ---------------------------------------------------------------------------
alter table public.verification_events enable row level security;

drop policy if exists "verification_events_select_public" on public.verification_events;
create policy "verification_events_select_public"
  on public.verification_events for select
  to anon, authenticated
  using (true);

-- Artist may add an artist confirmation for their own work.
drop policy if exists "verification_events_insert_artist_own_work" on public.verification_events;
create policy "verification_events_insert_artist_own_work"
  on public.verification_events for insert
  to authenticated
  with check (
    source = 'artist'
    and status = 'confirmed'
    and exists (
      select 1 from public.artworks a
      where a.id = verification_events.artwork_id
        and a.artist_id = auth.uid()
    )
  );

-- Verified gallery staff may add a gallery verification for represented works.
drop policy if exists "verification_events_insert_verified_gallery" on public.verification_events;
create policy "verification_events_insert_verified_gallery"
  on public.verification_events for insert
  to authenticated
  with check (
    source = 'gallery'
    and status = 'confirmed'
    and exists (
      select 1
      from public.artworks aw
      inner join public.artists ar on ar.id = aw.artist_id
      inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
      inner join public.galleries g on g.id = gu.gallery_id
      where aw.id = verification_events.artwork_id
        and gu.user_id = auth.uid()
        and g.verified is true
        and verification_events.source_id = g.id
    )
  );

grant select, insert on public.verification_events to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Helper: refresh artworks.verification_status from events (certificate OR gallery)
-- ---------------------------------------------------------------------------
create or replace function public.refresh_artwork_verification_status(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verified boolean;
begin
  if p_artwork_id is null then return; end if;

  select exists (
    select 1
    from public.verification_events ve
    where ve.artwork_id = p_artwork_id
      and ve.status = 'confirmed'
      and ve.source in ('certificate', 'gallery')
  ) into v_verified;

  update public.artworks a
  set verification_status = case when v_verified then 'verified' else 'unverified' end
  where a.id = p_artwork_id;
end;
$$;

revoke all on function public.refresh_artwork_verification_status(uuid) from public;
grant execute on function public.refresh_artwork_verification_status(uuid) to authenticated;

drop trigger if exists trg_refresh_artwork_verification_status on public.verification_events;
-- Some deployments don't have a generic trigger helper; do the refresh with a dedicated trigger.
create or replace function public.verification_events_refresh_artwork_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_artwork_verification_status(coalesce(new.artwork_id, old.artwork_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_verification_events_refresh_artwork_verified on public.verification_events;
create trigger trg_verification_events_refresh_artwork_verified
after insert or update or delete on public.verification_events
for each row
execute function public.verification_events_refresh_artwork_verified();

-- ---------------------------------------------------------------------------
-- 4) RPC: computeArtworkVerification
-- ---------------------------------------------------------------------------
create or replace function public.compute_artwork_verification(p_artwork_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cert boolean;
  v_gallery boolean;
  v_artist boolean;
  v_chain boolean;
  v_is_verified boolean;
begin
  v_cert := exists (
    select 1
    from public.certificates c
    where c.artwork_id = p_artwork_id
      and coalesce(c.revoked, false) = false
  );

  v_gallery := exists (
    select 1
    from public.verification_events ve
    where ve.artwork_id = p_artwork_id
      and ve.status = 'confirmed'
      and ve.source = 'gallery'
  );

  v_artist := exists (
    select 1
    from public.verification_events ve
    where ve.artwork_id = p_artwork_id
      and ve.status = 'confirmed'
      and ve.source = 'artist'
  );

  -- Minimal chain signal: latest ownership row is verified and assigned.
  v_chain := exists (
    with latest as (
      select oe.to_user_id, oe.to_owner_id, oe.verification_status
      from public.ownership_events oe
      where oe.artwork_id = p_artwork_id
      order by oe.created_at desc nulls last, oe.id desc
      limit 1
    )
    select 1
    from latest
    where lower(coalesce(latest.verification_status, 'recorded')) = 'verified'
      and coalesce(latest.to_user_id, latest.to_owner_id) is not null
  );

  v_is_verified := v_cert or v_gallery;

  return jsonb_build_object(
    'is_verified', v_is_verified,
    'sources', jsonb_build_object(
      'artist', v_artist,
      'gallery', v_gallery,
      'certificate', v_cert,
      'chain', v_chain
    )
  );
end;
$$;

revoke all on function public.compute_artwork_verification(uuid) from public;
grant execute on function public.compute_artwork_verification(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) Integrations: certificate issuance + gallery verification write events
-- ---------------------------------------------------------------------------
-- Certificate issuance: add a certificate verification event (idempotent-ish).
create or replace function public.issue_certificate_for_verified_artwork(
  p_artwork_id uuid
)
returns table (
  created boolean,
  certificate_hash text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_artwork record;
  v_cert record;
  v_hash text;
begin
  select a.id, a.registry_id, a.verification_status
    into v_artwork
  from public.artworks a
  where a.id = p_artwork_id;

  if v_artwork.id is null then
    raise exception 'Artwork not found' using errcode = 'P0002';
  end if;

  if v_artwork.verification_status is distinct from 'verified' then
    raise exception 'Artwork is not verified' using errcode = '22000';
  end if;

  if v_artwork.registry_id is null then
    raise exception 'Registry ID missing' using errcode = '22000';
  end if;

  select c.id, c.issued_at, c.certificate_hash, c.revoked
    into v_cert
  from public.certificates c
  where c.artwork_id = v_artwork.id
  for update;

  if v_cert.id is null then
    insert into public.certificates (artwork_id, certificate_number, issued_at, revoked)
    values (v_artwork.id, v_artwork.registry_id, now(), false)
    returning id, issued_at, certificate_hash, revoked into v_cert;
    created := true;
  else
    created := false;
  end if;

  v_hash := coalesce(v_cert.certificate_hash, '');
  if v_hash = '' then
    -- Keep existing hash logic minimal here; rely on earlier migrations to compute.
    v_hash := encode(digest((v_artwork.id::text || '|' || v_artwork.registry_id::text || '|' || v_cert.issued_at::text)::text, 'sha256'), 'hex');
    update public.certificates set certificate_hash = v_hash where id = v_cert.id;
  end if;

  certificate_hash := v_hash;

  -- Insert verification event (confirmed) when cert exists and not revoked.
  if coalesce(v_cert.revoked, false) = false then
    begin
      insert into public.verification_events (artwork_id, source, source_id, status, metadata, created_at)
      values (
        v_artwork.id,
        'certificate',
        null,
        'confirmed',
        jsonb_build_object('certificate_id', v_cert.id),
        now()
      );
    exception when others then
      null;
    end;
  end if;

  perform public.refresh_artwork_verification_status(v_artwork.id);
  return next;
end;
$$;

-- Gallery verification: ensure the verification event matches the new schema too.
create or replace function public.gallery_verify_artwork(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
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

  if v_gallery_id is null then
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

  begin
    insert into public.verification_events (artwork_id, source, source_id, status, metadata, created_at, verification_method, verified_by_gallery_id)
    values (
      p_artwork_id,
      'gallery',
      v_gallery_id,
      'confirmed',
      jsonb_build_object('actor_user_id', auth.uid()),
      now(),
      'gallery',
      v_gallery_id
    );
  exception when others then
    null;
  end;

  perform public.refresh_artwork_verification_status(p_artwork_id);
end;
$$;

revoke all on function public.gallery_verify_artwork(uuid) from public;
grant execute on function public.gallery_verify_artwork(uuid) to authenticated;

-- Optional artist confirmation RPC (writes verification_events only; does not mark verified by itself)
create or replace function public.artist_confirm_artwork(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.artworks a where a.id = p_artwork_id and a.artist_id = auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  insert into public.verification_events (artwork_id, source, source_id, status, created_at, metadata)
  values (p_artwork_id, 'artist', auth.uid(), 'confirmed', now(), jsonb_build_object('artist_user_id', auth.uid()));
end;
$$;

revoke all on function public.artist_confirm_artwork(uuid) from public;
grant execute on function public.artist_confirm_artwork(uuid) to authenticated;

