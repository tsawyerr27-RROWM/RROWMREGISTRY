-- Optional: retrospectively add an "initial owner = artist" ownership event
-- for artworks that have NO ownership_events yet.
--
-- This migration adapts to differing ownership_events column names.

do $$
declare
  owner_to_col text;
  transfer_type_col text;
  note_col text;
  sql text;
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ownership_events'
  ) then
    return;
  end if;

  -- Which column stores the "to owner"?
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'to_owner_id'
  ) then
    owner_to_col := 'to_owner_id';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'to_owner'
  ) then
    owner_to_col := 'to_owner';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'owner_id'
  ) then
    owner_to_col := 'owner_id';
  else
    owner_to_col := null;
  end if;

  -- Which column stores event type?
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'transfer_type'
  ) then
    transfer_type_col := 'transfer_type';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'type'
  ) then
    transfer_type_col := 'type';
  else
    transfer_type_col := null;
  end if;

  -- Optional note column
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'note'
  ) then
    note_col := 'note';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ownership_events' and column_name = 'description'
  ) then
    note_col := 'description';
  else
    note_col := null;
  end if;

  if owner_to_col is null then
    -- Can't write an owner event if we don't know which column stores owner.
    return;
  end if;

  sql := 'insert into public.ownership_events (artwork_id';
  if transfer_type_col is not null then
    sql := sql || ', ' || transfer_type_col;
  end if;
  sql := sql || ', ' || owner_to_col;
  if note_col is not null then
    sql := sql || ', ' || note_col;
  end if;
  sql := sql || ')
select a.id';
  if transfer_type_col is not null then
    sql := sql || ', ''initial''';
  end if;
  sql := sql || ', a.artist_id';
  if note_col is not null then
    sql := sql || ', ''Backfilled initial ownership (artist)''';
  end if;
  sql := sql || '
from public.artworks a
where a.artist_id is not null
  and not exists (
    select 1 from public.ownership_events oe where oe.artwork_id = a.id
  );';

  execute sql;
end $$;

