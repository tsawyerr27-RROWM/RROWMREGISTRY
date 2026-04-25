-- Same shape as 20260326120000 — for DBs that never ran full provenance v2.
-- Stops PGRST204 on inserts that send location / notes / from_user_id.

alter table public.ownership_events
  add column if not exists from_user_id uuid;

alter table public.ownership_events
  add column if not exists notes text,
  add column if not exists location text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_from_user_id_fkey'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_from_user_id_fkey
      foreign key (from_user_id) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then
    null;
end $$;

-- Do not UPDATE rows here: enforce_ownership_event_edit_window() blocks edits after 15 minutes.
-- If you need notes backfilled from note, run a one-off as a superuser with that trigger
-- disabled, or only on rows inside the edit window.
