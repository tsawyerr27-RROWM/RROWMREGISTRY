-- Extend artwork_read_model with certificate status so the dashboard can show
-- the truth (certificate exists / revoked) instead of assuming every verified
-- artwork has a certificate.

create or replace view public.artwork_read_model
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
  oc.last_at as latest_transfer_at,
  (c.id is not null) as has_certificate,
  coalesce(c.revoked, false) as certificate_revoked,
  c.revoked_reason as certificate_revoked_reason,
  c.issued_at as certificate_issued_at
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
) oc on true
left join lateral (
  select cc.id, cc.revoked, cc.revoked_reason, cc.issued_at
  from public.certificates cc
  where cc.artwork_id = a.id
  order by cc.issued_at desc nulls last
  limit 1
) c on true;

grant select on public.artwork_read_model to anon, authenticated;

