-- Gallery institutional accounts: org row, staff linkage, artist representation,
-- verification authority for verified galleries, subscription-ready field.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1) public.galleries
-- ---------------------------------------------------------------------------
create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.galleries add column if not exists name text;
alter table public.galleries add column if not exists slug text;
alter table public.galleries add column if not exists location text;
alter table public.galleries add column if not exists description text;
alter table public.galleries add column if not exists website_url text;
alter table public.galleries add column if not exists verified boolean not null default false;
-- subscription_status differs across deployments (enum vs text; values vary). Do not enforce here.
alter table public.galleries add column if not exists subscription_status text;
alter table public.gallery_users add column if not exists role text;
alter table public.gallery_users add column if not exists created_at timestamptz not null default now();
alter table public.gallery_users add column if not exists gallery_id uuid;
alter table public.gallery_users add column if not exists user_id uuid;
update public.galleries set name = coalesce(nullif(trim(name), ''), 'Gallery') where name is null;

update public.galleries
set slug = 'gallery-' || replace(id::text, '-', '')
where slug is null or trim(coalesce(slug, '')) = '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'galleries_slug_unique'
  ) then
    alter table public.galleries
      add constraint galleries_slug_unique unique (slug);
  end if;
exception
  when duplicate_object then null;
end $$;


comment on table public.galleries is
  'Institutional gallery org; staff in gallery_users; represents artists via artists.gallery_id.';
comment on column public.galleries.subscription_status is
  'Billing / tier gate (deployment-specific values).';

create index if not exists galleries_slug_idx on public.galleries (slug);

-- ---------------------------------------------------------------------------
-- 2) public.gallery_users
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_users (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gallery_users_role_check'
  ) then
    alter table public.gallery_users
      add constraint gallery_users_role_check
      check (role in ('admin', 'staff'));
  end if;
exception
  when duplicate_object then null;
end $$;

create unique index if not exists gallery_users_gallery_user_uidx
  on public.gallery_users (gallery_id, user_id);

create index if not exists gallery_users_user_id_idx on public.gallery_users (user_id);

comment on table public.gallery_users is
  'Staff linkage: admin or staff per gallery.';

-- ---------------------------------------------------------------------------
-- 3) artists.gallery_id
-- ---------------------------------------------------------------------------
alter table public.artists add column if not exists gallery_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'artists_gallery_id_fkey'
  ) then
    alter table public.artists
      add constraint artists_gallery_id_fkey
      foreign key (gallery_id) references public.galleries (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then null;
end $$;

create index if not exists artists_gallery_id_idx on public.artists (gallery_id);

alter table public.artworks add column if not exists approved_by uuid;
alter table public.artworks add column if not exists approved_at timestamptz;

-- ---------------------------------------------------------------------------
-- 4) RLS: gallery_users
-- ---------------------------------------------------------------------------
alter table public.gallery_users enable row level security;

drop policy if exists "gallery_users_select_own" on public.gallery_users;
create policy "gallery_users_select_own"
  on public.gallery_users for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.gallery_users to authenticated;

-- Inserts via SECURITY DEFINER RPC only (bootstrap + future admin tools).

-- ---------------------------------------------------------------------------
-- 5) RLS: galleries — org update for gallery admins
-- ---------------------------------------------------------------------------
drop policy if exists "galleries_update_admin" on public.galleries;
create policy "galleries_update_admin"
  on public.galleries for update
  to authenticated
  using (
    exists (
      select 1 from public.gallery_users gu
      where gu.gallery_id = galleries.id
        and gu.user_id = auth.uid()
        and gu.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.gallery_users gu
      where gu.gallery_id = galleries.id
        and gu.user_id = auth.uid()
        and gu.role = 'admin'
    )
  );

grant update on public.galleries to authenticated;

-- ---------------------------------------------------------------------------
-- 6) RLS: artworks — represented-artist registration + verified-gallery verification
-- ---------------------------------------------------------------------------
drop policy if exists "artworks_insert_artist_own" on public.artworks;
create policy "artworks_insert_artist_own"
  on public.artworks for insert
  to authenticated
  with check (artist_id = auth.uid());

drop policy if exists "artworks_insert_gallery_staff_represented" on public.artworks;
create policy "artworks_insert_gallery_staff_represented"
  on public.artworks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.artists ar
      inner join public.gallery_users gu
        on gu.gallery_id = ar.gallery_id
      where ar.id = artworks.artist_id
        and gu.user_id = auth.uid()
    )
  );

