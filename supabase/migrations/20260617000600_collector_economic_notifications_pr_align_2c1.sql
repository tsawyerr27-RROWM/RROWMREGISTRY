-- PR-ALIGN.2c.1: collector economic prestige stats + execution notification types

create or replace function public.get_collector_economic_stats(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer uuid;
  v_public boolean;
  v_acquisitions int;
  v_transfers int;
begin
  v_viewer := auth.uid();

  select cp.is_public
  into v_public
  from public.collector_profiles cp
  where cp.user_id = p_user_id;

  if v_viewer is distinct from p_user_id then
    if not coalesce(v_public, false) then
      raise exception 'Not authorized'
        using errcode = '42501';
    end if;
  end if;

  select count(*)::int
  into v_acquisitions
  from public.provenance_transfers pt
  where pt.recipient_user_id = p_user_id
    and pt.status = 'completed';

  select count(*)::int
  into v_transfers
  from public.provenance_transfers pt
  where pt.from_user_id = p_user_id
    and pt.status = 'completed';

  return jsonb_build_object(
    'acquisition_count', coalesce(v_acquisitions, 0),
    'completed_transfer_count', coalesce(v_transfers, 0)
  );
end;
$$;

comment on function public.get_collector_economic_stats(uuid) is
  'Public collector economic footprint: completed acquisitions received and continuity transfers recorded.';

revoke all on function public.get_collector_economic_stats(uuid) from public;
grant execute on function public.get_collector_economic_stats(uuid) to anon, authenticated;

alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'opportunity_application_received',
      'opportunity_shortlisted',
      'opportunity_selected',
      'opportunity_rejected',
      'registry_verification_approved',
      'registry_certificate_issued',
      'registry_amendment_requested',
      'registry_transfer_recorded',
      'registry_authorship_invite_received',
      'registry_custody_invite_received',
      'deal_message_received',
      'deal_status_changed',
      'deal_execution_recorded',
      'representation_relationship_activated',
      'provenance_exhibition_recorded'
    )
  );

notify pgrst, 'reload schema';
