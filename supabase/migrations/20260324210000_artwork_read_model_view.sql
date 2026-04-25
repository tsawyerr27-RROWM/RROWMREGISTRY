-- artwork_read_model: read-only projection of public.artworks.
--
-- verification_status and all other columns stored on public.artworks always match
-- the read surface (no separate copy that can drift). Derived list metrics are
-- computed from value_events and ownership_events when not present on artworks.
--
-- If this migration fails with "column name ... specified more than once", your
-- public.artworks table already includes one of: latest_value, latest_currency,
-- initial_value, initial_currency, ownership_transfer_count, first_transfer_at,
-- latest_transfer_at. In that case replace the view body with:
--   SELECT * FROM public.artworks;
--
-- Drops an existing relation named artwork_read_model (legacy table or view).
-- Data must live on public.artworks; do not rely on a duplicated read-model table.

drop view if exists public.artwork_read_model cascade;
drop table if exists public.artwork_read_model cascade;

create view public.artwork_read_model
with (security_invoker = true)
as
select
  a.*,
  lv.declared_value as latest_value,
  lv.currency as latest_currency,
  iv.declared_value as initial_value,
  iv.currency as initial_currency,
  oc.cnt as ownership_transfer_count,
  oc.first_at as first_transfer_at,
  oc.last_at as latest_transfer_at
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
    and ve.value_type = 'initial'
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
) oc on true;

comment on view public.artwork_read_model is
  'Read model for API/pages: base row is public.artworks (source of truth for verification_status); value/ownership columns are derived from events.';

grant select on public.artwork_read_model to anon, authenticated;
