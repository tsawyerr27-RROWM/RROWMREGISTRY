-- Pre-launch QA: tag synthetic rows with is_test; admin-only cleanup via delete_test_data().

alter table public.actor_profiles add column if not exists is_test boolean not null default false;
alter table public.artists add column if not exists is_test boolean not null default false;
alter table public.galleries add column if not exists is_test boolean not null default false;
alter table public.gallery_users add column if not exists is_test boolean not null default false;
alter table public.artworks add column if not exists is_test boolean not null default false;
alter table public.ownership_events add column if not exists is_test boolean not null default false;
alter table public.value_events add column if not exists is_test boolean not null default false;
alter table public.certificates add column if not exists is_test boolean not null default false;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'collector_profiles'
  ) then
    execute 'alter table public.collector_profiles add column if not exists is_test boolean not null default false';
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'verification_events'
  ) then
    execute 'alter table public.verification_events add column if not exists is_test boolean not null default false';
  end if;
end $$;

create or replace function public.delete_test_data()
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

revoke all on function public.delete_test_data() from public;
grant execute on function public.delete_test_data() to authenticated;

comment on function public.delete_test_data() is
  'Admin-only: removes public rows tagged is_test. Call /api/admin/test/reset to delete auth users.';
