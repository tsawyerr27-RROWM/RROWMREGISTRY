-- Allow anon/authenticated reads for legacy value_events rows where visibility_level
-- was never set (NULL), matching public registry / artwork surfaces.
-- Also expose verification_events on public registry when the table exists.

drop policy if exists "rrowm_value_events_select_public_surface" on public.value_events;
create policy "rrowm_value_events_select_public_surface"
  on public.value_events for select
  to anon, authenticated
  using (
    visibility_level is null
    or visibility_level in ('public', 'certificate')
  );

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'verification_events'
  ) then
    execute 'grant select on public.verification_events to anon, authenticated';
    execute 'alter table public.verification_events enable row level security';
    execute 'drop policy if exists rrowm_verification_events_select_registry on public.verification_events';
    execute
      'create policy rrowm_verification_events_select_registry ' ||
      'on public.verification_events for select ' ||
      'to anon, authenticated ' ||
      'using (true)';
  end if;
end $$;
