-- Restore public read paths after Supabase security advisor changes.
--
-- Symptom: /registry/..., /artwork/..., etc. return 404 because server pages use the
-- anon key (lib/supabase-server.ts) and public.artwork_read_model is defined with
-- security_invoker = true: RLS on public.artworks and subqueries on public.value_events
-- run as anon/authenticated. If RLS was tightened without matching SELECT policies,
-- queries return no rows → notFound() → 404.
--
-- Run this migration (or paste into SQL Editor) on the affected project.

-- ---------------------------------------------------------------------------
-- Grants (in case SELECT was revoked on base tables)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.artworks to anon, authenticated;
grant select on public.value_events to anon, authenticated;
grant select on public.ownership_events to anon, authenticated;

-- View may already exist from 20260324210000; (re)grant if present
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'artwork_read_model'
  ) then
    execute 'grant select on public.artwork_read_model to anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Row level security + SELECT policies
-- ---------------------------------------------------------------------------
alter table public.artworks enable row level security;
alter table public.value_events enable row level security;
alter table public.ownership_events enable row level security;

drop policy if exists "rrowm_artworks_select_registry" on public.artworks;
create policy "rrowm_artworks_select_registry"
  on public.artworks for select
  to anon, authenticated
  using (true);

-- Public / artwork pages: visibility filter. Dashboard (artist) needs all rows for own works.
drop policy if exists "rrowm_value_events_select_public_surface" on public.value_events;
create policy "rrowm_value_events_select_public_surface"
  on public.value_events for select
  to anon, authenticated
  using (coalesce(visibility_level, '') in ('public', 'certificate'));

drop policy if exists "rrowm_value_events_select_artist_own_artwork" on public.value_events;
create policy "rrowm_value_events_select_artist_own_artwork"
  on public.value_events for select
  to authenticated
  using (
    exists (
      select 1 from public.artworks a
      where a.id = value_events.artwork_id
        and a.artist_id = (select auth.uid())
    )
  );

-- Registry + dashboard load ownership history for an artwork
drop policy if exists "rrowm_ownership_events_select_registry" on public.ownership_events;
create policy "rrowm_ownership_events_select_registry"
  on public.ownership_events for select
  to anon, authenticated
  using (true);
