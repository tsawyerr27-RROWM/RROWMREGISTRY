-- Template: tighten RLS for value_events + ownership_events on public reads.
-- Adjust to your schema; anon typically reads rows visible on public registry / artwork pages.

-- Example patterns (uncomment and adapt after auditing existing policies):

-- alter table public.value_events enable row level security;
-- create policy "value_events_select_public_visibility"
--   on public.value_events for select to anon, authenticated
--   using (visibility_level in ('public', 'certificate'));

-- alter table public.ownership_events enable row level security;
-- create policy "ownership_events_select_public"
--   on public.ownership_events for select to anon, authenticated
--   using (true);
