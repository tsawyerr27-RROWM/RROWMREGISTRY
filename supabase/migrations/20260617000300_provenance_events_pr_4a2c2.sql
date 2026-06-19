-- PR-4A.2c.2: durable provenance evidence events (exhibition milestones, etc.)

create table if not exists public.provenance_events (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  kind text not null,
  metadata jsonb not null default '{}'::jsonb,
  recorded_by_user_id uuid references auth.users (id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint provenance_events_kind_check check (kind in ('evidence'))
);

comment on table public.provenance_events is
  'Append-only provenance milestones (evidence kind) filed against artworks.';

create index if not exists provenance_events_artwork_occurred_idx
  on public.provenance_events (artwork_id, occurred_at desc, id desc);

create index if not exists provenance_events_metadata_deal_id_idx
  on public.provenance_events ((metadata ->> 'deal_id'))
  where (metadata ->> 'deal_id') is not null;

alter table public.provenance_events enable row level security;

drop policy if exists "provenance_events_select_public" on public.provenance_events;
create policy "provenance_events_select_public"
  on public.provenance_events for select
  to anon, authenticated
  using (true);

grant select on public.provenance_events to anon, authenticated;
grant all on public.provenance_events to service_role;
