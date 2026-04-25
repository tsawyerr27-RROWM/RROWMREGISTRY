-- Fallback if an older 20260403120000 ran without the embedded column DDL (42703 at runtime).
-- Safe to run multiple times.

alter table public.actor_profiles
  add column if not exists onboarding_complete boolean;

update public.actor_profiles
set onboarding_complete = coalesce(onboarding_complete, false)
where onboarding_complete is null;

alter table public.actor_profiles
  alter column onboarding_complete set default false;

alter table public.actor_profiles
  alter column onboarding_complete set not null;
