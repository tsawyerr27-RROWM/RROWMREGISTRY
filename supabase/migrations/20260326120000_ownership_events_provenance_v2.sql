-- Ownership events as a provenance ledger (v2):
-- - Canonical chain: each new row's from_* derives from the latest row's to_* (or artist for first event).
-- - Optional columns: notes, location, created_by; to_user_id remains nullable for external parties.
-- - Sale/auction transfers require value_event_id (enforced in trigger).
-- - Cache: artworks.current_owner_id updated when to_user_id is set (still not source of truth).

-- ---------------------------------------------------------------------------
-- Columns (additive; tolerate legacy names)
-- ---------------------------------------------------------------------------
alter table public.ownership_events
  add column if not exists from_user_id uuid;

alter table public.ownership_events
  add column if not exists notes text,
  add column if not exists location text,
  add column if not exists created_by uuid;

-- Keep note + notes in sync for legacy callers; prefer notes going forward.
do $$
begin
  update public.ownership_events
  set notes = note
  where notes is null
    and note is not null;
exception
  when undefined_column then
    null;
end $$;

-- Ensure to_user_id can be null (external buyers)
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

-- created_at: ensure exists with sane default (many schemas already have it)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'created_at'
  ) then
    alter table public.ownership_events
      add column created_at timestamptz not null default now();
  end if;
end $$;

-- Optional FK to auth.users (best-effort)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_from_user_id_fkey'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_from_user_id_fkey
      foreign key (from_user_id) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then
    null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_created_by_fkey'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_created_by_fkey
      foreign key (created_by) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then
    null;
end $$;

-- transfer_type: sensible default (avoid forcing NOT NULL on legacy rows)
update public.ownership_events
set transfer_type = coalesce(transfer_type, 'transfer')
where transfer_type is null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'transfer_type'
  ) then
    execute 'alter table public.ownership_events alter column transfer_type set default ''transfer''';
  end if;
exception
  when others then
    null;
end $$;

-- Expand transfer_type check constraint
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
          'primary_sale',
          'secondary_sale',
          'gift',
          'donation',
          'inheritance',
          'collector_claim',
          'correction',
          'record_correction'
        )
      )
  $ct$;
exception
  when duplicate_object then
    null;
end $$;

create index if not exists ownership_events_artwork_created_desc_idx
  on public.ownership_events (artwork_id, created_at desc, id desc);

-- ---------------------------------------------------------------------------
-- BEFORE INSERT: chain from_* from latest event; created_by; notes; sale rules
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_provenance_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_to_user uuid;
  p_to_owner uuid;
  p_to_name text;
  p_to_type text;
  v_artist uuid;
  tnorm text;
begin
  if new.transfer_type is null or trim(new.transfer_type) = '' then
    new.transfer_type := 'transfer';
  end if;

  select
    oe.to_user_id,
    oe.to_owner_id,
    oe.to_name,
    oe.to_type
  into
    p_to_user,
    p_to_owner,
    p_to_name,
    p_to_type
  from public.ownership_events oe
  where oe.artwork_id = new.artwork_id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  if found then
    new.from_user_id := coalesce(p_to_user, p_to_owner);
    new.from_name := p_to_name;
    new.from_type := coalesce(nullif(trim(p_to_type), ''), 'artist');
  else
    select a.artist_id into v_artist
    from public.artworks a
    where a.id = new.artwork_id
    limit 1;

    new.from_user_id := v_artist;
    if new.from_name is null or trim(new.from_name) = '' then
      new.from_name := 'Artist';
    end if;
    new.from_type := coalesce(nullif(trim(new.from_type), ''), 'artist');
  end if;

  new.created_by := coalesce(new.created_by, auth.uid());

  tnorm := lower(trim(coalesce(new.transfer_type, '')));
  if tnorm in ('sale', 'auction', 'primary_sale', 'secondary_sale')
     and new.value_event_id is null then
    raise exception 'ownership_events: value_event_id is required for sale-like transfer_type (got %)', new.transfer_type
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ownership_events_provenance_bi on public.ownership_events;
create trigger trg_ownership_events_provenance_bi
before insert on public.ownership_events
for each row
execute function public.ownership_events_provenance_before_insert();

-- ---------------------------------------------------------------------------
-- AFTER INSERT: refresh artwork owner cache when platform user receives work
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_refresh_artwork_owner_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t text;
begin
  if new.to_user_id is not null then
    update public.artworks
    set
      current_owner_id = new.to_user_id,
      test_owner_id = coalesce(new.to_user_id, test_owner_id)
    where id = new.artwork_id;
  else
    t := lower(trim(coalesce(new.transfer_type, '')));
    if t in ('sale', 'auction', 'primary_sale', 'secondary_sale') then
      update public.artworks
      set current_owner_id = null
      where id = new.artwork_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ownership_events_owner_cache on public.ownership_events;
create trigger trg_ownership_events_owner_cache
after insert on public.ownership_events
for each row
execute function public.ownership_events_refresh_artwork_owner_cache();
