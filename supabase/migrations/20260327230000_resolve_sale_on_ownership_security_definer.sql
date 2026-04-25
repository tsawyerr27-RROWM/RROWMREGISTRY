-- Ensure sale resolution runs reliably when recording ownership (same as 252090).
-- SECURITY DEFINER: inner UPDATE on value_events runs as function owner so RLS on
-- value_events cannot block the workflow when policies differ by path.
-- NOTE: A BEFORE UPDATE immutability trigger on value_events must still allow
-- changing ownership_resolved (workflow flag); otherwise raise that trigger separately.

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
  'After ownership_events insert with value_event_id, mark linked sale value_event resolved.';
