-- PR-4B.1a — licensing deal model & rights ledger

create table if not exists public.rights_licenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  deal_id uuid references public.deals (id) on delete set null,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  licensor_user_id uuid not null references auth.users (id) on delete cascade,
  licensee_user_id uuid not null references auth.users (id) on delete cascade,

  status text not null default 'active',
  usage_type text not null,
  territory text not null,
  exclusivity text not null default 'nonexclusive',
  starts_at date not null,
  ends_at date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,

  constraint rights_licenses_status_check check (
    status in ('active', 'expired', 'revoked')
  ),
  constraint rights_licenses_usage_type_check check (
    usage_type in (
      'editorial',
      'commercial',
      'merchandising',
      'publishing',
      'digital',
      'custom'
    )
  ),
  constraint rights_licenses_exclusivity_check check (
    exclusivity in ('exclusive', 'nonexclusive')
  ),
  constraint rights_licenses_participants_distinct check (
    licensor_user_id <> licensee_user_id
  )
);

comment on table public.rights_licenses is
  'Canonical rights licenses filed from accepted licensing deals.';

create unique index if not exists rights_licenses_one_active_per_deal
  on public.rights_licenses (deal_id)
  where deal_id is not null and status = 'active';

create index if not exists rights_licenses_artwork_idx
  on public.rights_licenses (artwork_id, status, starts_at desc);

create index if not exists rights_licenses_licensor_idx
  on public.rights_licenses (licensor_user_id, status, starts_at desc);

create index if not exists rights_licenses_licensee_idx
  on public.rights_licenses (licensee_user_id, status, starts_at desc);

alter table public.rights_licenses enable row level security;

drop policy if exists rights_licenses_select_participant on public.rights_licenses;
create policy rights_licenses_select_participant
  on public.rights_licenses for select
  to authenticated
  using (
    licensor_user_id = auth.uid()
    or licensee_user_id = auth.uid()
    or (
      deal_id is not null
      and exists (
        select 1
        from public.deals d
        where d.id = rights_licenses.deal_id
          and (
            d.participant_a_user_id = auth.uid()
            or d.participant_b_user_id = auth.uid()
          )
      )
    )
  );

drop policy if exists rights_licenses_insert_participant on public.rights_licenses;
create policy rights_licenses_insert_participant
  on public.rights_licenses for insert
  to authenticated
  with check (
    deal_id is not null
    and exists (
      select 1
      from public.deals d
      where d.id = rights_licenses.deal_id
        and (
          d.participant_a_user_id = auth.uid()
          or d.participant_b_user_id = auth.uid()
        )
    )
  );

grant select, insert on public.rights_licenses to authenticated;
grant all on public.rights_licenses to service_role;

-- Extend canonical execution kinds
alter table public.deal_execution_records
  drop constraint if exists deal_execution_records_kind_check;

alter table public.deal_execution_records
  add constraint deal_execution_records_kind_check check (
    kind in ('transfer', 'evidence', 'relationship', 'rights_activation')
  );

notify pgrst, 'reload schema';
