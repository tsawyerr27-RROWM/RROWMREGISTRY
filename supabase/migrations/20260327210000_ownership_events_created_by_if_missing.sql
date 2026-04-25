-- Deployments that skipped 20260326120000 may lack created_by; PostgREST PGRST204 otherwise.

alter table public.ownership_events
  add column if not exists created_by uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_created_by_fkey'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_created_by_fkey
      foreign key (created_by) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then
    null;
end $$;
