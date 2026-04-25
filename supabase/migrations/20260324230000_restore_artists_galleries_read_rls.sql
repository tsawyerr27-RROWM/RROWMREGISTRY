-- Public read for artists + galleries (registry / artwork / artist pages use anon key).
-- PostgREST embeds artists!artworks_artist_id_fkey(..., galleries(...)) require SELECT
-- on these tables under the same role as public.artworks.

grant usage on schema public to anon, authenticated;
grant select on public.artists to anon, authenticated;
grant select on public.galleries to anon, authenticated;

alter table public.artists enable row level security;
alter table public.galleries enable row level security;

-- Artist directory + artwork embeds: display_name, slug, etc. are public surfaces
drop policy if exists "rrowm_artists_select_public" on public.artists;
create policy "rrowm_artists_select_public"
  on public.artists for select
  to anon, authenticated
  using (true);

-- Public embeds (artists → galleries). Broad read avoids 404 when FK column names differ.
drop policy if exists "rrowm_galleries_select_linked" on public.galleries;
drop policy if exists "rrowm_galleries_select_public" on public.galleries;
create policy "rrowm_galleries_select_public"
  on public.galleries for select
  to anon, authenticated
  using (true);
