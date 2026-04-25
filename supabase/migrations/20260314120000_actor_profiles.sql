-- Explicit actor role per authenticated user (scales: artist / gallery / collector).
-- Run in Supabase SQL Editor or via `supabase db push` after linking the project.

create table if not exists public.actor_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('artist', 'gallery', 'collector')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists actor_profiles_role_idx on public.actor_profiles (role);

alter table public.actor_profiles enable row level security;

create policy "actor_profiles_select_own"
  on public.actor_profiles for select
  using (auth.uid() = user_id);

create policy "actor_profiles_insert_own"
  on public.actor_profiles for insert
  with check (auth.uid() = user_id);

create policy "actor_profiles_update_own"
  on public.actor_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "actor_profiles_delete_own"
  on public.actor_profiles for delete
  using (auth.uid() = user_id);

-- Optional: tie a gallery row to the logged-in owner once you add workflows.
-- Uncomment when `public.galleries` exists and you want owner scoping:
-- alter table public.galleries add column if not exists owner_user_id uuid references auth.users (id);
-- create index if not exists galleries_owner_user_id_idx on public.galleries (owner_user_id);
