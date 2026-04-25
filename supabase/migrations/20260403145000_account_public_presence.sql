-- Unified public visibility prefs + account fields (artist social links).

-- jsonb keys: profile, ownership, values, location (booleans; default true = existing behaviour)
alter table public.actor_profiles
  add column if not exists public_presence jsonb;

update public.actor_profiles
set public_presence = '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb
where public_presence is null;

alter table public.actor_profiles
  alter column public_presence set default '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb;

alter table public.actor_profiles
  alter column public_presence set not null;

alter table public.galleries
  add column if not exists public_presence jsonb;

update public.galleries
set public_presence = '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb
where public_presence is null;

alter table public.galleries
  alter column public_presence set default '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb;

alter table public.galleries
  alter column public_presence set not null;

alter table public.collector_profiles
  add column if not exists anonymous_on_public boolean not null default false;

alter table public.artists
  add column if not exists website text;

alter table public.artists
  add column if not exists instagram text;

-- Readable on public artist pages (actor_profiles RLS is owner-only).
alter table public.artists
  add column if not exists public_presence jsonb;

update public.artists
set public_presence = '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb
where public_presence is null;

alter table public.artists
  alter column public_presence set default '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb;

alter table public.artists
  alter column public_presence set not null;

alter table public.collector_profiles
  add column if not exists public_presence jsonb;

update public.collector_profiles
set public_presence = '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb
where public_presence is null;

alter table public.collector_profiles
  alter column public_presence set default '{"profile": true, "ownership": true, "values": true, "location": true}'::jsonb;

alter table public.collector_profiles
  alter column public_presence set not null;

drop policy if exists "artists_update_own" on public.artists;
create policy "artists_update_own"
  on public.artists for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant update on public.artists to authenticated;
