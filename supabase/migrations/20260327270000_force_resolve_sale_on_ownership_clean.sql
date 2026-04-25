-- Force-remove any stale resolve_sale_on_ownership() (e.g. session_replication_role).
-- CASCADE drops dependent trigger; we recreate trigger explicitly afterward.
-- Immutability exception for ownership_resolved remains in 20260327260000_*.

drop function if exists public.resolve_sale_on_ownership() cascade;

create function public.resolve_sale_on_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.value_event_id is not null then
    update public.value_events
    set ownership_resolved = true
    where id = new.value_event_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_resolve_sale on public.ownership_events;

create trigger trg_resolve_sale
after insert on public.ownership_events
for each row
execute function public.resolve_sale_on_ownership();

comment on function public.resolve_sale_on_ownership() is
  'After ownership_events insert with value_event_id, set value_events.ownership_resolved (no replication bypass).';

-- ---------------------------------------------------------------------------
-- Verification (run in SQL Editor after migrate; expect one row, prosrc without
-- session_replication_role):
--
--   select p.proname, p.prosrc
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname = 'resolve_sale_on_ownership';
-- ---------------------------------------------------------------------------
