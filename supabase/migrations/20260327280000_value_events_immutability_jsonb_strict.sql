-- Stricter immutability: allow updates only when no column changes except
-- ownership_resolved (and updated_at, which may auto-touch on UPDATE).
-- Replaces the narrow declared_value/value_type/currency check in 272600.

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

  if (
    (to_jsonb(new) - 'ownership_resolved' - 'updated_at')
    =
    (to_jsonb(old) - 'ownership_resolved' - 'updated_at')
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

drop trigger if exists trg_enforce_value_event_immutability on public.value_events;

create trigger trg_enforce_value_event_immutability
before update on public.value_events
for each row
execute function public.enforce_value_event_immutability();

comment on function public.enforce_value_event_immutability() is
  'After 15m, block value_events updates unless only ownership_resolved (+ implicit updated_at) differ.';
