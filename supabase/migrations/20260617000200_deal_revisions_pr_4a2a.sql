-- PR-4A.2a — Deal revisions + negotiation statuses

-- Expand deal status constraint
alter table public.deals drop constraint if exists deals_type_check;
alter table public.deals drop constraint if exists deals_status_check;

alter table public.deals
  add constraint deals_type_check check (
    type in (
      'sale',
      'loan',
      'consignment',
      'exhibition',
      'other',
      'commission',
      'acquisition',
      'representation',
      'licensing',
      'collaboration'
    )
  );

alter table public.deals
  add constraint deals_status_check check (
    status in (
      'draft',
      'proposed',
      'under_review',
      'countered',
      'accepted',
      'rejected',
      'cancelled',
      'closed'
    )
  );

create table if not exists public.deal_revisions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  revision_number int not null,
  created_by_user_id uuid not null references auth.users (id) on delete cascade,
  terms jsonb not null default '{}'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  constraint deal_revisions_number_positive check (revision_number > 0),
  constraint deal_revisions_deal_number_unique unique (deal_id, revision_number)
);

create index if not exists deal_revisions_deal_number_idx
  on public.deal_revisions (deal_id, revision_number desc);

alter table public.deal_revisions enable row level security;

drop policy if exists deal_revisions_select_participants on public.deal_revisions;
create policy deal_revisions_select_participants
  on public.deal_revisions for select
  to authenticated
  using (
    exists (
      select 1
      from public.deals d
      where d.id = deal_revisions.deal_id
        and (d.participant_a_user_id = auth.uid() or d.participant_b_user_id = auth.uid())
    )
  );

drop policy if exists deal_revisions_insert_participants on public.deal_revisions;
create policy deal_revisions_insert_participants
  on public.deal_revisions for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and exists (
      select 1
      from public.deals d
      where d.id = deal_revisions.deal_id
        and (d.participant_a_user_id = auth.uid() or d.participant_b_user_id = auth.uid())
    )
  );

notify pgrst, 'reload schema';
