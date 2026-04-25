-- Unified onboarding: onboarding_complete flag + server-side completion RPCs.
--
-- Prerequisites (run earlier migrations first if tables are missing):
--   public.artists, public.collector_profiles, public.gallery_users
--   e.g. 20260327350000_collector_profiles.sql before this file.

alter table public.actor_profiles
  add column if not exists onboarding_complete boolean;

-- Backfill only where related tables exist (avoids 42P01 if run out of order).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'artists'
  ) then
    update public.actor_profiles ap
    set onboarding_complete = true
    where onboarding_complete is null
      and ap.role = 'artist'
      and exists (select 1 from public.artists ar where ar.id = ap.user_id);
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'collector_profiles'
  ) then
    update public.actor_profiles ap
    set onboarding_complete = true
    where onboarding_complete is null
      and ap.role = 'collector'
      and exists (
        select 1 from public.collector_profiles cp
        where cp.user_id = ap.user_id
      );
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'gallery_users'
  ) then
    update public.actor_profiles ap
    set onboarding_complete = true
    where onboarding_complete is null
      and ap.role = 'gallery'
      and exists (
        select 1 from public.gallery_users gu
        where gu.user_id = ap.user_id
      );
  end if;
end $$;

update public.actor_profiles
set onboarding_complete = coalesce(onboarding_complete, false)
where onboarding_complete is null;

alter table public.actor_profiles
  alter column onboarding_complete set default false;

alter table public.actor_profiles
  alter column onboarding_complete set not null;

alter table public.artists add column if not exists full_name text;
alter table public.artists add column if not exists bio text;

-- Step 1: choose role (may reset onboarding until profile step completes).
create or replace function public.set_onboarding_role(
  p_role text,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_name text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if p_role not in ('artist', 'gallery', 'collector') then
    raise exception 'Invalid role';
  end if;

  v_name := trim(coalesce(p_display_name, ''));

  insert into public.actor_profiles (user_id, role, display_name, onboarding_complete)
  values (v_uid, p_role, v_name, false)
  on conflict (user_id) do update set
    role = excluded.role,
    display_name = case
      when excluded.display_name = '' then actor_profiles.display_name
      else excluded.display_name
    end,
    onboarding_complete = false,
    updated_at = now();
end;
$$;

revoke all on function public.set_onboarding_role(text, text) from public;
grant execute on function public.set_onboarding_role(text, text) to authenticated;

-- Artist: atomic artists row + actor completion.
create or replace function public.complete_onboarding_artist(
  p_full_name text,
  p_display_name text,
  p_bio text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_full text;
  v_disp text;
  v_slug text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.actor_profiles ap
    where ap.user_id = v_uid
      and ap.role = 'artist'
  ) then
    raise exception 'Profile must be set to artist first'
      using errcode = '42501';
  end if;

  v_full := trim(coalesce(p_full_name, ''));
  v_disp := trim(coalesce(p_display_name, ''));
  if v_disp = '' then
    raise exception 'Display name is required';
  end if;

  v_slug :=
    trim(
      both '-'
      from regexp_replace(lower(v_disp), '[^a-zA-Z0-9]+', '-', 'g')
    );
  if v_slug = '' then
    v_slug := 'artist';
  end if;
  v_slug := left(v_slug, 40) || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);

  insert into public.artists (id, full_name, display_name, bio, slug)
  values (
    v_uid,
    nullif(v_full, ''),
    v_disp,
    nullif(trim(coalesce(p_bio, '')), ''),
    v_slug
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    bio = excluded.bio,
    slug = excluded.slug;

  update public.actor_profiles
  set
    display_name = v_disp,
    onboarding_complete = true,
    updated_at = now()
  where user_id = v_uid;
end;
$$;

revoke all on function public.complete_onboarding_artist(text, text, text) from public;
grant execute on function public.complete_onboarding_artist(text, text, text) to authenticated;

-- Collector: collector_profiles + actor completion.
create or replace function public.complete_onboarding_collector(
  p_display_name text,
  p_location text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_name text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.actor_profiles ap
    where ap.user_id = v_uid
      and ap.role = 'collector'
  ) then
    raise exception 'Profile must be set to collector first'
      using errcode = '42501';
  end if;

  v_name := trim(coalesce(p_display_name, ''));
  if v_name = '' then
    raise exception 'Display name is required';
  end if;

  insert into public.collector_profiles (
    user_id,
    display_name,
    location,
    is_public
  )
  values (
    v_uid,
    v_name,
    nullif(trim(coalesce(p_location, '')), ''),
    false
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    location = excluded.location;

  update public.actor_profiles
  set
    display_name = v_name,
    onboarding_complete = true,
    updated_at = now()
  where user_id = v_uid;
end;
$$;

revoke all on function public.complete_onboarding_collector(text, text) from public;
grant execute on function public.complete_onboarding_collector(text, text) to authenticated;

-- ensure_actor_profile: new rows get onboarding_complete = false; updates preserve flag.
create or replace function public.ensure_actor_profile(
  p_role text,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if p_role not in ('artist', 'gallery', 'collector') then
    raise exception 'Invalid role';
  end if;

  insert into public.actor_profiles (user_id, role, display_name, onboarding_complete)
  values (auth.uid(), p_role, p_display_name, false)
  on conflict (user_id) do update set
    role = excluded.role,
    display_name = excluded.display_name,
    updated_at = now();
end;
$$;

revoke all on function public.ensure_actor_profile(text, text) from public;
grant execute on function public.ensure_actor_profile(text, text) to authenticated;

-- Gallery bootstrap: mark onboarding complete.
create or replace function public.bootstrap_gallery_profile(
  p_name text,
  p_slug text,
  p_location text default null,
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_gid uuid;
  base_slug text;
  final_slug text;
  n int := 0;
  v_name text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if exists (select 1 from public.gallery_users gu where gu.user_id = v_uid) then
    raise exception 'Gallery membership already exists'
      using errcode = '23505';
  end if;

  v_name := trim(coalesce(p_name, ''));
  if v_name = '' then
    raise exception 'Gallery name is required';
  end if;

  base_slug := lower(
    trim(
      both '-'
      from regexp_replace(
        trim(coalesce(p_slug, '')),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    )
  );
  if base_slug = '' or base_slug is null then
    base_slug := 'gallery';
  end if;

  final_slug := base_slug || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);

  while exists (select 1 from public.galleries g where g.slug = final_slug) loop
    n := n + 1;
    final_slug :=
      base_slug || '-' || substr(replace(v_uid::text, '-', ''), 1, 8) || '-' || n::text;
  end loop;

  insert into public.galleries (name, slug, location, website_url, verified, subscription_status)
  values (
    v_name,
    final_slug,
    nullif(trim(coalesce(p_location, '')), ''),
    nullif(trim(coalesce(p_website, '')), ''),
    false,
    'grace'
  )
  returning id into v_gid;

  insert into public.gallery_users (gallery_id, user_id, role)
  values (v_gid, v_uid, 'admin');

  insert into public.actor_profiles (user_id, role, display_name, onboarding_complete)
  values (v_uid, 'gallery', v_name, true)
  on conflict (user_id) do update set
    role = 'gallery',
    display_name = excluded.display_name,
    onboarding_complete = true,
    updated_at = now();

  return v_gid;
end;
$$;

revoke all on function public.bootstrap_gallery_profile(text, text, text, text) from public;
grant execute on function public.bootstrap_gallery_profile(text, text, text, text) to authenticated;
