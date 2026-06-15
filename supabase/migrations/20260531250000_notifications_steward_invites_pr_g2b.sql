-- PR-G2b — Steward invite inbox notifications

create or replace function public.resolve_user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = auth, public
as $$
  select u.id
  from auth.users u
  where lower(trim(u.email)) = lower(trim(p_email))
  limit 1;
$$;

comment on function public.resolve_user_id_by_email(text) is
  'Service-only lookup for in-app notifications when an invite recipient already has an account.';

revoke all on function public.resolve_user_id_by_email(text) from public;
grant execute on function public.resolve_user_id_by_email(text) to service_role;

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
      'registry_custody_invite_received'
    )
  );

notify pgrst, 'reload schema';