drop policy if exists "artworks_update_artist_own" on public.artworks;
create policy "artworks_update_artist_own"
  on public.artworks for update
  to authenticated
  using (artist_id = auth.uid())
  with check (artist_id = auth.uid());

drop policy if exists "artworks_update_verified_gallery" on public.artworks;
create policy "artworks_update_verified_gallery"
  on public.artworks for update
  to authenticated
  using (
    exists (
      select 1 from public.artists ar
      inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
      inner join public.galleries g on g.id = gu.gallery_id
      where ar.id = artworks.artist_id
        and gu.user_id = auth.uid()
        and g.verified is true
    )
  )
  with check (
    exists (
      select 1 from public.artists ar
      inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
      inner join public.galleries g on g.id = gu.gallery_id
      where ar.id = artworks.artist_id
        and gu.user_id = auth.uid()
        and g.verified is true
    )
  );

grant insert, update on public.artworks to authenticated;

drop policy if exists "rrowm_value_events_select_gallery_represented" on public.value_events;
create policy "rrowm_value_events_select_gallery_represented"
  on public.value_events for select
  to authenticated
  using (
    exists (
      select 1 from public.artworks a
      inner join public.artists ar on ar.id = a.artist_id
      inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
      where a.id = value_events.artwork_id
        and gu.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 7) verification_events — optional ledger row (when table exists)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'verification_events'
  )
  and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'verification_events'
      and column_name = 'artwork_id'
  ) then
    execute 'grant insert on public.verification_events to authenticated';
    execute 'drop policy if exists verification_events_insert_verified_gallery on public.verification_events';
    execute
      'create policy verification_events_insert_verified_gallery ' ||
      'on public.verification_events for insert to authenticated ' ||
      'with check (' ||
        'exists (' ||
          'select 1 from public.artworks aw ' ||
          'inner join public.artists ar on ar.id = aw.artist_id ' ||
          'inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id ' ||
          'inner join public.galleries g on g.id = gu.gallery_id ' ||
          'where aw.id = verification_events.artwork_id ' ||
            'and gu.user_id = auth.uid() ' ||
            'and g.verified is true' ||
        ')' ||
      ')';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 8) Bootstrap: first gallery + admin membership for caller
-- ---------------------------------------------------------------------------
create or replace function public.create_gallery_for_user(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_existing uuid;
  v_id uuid;
  base text;
  final_slug text;
  n int := 0;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select gu.gallery_id into v_existing
  from public.gallery_users gu
  where gu.user_id = v_uid
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  base := lower(
    trim(
      both '-'
      from regexp_replace(
        trim(coalesce(p_name, '')),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    )
  );
  if base = '' or base is null then
    base := 'gallery';
  end if;
  final_slug := base || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);

  while exists (select 1 from public.galleries g where g.slug = final_slug) loop
    n := n + 1;
    final_slug := base || '-' || substr(replace(v_uid::text, '-', ''), 1, 8) || '-' || n::text;
  end loop;

  insert into public.galleries (name, slug, verified, subscription_status)
  values (trim(coalesce(p_name, 'Gallery')), final_slug, false, 'grace')
  returning id into v_id;

  insert into public.gallery_users (gallery_id, user_id, role)
  values (v_id, v_uid, 'admin');

  return v_id;
end;
$$;

revoke all on function public.create_gallery_for_user(text) from public;
grant execute on function public.create_gallery_for_user(text) to authenticated;

comment on function public.create_gallery_for_user(text) is
  'First-time: insert galleries row + admin gallery_users row for auth.uid(). Idempotent.';

-- ---------------------------------------------------------------------------
-- 9) Atomic verification (verified galleries only)
-- ---------------------------------------------------------------------------
create or replace function public.gallery_verify_artwork(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ok boolean;
  v_art record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select exists (
    select 1
    from public.artworks aw
    inner join public.artists ar on ar.id = aw.artist_id
    inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
    inner join public.galleries g on g.id = gu.gallery_id
    where aw.id = p_artwork_id
      and gu.user_id = auth.uid()
      and g.verified is true
  ) into v_ok;

  if not v_ok then
    raise exception 'Not authorized for gallery verification' using errcode = '42501';
  end if;

  select * into v_art from public.artworks a where a.id = p_artwork_id;
  if v_art.id is null then
    raise exception 'Artwork not found' using errcode = 'P0002';
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
end;
$$;

revoke all on function public.gallery_verify_artwork(uuid) from public;
grant execute on function public.gallery_verify_artwork(uuid) to authenticated;

comment on function public.gallery_verify_artwork(uuid) is
  'Verified gallery staff only: mark represented artwork verified + hash (matches internal verify shape).';
