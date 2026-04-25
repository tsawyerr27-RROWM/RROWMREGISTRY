-- Entity-based gallery onboarding: single transaction for galleries + gallery_users + actor_profiles.

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

  insert into public.actor_profiles (user_id, role, display_name)
  values (v_uid, 'gallery', v_name)
  on conflict (user_id) do update set
    role = 'gallery',
    display_name = excluded.display_name,
    updated_at = now();

  return v_gid;
end;
$$;

revoke all on function public.bootstrap_gallery_profile(text, text, text, text) from public;
grant execute on function public.bootstrap_gallery_profile(text, text, text, text) to authenticated;

comment on function public.bootstrap_gallery_profile(text, text, text, text) is
  'Atomic first-time gallery onboarding: galleries row + gallery_users (admin) + actor_profiles.role=gallery.';

-- Canonical test reset name; keep delete_test_data as an alias for existing callers.
create or replace function public.reset_test_environment()
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_ok boolean;
  ids uuid[];
begin
  select exists (
    select 1
    from public.artists a
    where a.id = auth.uid()
      and coalesce(a.is_admin, false) = true
  )
  into admin_ok;

  if not admin_ok then
    raise exception 'forbidden'
      using errcode = '42501';
  end if;

  select coalesce(array_agg(user_id), array[]::uuid[])
  into ids
  from public.actor_profiles
  where is_test is true;

  delete from public.certificates
  where is_test is true
     or artwork_id in (select id from public.artworks where is_test is true);

  delete from public.ownership_events
  where is_test is true
     or artwork_id in (select id from public.artworks where is_test is true);

  delete from public.value_events
  where is_test is true
     or artwork_id in (select id from public.artworks where is_test is true);

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'verification_events'
  ) then
    delete from public.verification_events
    where is_test is true
       or artwork_id in (select id from public.artworks where is_test is true);
  end if;

  delete from public.activity_events
  where user_id in (select user_id from public.actor_profiles where is_test is true)
     or artwork_id in (select id from public.artworks where is_test is true);

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'market_enquiries'
  ) then
    delete from public.market_enquiries
    where listing_id in (
      select ml.id
      from public.market_listings ml
      where ml.artwork_id in (select id from public.artworks where is_test is true)
    );
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'market_listings'
  ) then
    delete from public.market_listings
    where artwork_id in (select id from public.artworks where is_test is true);
  end if;

  delete from public.artworks
  where is_test is true;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'gallery_artist_invites'
  ) then
    delete from public.gallery_artist_invites
    where gallery_id in (select id from public.galleries where is_test is true);
  end if;

  delete from public.gallery_users
  where is_test is true
     or gallery_id in (select id from public.galleries where is_test is true);

  delete from public.galleries
  where is_test is true;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'collector_profiles'
  ) then
    delete from public.collector_profiles
    where is_test is true
       or user_id in (select user_id from public.actor_profiles where is_test is true);
  end if;

  delete from public.artists
  where is_test is true;

  delete from public.actor_profiles
  where is_test is true;

  return coalesce(ids, array[]::uuid[]);
end;
$$;

revoke all on function public.reset_test_environment() from public;
grant execute on function public.reset_test_environment() to authenticated;

create or replace function public.delete_test_data()
returns uuid[]
language sql
security definer
set search_path = public
as $$
  select public.reset_test_environment();
$$;

revoke all on function public.delete_test_data() from public;
grant execute on function public.delete_test_data() to authenticated;

comment on function public.reset_test_environment() is
  'Admin-only: removes all public rows tagged is_test. Call /api/admin/test/reset to delete auth users.';
