-- Minimal collector identity for editorial ownership presence (not social).

create table if not exists public.collector_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  slug text not null unique,
  location text,
  bio text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists collector_profiles_slug_idx
  on public.collector_profiles (slug);

alter table public.collector_profiles enable row level security;

create policy "collector_profiles_select_public_or_own"
  on public.collector_profiles for select
  using (is_public = true or user_id = auth.uid());

create policy "collector_profiles_insert_own"
  on public.collector_profiles for insert
  with check (user_id = auth.uid());

create policy "collector_profiles_update_own"
  on public.collector_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- slug helpers
create or replace function public.collector_slugify(input text)
returns text
language sql
immutable
as $$
  select
    case
      when coalesce(trim(input), '') = '' then 'collector'
      else left(
        regexp_replace(
          regexp_replace(lower(trim(input)), '[^a-z0-9]+', '-', 'g'),
          '(^-+)|(-+$)',
          '',
          'g'
        ),
        48
      )
    end
$$;

create or replace function public.collector_profiles_slug_fill()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug :=
      public.collector_slugify(new.display_name) || '-' ||
      left(new.user_id::text, 8);
  end if;
  return new;
end;
$$;

drop trigger if exists collector_profiles_slug_fill on public.collector_profiles;
create trigger collector_profiles_slug_fill
before insert on public.collector_profiles
for each row
execute function public.collector_profiles_slug_fill();

