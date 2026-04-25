-- Run this in Supabase Dashboard → SQL Editor (same DB as your app / .env.local).
-- Safe to run more than once.
--
-- After success, PostgREST reloads so the API sees the new column.

begin;

alter table public.artists
  add column if not exists studio_artworks_accent text;

update public.artists
set studio_artworks_accent = 'violet'
where studio_artworks_accent is null;

alter table public.artists
  alter column studio_artworks_accent set default 'violet';

alter table public.artists
  alter column studio_artworks_accent set not null;

alter table public.artists
  drop constraint if exists artists_studio_artworks_accent_check;

alter table public.artists
  add constraint artists_studio_artworks_accent_check
  check (
    studio_artworks_accent in (
      'violet',
      'emerald',
      'blue',
      'amber',
      'rose',
      'slate'
    )
  );

comment on column public.artists.studio_artworks_accent is
  'Studio Artworks section accent (UI): violet|emerald|blue|amber|rose|slate';

commit;

notify pgrst, 'reload schema';
