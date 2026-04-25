-- Marks linked value_events row when ownership_events is inserted with value_event_id.
-- No session_replication_role bypass — immutability exception lives on value_events
-- (see 20260327260000_value_events_immutability_ownership_resolved.sql).

create or replace function public.resolve_sale_on_ownership()
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
  'After ownership_events insert with value_event_id, set value_events.ownership_resolved.';
