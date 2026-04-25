-- Repair: actor_profiles.onboarding_complete (42703 if 20260401170000 was skipped or failed).
-- Backfill runs only for tables that exist (partial migration order).

alter table public.actor_profiles
  add column if not exists onboarding_complete boolean;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'artists'
  ) then
    update public.actor_profiles ap
    set onboarding_complete = true
    where onboarding_complete is null
      and ap.role = 'artist'
      and exists (select 1 from public.artists ar where ar.id = ap.user_id);
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'collector_profiles'
  ) then
    update public.actor_profiles ap
    set onboarding_complete = true
    where onboarding_complete is null
      and ap.role = 'collector'
      and exists (
        select 1
        from public.collector_profiles cp
        where cp.user_id = ap.user_id
      );
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'gallery_users'
  ) then
    update public.actor_profiles ap
    set onboarding_complete = true
    where onboarding_complete is null
      and ap.role = 'gallery'
      and exists (
        select 1
        from public.gallery_users gu
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
