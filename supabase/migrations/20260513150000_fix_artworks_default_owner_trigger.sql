-- prelaunch_consolidation dropped artworks.test_owner_id but left the insert trigger
-- referencing NEW.test_owner_id → 42703 on any artwork insert (including institution catalogue).

create or replace function public.set_default_owner_on_artwork_insert()
returns trigger
language plpgsql
as $$
begin
  if new.current_owner_id is null and new.artist_id is not null then
    new.current_owner_id := new.artist_id;
  end if;
  return new;
end;
$$;

comment on function public.set_default_owner_on_artwork_insert() is
  'Before insert: default current_owner_id from artist_id when present. Institution-filed rows with null artist_id rely on ownership_events sync.';
