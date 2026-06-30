-- PR-BETA.7 — Backfill genesis ownership_events for legacy artworks with no ledger rows.

-- ---------------------------------------------------------------------------
-- Verification queries (pre-flight / post-flight)
-- ---------------------------------------------------------------------------
-- Artworks with zero ownership_events:
--   select count(*) as artworks_without_ownership_events
--   from public.artworks a
--   where not exists (
--     select 1 from public.ownership_events oe where oe.artwork_id = a.id
--   );
--
-- Cache drift (cached owner set, ledger holder null):
--   select count(*) as cache_drift_rows
--   from public.artworks a
--   where a.current_owner_id is not null
--     and public.get_current_owner(a.id) is null;

-- ---------------------------------------------------------------------------
-- 1) Extend transfer_type check with 'registration' only
-- ---------------------------------------------------------------------------
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
    alter table public.ownership_events
      drop constraint ownership_events_transfer_type_check;
  end if;

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
        'record_correction',
        'registration'
      )
    );
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Registration genesis rows preserve from_user_id = null
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_provenance_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_to_user uuid;
  v_artist uuid;
begin
  if new.transfer_type is null or trim(new.transfer_type) = '' then
    new.transfer_type := 'transfer';
  end if;

  if new.from_user_id is null
     and lower(trim(coalesce(new.transfer_type, ''))) = 'registration'
     and not exists (
       select 1
       from public.ownership_events oe
       where oe.artwork_id = new.artwork_id
     ) then
    new.created_by := coalesce(new.created_by, auth.uid());
    return new;
  end if;

  if new.from_user_id is not null then
    return new;
  end if;

  select oe.to_user_id
  into p_to_user
  from public.ownership_events oe
  where oe.artwork_id = new.artwork_id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  if found and p_to_user is not null then
    new.from_user_id := p_to_user;
  else
    select a.artist_id into v_artist
    from public.artworks a
    where a.id = new.artwork_id
    limit 1;
    new.from_user_id := v_artist;
  end if;

  new.created_by := coalesce(new.created_by, auth.uid());
  return new;
end;
$$;

comment on function public.ownership_events_provenance_before_insert() is
  'Derives from_user_id from prior ledger row; preserves null from_user_id for registration genesis rows.';

-- ---------------------------------------------------------------------------
-- 3) Idempotent backfill — artworks with zero ownership_events only
-- ---------------------------------------------------------------------------
insert into public.ownership_events (
  artwork_id,
  transfer_type,
  from_user_id,
  to_user_id,
  created_by,
  notes,
  verification_status,
  created_at
)
select
  a.id,
  'registration',
  null,
  coalesce(a.current_owner_id, a.artist_id),
  coalesce(a.artist_id, a.current_owner_id),
  'Backfilled genesis ownership event (PR-BETA.7)',
  'recorded',
  coalesce(a.created_at, now())
from public.artworks a
where coalesce(a.current_owner_id, a.artist_id) is not null
  and not exists (
    select 1
    from public.ownership_events oe
    where oe.artwork_id = a.id
  );

-- ---------------------------------------------------------------------------
-- 4) Post-migration verification (NOTICE for migration logs)
-- ---------------------------------------------------------------------------
do $$
declare
  v_zero_events bigint;
  v_cache_drift bigint;
begin
  select count(*)
  into v_zero_events
  from public.artworks a
  where not exists (
    select 1 from public.ownership_events oe where oe.artwork_id = a.id
  );

  select count(*)
  into v_cache_drift
  from public.artworks a
  where a.current_owner_id is not null
    and public.get_current_owner(a.id) is null;

  raise notice 'PR-BETA.7 genesis backfill: artworks_with_zero_ownership_events=%', v_zero_events;
  raise notice 'PR-BETA.7 genesis backfill: cache_drift_current_owner_without_ledger=%', v_cache_drift;
end $$;

notify pgrst, 'reload schema';
