-- Nuclear reset: remove duplicate/stale immutability triggers & functions on value_events.
-- Other triggers (e.g. trg_value_events AFTER INSERT) are NOT dropped.
--
-- Debug (run in SQL Editor before/after):
--
--   select tgname, tgfoid::regprocedure, tgenabled
--   from pg_trigger
--   where tgrelid = 'public.value_events'::regclass
--     and not tgisinternal;
--
--   select p.proname, p.oid, p.prosrc
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname ilike '%value_event%'
--   order by p.proname;

-- ---------------------------------------------------------------------------
-- Step 1 — Drop immutability functions (CASCADE removes triggers that use them)
-- ---------------------------------------------------------------------------
drop function if exists public.enforce_value_event_immutability() cascade;
drop function if exists public.enforce_value_event_edit_window() cascade;
drop function if exists public.enforce_value_events_edit_window() cascade;
drop function if exists public.enforce_value_events_immutability() cascade;

-- ---------------------------------------------------------------------------
-- Step 2 — Drop known immutability trigger names (idempotent; catches odd DB state)
-- ---------------------------------------------------------------------------
drop trigger if exists trg_enforce_value_event_immutability on public.value_events;
drop trigger if exists trg_enforce_value_event_edit_window on public.value_events;
drop trigger if exists trg_enforce_value_events_edit_window on public.value_events;
drop trigger if exists trg_enforce_value_events_immutability on public.value_events;

-- Any remaining trigger on value_events pointing at an enforce* / immutability proc
-- (e.g. renamed trigger or function not in the DROP list above).
do $$
declare
  r record;
begin
  for r in
    select t.tgname
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace n on n.oid = p.pronamespace
    where c.oid = 'public.value_events'::regclass
      and not t.tgisinternal
      and n.nspname = 'public'
      and (
        p.proname ilike 'enforce%value%event%'
        or p.proname ilike '%value%event%immut%'
        or p.proname ilike '%value%event%edit%window%'
      )
      and p.proname not ilike '%sale_intent%'
  loop
    execute format('drop trigger if exists %I on public.value_events', r.tgname);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Step 3 — Single canonical function
-- ---------------------------------------------------------------------------
create function public.enforce_value_event_immutability()
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

-- ---------------------------------------------------------------------------
-- Step 4 — Single BEFORE UPDATE immutability trigger
-- ---------------------------------------------------------------------------
create trigger trg_enforce_value_event_immutability
before update on public.value_events
for each row
execute function public.enforce_value_event_immutability();

comment on function public.enforce_value_event_immutability() is
  'After 15m, block updates unless only ownership_resolved (+implicit updated_at) differ.';

-- Verify (SQL Editor): expect trg_enforce_value_event_immutability plus any non-immut triggers
-- such as trg_value_events_sale_intent (AFTER INSERT only):
--
--   select tgname, tgfoid::regprocedure
--   from pg_trigger
--   where tgrelid = 'public.value_events'::regclass
--     and not tgisinternal
--   order by tgname;
