-- Legacy prevent_value_event_update() raised on every UPDATE ("cannot be updated"),
-- which ran after enforce_value_event_immutability and blocked allowed updates
-- (e.g. ownership_resolved, in-window edits). Immutability policy lives only in
-- public.enforce_value_event_immutability().

drop trigger if exists value_event_no_update on public.value_events;

drop function if exists public.prevent_value_event_update();
