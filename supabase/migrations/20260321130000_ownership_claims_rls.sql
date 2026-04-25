-- ownership_claims: table shape + RLS for collectors (insert) and artists (read/update on own works).
-- Safe to run if policies already exist (drops then recreates).

create table if not exists public.ownership_claims (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  collector_id uuid not null references auth.users (id) on delete cascade,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ownership_claims
  add column if not exists status text default 'pending';

alter table public.ownership_claims
  add column if not exists note text;

alter table public.ownership_claims
  add column if not exists updated_at timestamptz default now();

alter table public.ownership_claims
  drop constraint if exists ownership_claims_status_check;

alter table public.ownership_claims
  add constraint ownership_claims_status_check
  check (status in ('pending', 'approved', 'rejected'));

create index if not exists ownership_claims_artwork_id_idx
  on public.ownership_claims (artwork_id);

create index if not exists ownership_claims_collector_id_idx
  on public.ownership_claims (collector_id);

create index if not exists ownership_claims_status_idx
  on public.ownership_claims (status);

-- At most one pending claim per collector per artwork
create unique index if not exists ownership_claims_one_pending_per_pair
  on public.ownership_claims (artwork_id, collector_id)
  where status = 'pending';

alter table public.ownership_claims enable row level security;

drop policy if exists "ownership_claims_select_artist_or_collector" on public.ownership_claims;
drop policy if exists "ownership_claims_insert_collector" on public.ownership_claims;
drop policy if exists "ownership_claims_update_artist" on public.ownership_claims;

-- Artists see claims on their artworks; collectors see their own claims
create policy "ownership_claims_select_artist_or_collector"
  on public.ownership_claims
  for select
  using (
    collector_id = auth.uid()
    or exists (
      select 1
      from public.artworks a
      where a.id = ownership_claims.artwork_id
        and a.artist_id = auth.uid()
    )
  );

create policy "ownership_claims_insert_collector"
  on public.ownership_claims
  for insert
  with check (
    collector_id = auth.uid()
    and status = 'pending'
  );

create policy "ownership_claims_update_artist"
  on public.ownership_claims
  for update
  using (
    exists (
      select 1
      from public.artworks a
      where a.id = ownership_claims.artwork_id
        and a.artist_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.artworks a
      where a.id = ownership_claims.artwork_id
        and a.artist_id = auth.uid()
    )
  );
