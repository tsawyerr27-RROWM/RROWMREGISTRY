-- Expand ownership_events.transfer_type allowed values to include sales workflow.
-- Fixes: ownership_events_transfer_type_check violation when inserting 'sale' / 'collector_claim'.

do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'ownership_events'
      and c.conname = 'ownership_events_transfer_type_check'
  ) then
    execute 'alter table public.ownership_events drop constraint ownership_events_transfer_type_check';
  end if;

  -- Keep this list conservative and explicit; add more as you formalize enums.
  execute $ct$
    alter table public.ownership_events
      add constraint ownership_events_transfer_type_check
      check (
        transfer_type in (
          'initial',
          'mint',
          'transfer',
          'ownership_transfer',
          'sale',
          'auction',
          'collector_claim',
          'correction',
          'record_correction'
        )
      )
  $ct$;
end $$;

