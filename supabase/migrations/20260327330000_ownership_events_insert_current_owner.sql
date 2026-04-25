-- Allow the on-platform current owner (e.g. collector) to append ownership_events,
-- alongside existing artist policy. Enables Collector Studio sale / transfer flows.

drop policy if exists "ownership_events_insert_current_owner" on public.ownership_events;

create policy "ownership_events_insert_current_owner"
  on public.ownership_events for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.artworks a
      where a.id = ownership_events.artwork_id
        and a.current_owner_id is not null
        and a.current_owner_id = (select auth.uid())
    )
  );

comment on policy "ownership_events_insert_current_owner" on public.ownership_events is
  'Current on-platform owner may record transfers (collector studio / owner workflow).';
