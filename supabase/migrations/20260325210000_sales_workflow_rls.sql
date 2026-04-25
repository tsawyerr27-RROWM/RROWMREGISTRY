-- Allow the studio (artist) to complete sale -> ownership workflow.
-- This is required for:
-- - inserting ownership_events from the dashboard ledger
-- - updating value_events.ownership_resolved

alter table public.ownership_events enable row level security;

drop policy if exists "ownership_events_insert_artist_own_artwork" on public.ownership_events;
create policy "ownership_events_insert_artist_own_artwork"
  on public.ownership_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.artworks a
      where a.id = ownership_events.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

-- (Optional but useful) allow artists to update/correct their own ownership ledger entries.
drop policy if exists "ownership_events_update_artist_own_artwork" on public.ownership_events;
create policy "ownership_events_update_artist_own_artwork"
  on public.ownership_events for update
  to authenticated
  using (
    exists (
      select 1 from public.artworks a
      where a.id = ownership_events.artwork_id
        and a.artist_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.artworks a
      where a.id = ownership_events.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

-- value_events: artists must be able to mark ownership_resolved.
alter table public.value_events enable row level security;

drop policy if exists "value_events_update_artist_own_artwork" on public.value_events;
create policy "value_events_update_artist_own_artwork"
  on public.value_events for update
  to authenticated
  using (
    exists (
      select 1 from public.artworks a
      where a.id = value_events.artwork_id
        and a.artist_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.artworks a
      where a.id = value_events.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

