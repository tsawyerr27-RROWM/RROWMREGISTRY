-- Resolve sale ownership in the database.
-- Any ownership_event inserted with value_event_id will mark that value_event as resolved.

create or replace function public.resolve_sale_on_ownership()
returns trigger
language plpgsql
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

