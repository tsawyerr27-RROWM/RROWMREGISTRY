-- PR-BETA.5c — Ownership loop completion (notifications + recipient transfer visibility)

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
      'provenance_exhibition_recorded',
      'ownership_claim_required',
      'ownership_confirmation_required',
      'ownership_transfer_completed'
    )
  );

-- Recipients can read pending transfers addressed to them (collector pending acquisition UI).
drop policy if exists "provenance_transfers_select_recipient" on public.provenance_transfers;
create policy "provenance_transfers_select_recipient"
  on public.provenance_transfers for select
  to authenticated
  using (recipient_user_id = auth.uid());

notify pgrst, 'reload schema';
