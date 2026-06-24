-- PR-BETA.5c.1 — Single owner-cache writer + align read model with to_user_id (canonical).
--
-- artwork_read_model: artworks base columns (dynamic, no a.*) + derived metrics.
-- Do NOT append filing_gallery_id (or any artworks column) after the base list —
-- it is already included when present on public.artworks.

-- Remove legacy cache trigger that only synced on verification_status = verified.
-- Prelaunch consolidation established ownership_events INSERT → current_owner_id sync.
drop trigger if exists trg_ownership_events_owner_cache on public.ownership_events;
drop trigger if exists trg_ownership_events_owner_cache_up on public.ownership_events;

-- Rebuild artwork_read_model so ledger_latest_owner_id prefers to_user_id (canonical).
do $$
declare
  owner_to_col text;
  art_cols text;
  sql text;
  derived_cols constant text[] := array[
    'latest_value',
    'latest_currency',
    'initial_value',
    'initial_currency',
    'ownership_transfer_count',
    'first_transfer_at',
    'latest_transfer_at',
    'has_certificate',
    'certificate_revoked',
    'certificate_revoked_reason',
    'certificate_issued_at',
    'ledger_latest_owner_id'
  ];
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'to_user_id'
  ) then
    owner_to_col := 'to_user_id';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'to_owner_id'
  ) then
    owner_to_col := 'to_owner_id';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'to_owner'
  ) then
    owner_to_col := 'to_owner';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'owner_id'
  ) then
    owner_to_col := 'owner_id';
  else
    owner_to_col := null;
  end if;

  select string_agg(format('a.%I', c.column_name), ', ' order by c.ordinal_position)
  into art_cols
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'artworks'
    and c.column_name <> all (derived_cols);

  if art_cols is null or art_cols = '' then
    raise exception 'artwork_read_model rebuild: no columns found on public.artworks';
  end if;

  execute 'drop view if exists public.artwork_read_model cascade';

  sql := '
create view public.artwork_read_model
with (security_invoker = true)
as
select
  ' || art_cols || ',
  lv.declared_value as latest_value,
  lv.currency as latest_currency,
  iv.declared_value as initial_value,
  iv.currency as initial_currency,
  oc.cnt as ownership_transfer_count,
  oc.first_at as first_transfer_at,
  oc.last_at as latest_transfer_at,
  (c.id is not null) as has_certificate,
  coalesce(c.revoked, false) as certificate_revoked,
  c.revoked_reason as certificate_revoked_reason,
  c.issued_at as certificate_issued_at,';

  if owner_to_col is not null then
    sql := sql || '
  lo.' || owner_to_col || ' as ledger_latest_owner_id';
  else
    sql := sql || '
  null::uuid as ledger_latest_owner_id';
  end if;

  sql := sql || '
from public.artworks a
left join lateral (
  select ve.declared_value, ve.currency
  from public.value_events ve
  where ve.artwork_id = a.id
  order by ve.created_at desc
  limit 1
) lv on true
left join lateral (
  select ve.declared_value, ve.currency
  from public.value_events ve
  where ve.artwork_id = a.id
    and ve.value_type = ''initial''
  order by ve.created_at asc
  limit 1
) iv on true
left join lateral (
  select
    count(*)::integer as cnt,
    min(oe.created_at) as first_at,
    max(oe.created_at) as last_at
  from public.ownership_events oe
  where oe.artwork_id = a.id
) oc on true';

  if owner_to_col is not null then
    sql := sql || '
left join lateral (
  select oe.' || owner_to_col || '
  from public.ownership_events oe
  where oe.artwork_id = a.id
  order by oe.created_at desc nulls last, oe.id desc nulls last
  limit 1
) lo on true';
  end if;

  sql := sql || '
left join lateral (
  select cc.id, cc.revoked, cc.revoked_reason, cc.issued_at
  from public.certificates cc
  where cc.artwork_id = a.id
  order by cc.issued_at desc nulls last
  limit 1
) c on true;';

  execute sql;
  execute 'grant select on public.artwork_read_model to anon, authenticated';
end $$;

notify pgrst, 'reload schema';
