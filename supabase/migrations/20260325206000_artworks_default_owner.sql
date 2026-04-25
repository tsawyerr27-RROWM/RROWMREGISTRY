-- Ensure the artist is the initial owner by default.
-- - Prevents "Unassigned" for newly created artworks
-- - Keeps provenance clean by aligning base row with initial authorship

-- Backfill existing rows where owner is missing.
update public.artworks
set
  current_owner_id = artist_id,
  test_owner_id = coalesce(test_owner_id, artist_id)
where
  current_owner_id is null
  and artist_id is not null;

-- Trigger: on insert, default owner to artist_id if not provided.
create or replace function public.set_default_owner_on_artwork_insert()
returns trigger
language plpgsql
as $$
begin
  if new.current_owner_id is null then
    new.current_owner_id := new.artist_id;
  end if;
  if new.test_owner_id is null then
    new.test_owner_id := new.artist_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_artworks_default_owner on public.artworks;
create trigger trg_artworks_default_owner
before insert on public.artworks
for each row
execute function public.set_default_owner_on_artwork_insert();

