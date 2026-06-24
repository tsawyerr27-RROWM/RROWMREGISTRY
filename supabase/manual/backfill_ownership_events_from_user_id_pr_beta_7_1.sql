-- PR-BETA.7.1 (optional) — backfill historical NULL from_user_id on accept-linked rows
-- BI trigger only runs on INSERT; rows accepted before BI deploy need manual repair.
-- Bypasses ownership_event_edit_window (15-minute immutability) via session_replication_role.

begin;

set local session_replication_role = replica;

update public.ownership_events oe
set from_user_id = prev.to_user_id
from (
  select oe.id as event_id,
         (
           select p.to_user_id
           from public.ownership_events p
           where p.artwork_id = oe.artwork_id
             and (p.created_at, p.id) < (oe.created_at, oe.id)
           order by p.created_at desc, p.id desc
           limit 1
         ) as to_user_id
  from public.ownership_events oe
  where oe.from_user_id is null
    and oe.provenance_transfer_id is not null
) prev
where oe.id = prev.event_id
  and prev.to_user_id is not null;

commit;

-- Verify:
-- select id, artwork_id, from_user_id, to_user_id, provenance_transfer_id
-- from public.ownership_events
-- where provenance_transfer_id is not null and from_user_id is null;
