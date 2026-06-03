-- Run in Supabase Dashboard → SQL Editor (project must match NEXT_PUBLIC_SUPABASE_URL).
-- Safe to run more than once.
--
-- Verify:
--   select to_regclass('public.artwork_archives');
--   select public.get_artwork_archive_count(id) from public.artworks limit 1;

begin;

create table if not exists public.artwork_archives (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint artwork_archives_artwork_user_key unique (artwork_id, user_id)
);

create index if not exists artwork_archives_user_id_created_idx
  on public.artwork_archives (user_id, created_at desc);

create index if not exists artwork_archives_artwork_id_idx
  on public.artwork_archives (artwork_id);

comment on table public.artwork_archives is
  'Works a participant has placed in their personal archive. Counts are public; membership is private.';

create table if not exists public.archive_events (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.artwork_archives (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists archive_events_archive_id_idx
  on public.archive_events (archive_id, created_at desc);

comment on table public.archive_events is
  'Future: surface record updates to archived works. Not used in v1.';

alter table public.archive_events enable row level security;

drop policy if exists "archive_events_select_own" on public.archive_events;
create policy "archive_events_select_own"
  on public.archive_events for select
  to authenticated
  using (
    exists (
      select 1
      from public.artwork_archives aa
      where aa.id = archive_events.archive_id
        and aa.user_id = auth.uid()
    )
  );

alter table public.artwork_archives enable row level security;

drop policy if exists "artwork_archives_select_own" on public.artwork_archives;
create policy "artwork_archives_select_own"
  on public.artwork_archives for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "artwork_archives_insert_own" on public.artwork_archives;
create policy "artwork_archives_insert_own"
  on public.artwork_archives for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "artwork_archives_delete_own" on public.artwork_archives;
create policy "artwork_archives_delete_own"
  on public.artwork_archives for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.artwork_archives to authenticated;
grant all on public.artwork_archives to service_role;
grant select on public.archive_events to authenticated;
grant all on public.archive_events to service_role;

create or replace function public.get_artwork_archive_count(p_artwork_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.artwork_archives aa
  where aa.artwork_id = p_artwork_id;
$$;

revoke all on function public.get_artwork_archive_count(uuid) from public;
grant execute on function public.get_artwork_archive_count(uuid) to anon, authenticated, service_role;

comment on function public.get_artwork_archive_count(uuid) is
  'Public aggregate: how many participants archived this work. No user list.';

create or replace function public.get_artwork_archive_counts_batch(p_artwork_ids uuid[])
returns table (artwork_id uuid, archive_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select aa.artwork_id, count(*)::bigint as archive_count
  from public.artwork_archives aa
  where aa.artwork_id = any (coalesce(p_artwork_ids, array[]::uuid[]))
  group by aa.artwork_id;
$$;

revoke all on function public.get_artwork_archive_counts_batch(uuid[]) from public;
grant execute on function public.get_artwork_archive_counts_batch(uuid[]) to anon, authenticated, service_role;

notify pgrst, 'reload schema';

commit;
