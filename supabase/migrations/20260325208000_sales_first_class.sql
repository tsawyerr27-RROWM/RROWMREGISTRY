-- Sales as first-class events:
-- - Detect sale-like value_events and create a sale_intent (unresolved workflow signal)
-- - Link ownership_events <-> value_events via ownership_events.value_event_id
-- - Keep changes additive (columns are added if missing)

-- ---------------------------------------------------------------------------
-- Value events: resolved flag
-- ---------------------------------------------------------------------------
alter table public.value_events
  add column if not exists ownership_resolved boolean not null default false;

-- ---------------------------------------------------------------------------
-- Ownership events: ensure linking + sale metadata columns exist
-- ---------------------------------------------------------------------------
alter table public.ownership_events
  add column if not exists transfer_type text,
  add column if not exists note text,
  add column if not exists from_owner_id uuid,
  add column if not exists to_owner_id uuid,
  add column if not exists value_event_id uuid,
  add column if not exists sale_type text,
  add column if not exists sale_price numeric,
  add column if not exists sale_currency text,
  add column if not exists sale_date timestamptz,
  add column if not exists owner_visibility text,
  add column if not exists owner_name text,
  add column if not exists owner_location text;

do $$
begin
  -- FK is optional (keeps deployments flexible); create when possible.
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_value_event_id_fkey'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_value_event_id_fkey
      foreign key (value_event_id) references public.value_events (id)
      on delete set null;
  end if;
exception
  when undefined_table then
    -- value_events may not exist in some environments; ignore.
    null;
end $$;

create index if not exists ownership_events_artwork_id_created_at_idx
  on public.ownership_events (artwork_id, created_at);

create index if not exists ownership_events_value_event_id_idx
  on public.ownership_events (value_event_id);

-- ---------------------------------------------------------------------------
-- Sale intents: unresolved sale -> "complete transfer" workflow
-- ---------------------------------------------------------------------------
create table if not exists public.sale_intents (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  value_event_id uuid not null references public.value_events (id) on delete cascade,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  unique (value_event_id)
);

create index if not exists sale_intents_artwork_id_unresolved_idx
  on public.sale_intents (artwork_id)
  where resolved_at is null;

alter table public.sale_intents enable row level security;

drop policy if exists "sale_intents_select_artist" on public.sale_intents;
create policy "sale_intents_select_artist"
  on public.sale_intents for select
  to authenticated
  using (
    exists (
      select 1 from public.artworks a
      where a.id = sale_intents.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

drop policy if exists "sale_intents_insert_artist" on public.sale_intents;
create policy "sale_intents_insert_artist"
  on public.sale_intents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.artworks a
      where a.id = sale_intents.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

drop policy if exists "sale_intents_update_artist" on public.sale_intents;
create policy "sale_intents_update_artist"
  on public.sale_intents for update
  to authenticated
  using (
    exists (
      select 1 from public.artworks a
      where a.id = sale_intents.artwork_id
        and a.artist_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.artworks a
      where a.id = sale_intents.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Trigger: when a sale-like value event is inserted, create an unresolved intent
-- ---------------------------------------------------------------------------
create or replace function public.on_value_event_sale_intent()
returns trigger
language plpgsql
as $$
begin
  if new.value_type in ('sale', 'auction', 'primary_sale', 'secondary_sale')
     and coalesce(new.ownership_resolved, false) = false then
    insert into public.sale_intents (artwork_id, value_event_id)
    values (new.artwork_id, new.id)
    on conflict (value_event_id) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists trg_value_events_sale_intent on public.value_events;
create trigger trg_value_events_sale_intent
after insert on public.value_events
for each row
execute function public.on_value_event_sale_intent();

