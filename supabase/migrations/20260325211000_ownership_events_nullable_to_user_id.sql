-- Allow recording a sale with an unknown buyer.
-- Some deployments have ownership_events.to_user_id as NOT NULL; the sale workflow
-- supports an "unknown buyer" placeholder which requires NULL.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'to_user_id'
  ) then
    execute 'alter table public.ownership_events alter column to_user_id drop not null';
  end if;
end $$;

