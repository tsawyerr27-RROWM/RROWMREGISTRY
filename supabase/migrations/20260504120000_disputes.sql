-- Formal disputes / challenges against registry records (ownership, artist, gallery invite).

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text not null,
  status text not null default 'pending',
  resolution text,
  resolved_at timestamptz,
  constraint disputes_target_type_check check (
    target_type in ('ownership', 'artist', 'gallery_relationship')
  ),
  constraint disputes_status_check check (
    status in ('pending', 'under_review', 'resolved', 'rejected')
  )
);

comment on table public.disputes is
  'User-filed challenges; status managed by admins. Do not expose created_by on public surfaces.';

create index if not exists disputes_target_idx
  on public.disputes (target_type, target_id);

create index if not exists disputes_status_created_idx
  on public.disputes (status, created_at desc);

-- At most one open dispute per logical target (pending or under_review).
create unique index if not exists disputes_one_open_per_target
  on public.disputes (target_type, target_id)
  where status in ('pending', 'under_review');

alter table public.disputes enable row level security;

drop policy if exists "disputes_insert_own" on public.disputes;
create policy "disputes_insert_own"
  on public.disputes for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "disputes_select_own" on public.disputes;
create policy "disputes_select_own"
  on public.disputes for select
  to authenticated
  using (created_by = auth.uid());

grant select, insert on public.disputes to authenticated;
grant all on public.disputes to service_role;
