-- PR-ALIGN.2c.3 — canonical deal execution state table

create table if not exists public.deal_execution_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deal_id uuid not null references public.deals (id) on delete cascade,
  kind text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,

  constraint deal_execution_records_kind_check check (
    kind in ('transfer', 'evidence', 'relationship')
  ),
  constraint deal_execution_records_status_check check (
    status in ('pending', 'recorded', 'completed', 'cancelled', 'expired')
  ),
  constraint deal_execution_records_deal_id_key unique (deal_id)
);

comment on table public.deal_execution_records is
  'Canonical per-deal execution state (transfer, evidence, relationship).';

create index if not exists deal_execution_records_deal_id_idx
  on public.deal_execution_records (deal_id);

create index if not exists deal_execution_records_kind_status_idx
  on public.deal_execution_records (kind, status, updated_at desc);

alter table public.deal_execution_records enable row level security;

drop policy if exists deal_execution_records_select_participants
  on public.deal_execution_records;
create policy deal_execution_records_select_participants
  on public.deal_execution_records for select
  to authenticated
  using (
    exists (
      select 1
      from public.deals d
      where d.id = deal_execution_records.deal_id
        and (
          d.participant_a_user_id = auth.uid()
          or d.participant_b_user_id = auth.uid()
        )
    )
  );

drop policy if exists deal_execution_records_insert_participants
  on public.deal_execution_records;
create policy deal_execution_records_insert_participants
  on public.deal_execution_records for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.deals d
      where d.id = deal_execution_records.deal_id
        and (
          d.participant_a_user_id = auth.uid()
          or d.participant_b_user_id = auth.uid()
        )
    )
  );

drop policy if exists deal_execution_records_update_participants
  on public.deal_execution_records;
create policy deal_execution_records_update_participants
  on public.deal_execution_records for update
  to authenticated
  using (
    exists (
      select 1
      from public.deals d
      where d.id = deal_execution_records.deal_id
        and (
          d.participant_a_user_id = auth.uid()
          or d.participant_b_user_id = auth.uid()
        )
    )
  )
  with check (
    exists (
      select 1
      from public.deals d
      where d.id = deal_execution_records.deal_id
        and (
          d.participant_a_user_id = auth.uid()
          or d.participant_b_user_id = auth.uid()
        )
    )
  );

grant select, insert, update on public.deal_execution_records to authenticated;
grant all on public.deal_execution_records to service_role;

notify pgrst, 'reload schema';
