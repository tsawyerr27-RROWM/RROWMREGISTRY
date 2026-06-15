-- PR-N1 — Notification infrastructure (in-app inbox foundation)

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (
    type in (
      'opportunity_application_received',
      'opportunity_shortlisted',
      'opportunity_selected',
      'opportunity_rejected',
      'registry_verification_approved',
      'registry_certificate_issued',
      'registry_amendment_requested',
      'registry_transfer_recorded'
    )
  ),
  constraint notifications_title_length check (char_length(title) <= 240),
  constraint notifications_body_length check (char_length(body) <= 4000)
);

comment on table public.notifications is
  'Participant inbox items — quiet, event-driven updates. Not chat or social alerts.';

comment on column public.notifications.metadata is
  'Structured context for deep links (opportunity_id, artwork_id, registry_id, etc.).';

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_user_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_user_id, created_at desc)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- RLS — recipients read and mark read; inserts via service role only
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (recipient_user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications
  for update
  to authenticated
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());

grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;

notify pgrst, 'reload schema';
