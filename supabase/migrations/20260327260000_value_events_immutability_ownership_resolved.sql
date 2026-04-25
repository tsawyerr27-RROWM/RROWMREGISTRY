-- Value events: immutability after 15 minutes, with an explicit exception for
-- ownership_resolved (sale workflow completion). No trigger bypassing.

create or replace function public.enforce_value_event_immutability()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  -- Allow ONLY ownership_resolved to change (core financial fields unchanged)
  if (
    new.ownership_resolved is distinct from old.ownership_resolved
    and new.declared_value is not distinct from old.declared_value
    and new.value_type is not distinct from old.value_type
    and new.currency is not distinct from old.currency
  ) then
    return new;
  end if;

  if now() > old.created_at + interval '15 minutes' then
    raise exception
      'Edit window expired. Value events become immutable after 15 minutes.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- Avoid double enforcement if an older migration used different names
drop trigger if exists trg_enforce_value_event_immutability on public.value_events;
drop trigger if exists trg_enforce_value_event_edit_window on public.value_events;
drop trigger if exists trg_enforce_value_events_edit_window on public.value_events;

create trigger trg_enforce_value_event_immutability
before update on public.value_events
for each row
execute function public.enforce_value_event_immutability();

comment on function public.enforce_value_event_immutability() is
  'Block value_events updates after 15m except toggling ownership_resolved when amount/type/currency unchanged.';
