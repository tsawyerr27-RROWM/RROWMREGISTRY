-- PR-4A.1a — Deal Engine Foundation (tables + RLS)

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  type text not null,
  status text not null,

  -- Participants
  created_by_user_id uuid not null references auth.users (id) on delete cascade,
  participant_a_user_id uuid not null references auth.users (id) on delete cascade,
  participant_b_user_id uuid not null references auth.users (id) on delete cascade,

  -- Optional context
  artwork_id uuid references public.artworks (id) on delete set null,
  gallery_id uuid references public.galleries (id) on delete set null,

  title text,
  terms jsonb not null default '{}'::jsonb,

  constraint deals_type_check check (
    type in ('sale', 'loan', 'consignment', 'exhibition', 'other')
  ),
  constraint deals_status_check check (
    status in ('draft', 'proposed', 'accepted', 'rejected', 'cancelled', 'closed')
  ),
  constraint deals_participants_distinct check (
    participant_a_user_id <> participant_b_user_id
  ),
  constraint deals_participant_includes_creator check (
    created_by_user_id in (participant_a_user_id, participant_b_user_id)
  )
);

create index if not exists deals_participants_idx
  on public.deals (participant_a_user_id, participant_b_user_id, created_at desc);

create index if not exists deals_participant_a_created_idx
  on public.deals (participant_a_user_id, created_at desc);

create index if not exists deals_participant_b_created_idx
  on public.deals (participant_b_user_id, created_at desc);

create index if not exists deals_status_created_idx
  on public.deals (status, created_at desc);

create index if not exists deals_artwork_created_idx
  on public.deals (artwork_id, created_at desc);

create table if not exists public.deal_messages (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint deal_messages_body_length check (char_length(body) <= 4000)
);

create index if not exists deal_messages_deal_created_idx
  on public.deal_messages (deal_id, created_at asc);

create index if not exists deal_messages_sender_created_idx
  on public.deal_messages (sender_user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — participants can access; messages authored by participants only
-- ---------------------------------------------------------------------------
alter table public.deals enable row level security;
alter table public.deal_messages enable row level security;

drop policy if exists deals_select_participants on public.deals;
create policy deals_select_participants
  on public.deals for select
  to authenticated
  using (
    participant_a_user_id = auth.uid()
    or participant_b_user_id = auth.uid()
  );

drop policy if exists deals_insert_participants on public.deals;
create policy deals_insert_participants
  on public.deals for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (participant_a_user_id = auth.uid() or participant_b_user_id = auth.uid())
  );

drop policy if exists deals_update_participants on public.deals;
create policy deals_update_participants
  on public.deals for update
  to authenticated
  using (
    participant_a_user_id = auth.uid()
    or participant_b_user_id = auth.uid()
  )
  with check (
    participant_a_user_id = auth.uid()
    or participant_b_user_id = auth.uid()
  );

-- Deal messages: participants can read; only sender inserts; no updates/deletes
drop policy if exists deal_messages_select_participants on public.deal_messages;
create policy deal_messages_select_participants
  on public.deal_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.deals d
      where d.id = deal_messages.deal_id
        and (d.participant_a_user_id = auth.uid() or d.participant_b_user_id = auth.uid())
    )
  );

drop policy if exists deal_messages_insert_sender on public.deal_messages;
create policy deal_messages_insert_sender
  on public.deal_messages for insert
  to authenticated
  with check (
    sender_user_id = auth.uid()
    and exists (
      select 1
      from public.deals d
      where d.id = deal_messages.deal_id
        and (d.participant_a_user_id = auth.uid() or d.participant_b_user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Notifications: extend type CHECK constraint for deal events
-- ---------------------------------------------------------------------------
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
      'deal_status_changed'
    )
  );

notify pgrst, 'reload schema';

