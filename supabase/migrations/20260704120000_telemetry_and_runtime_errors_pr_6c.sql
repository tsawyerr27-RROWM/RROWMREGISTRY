-- Sprint 6C — Operational hardening: telemetry events + runtime error capture
-- Idempotent + self-healing: safe on clean installs, partial/failed schemas,
-- and repeated reruns.

do $$
begin
  raise notice 'Running migration: 20260704120000 telemetry + runtime errors';
end $$;

-- ---------------------------------------------------------------------------
-- 1) Telemetry events
-- ---------------------------------------------------------------------------
create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null references auth.users(id) on delete set null,
  session_id text null,
  event_name text not null,
  surface text not null,
  actor_role text null,
  metadata jsonb not null default '{}'::jsonb
);

-- Self-heal partially created tables: guarantee every column exists before
-- constraints/indexes reference it (handles reruns after a failed apply).
alter table public.telemetry_events add column if not exists created_at timestamptz default now();
alter table public.telemetry_events add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.telemetry_events add column if not exists session_id text;
alter table public.telemetry_events add column if not exists event_name text;
alter table public.telemetry_events add column if not exists surface text;
alter table public.telemetry_events add column if not exists actor_role text;
alter table public.telemetry_events add column if not exists metadata jsonb default '{}'::jsonb;

-- Backfill nulls before restoring intended NOT NULL constraints.
update public.telemetry_events set event_name = coalesce(event_name, 'unknown') where event_name is null;
update public.telemetry_events set surface = coalesce(surface, 'unknown') where surface is null;
update public.telemetry_events set metadata = '{}'::jsonb where metadata is null;
update public.telemetry_events set created_at = now() where created_at is null;

-- Restore intended constraints + defaults.
alter table public.telemetry_events alter column created_at set default now();
alter table public.telemetry_events alter column created_at set not null;
alter table public.telemetry_events alter column event_name set not null;
alter table public.telemetry_events alter column surface set not null;
alter table public.telemetry_events alter column metadata set default '{}'::jsonb;
alter table public.telemetry_events alter column metadata set not null;

create index if not exists telemetry_events_created_idx
  on public.telemetry_events (created_at desc);

create index if not exists telemetry_events_event_idx
  on public.telemetry_events (event_name);

create index if not exists telemetry_events_surface_idx
  on public.telemetry_events (surface);

alter table public.telemetry_events enable row level security;

drop policy if exists "telemetry_events_select_admin" on public.telemetry_events;
create policy "telemetry_events_select_admin"
  on public.telemetry_events for select
  to authenticated
  using (
    exists (
      select 1 from public.artists a
      where a.id = auth.uid()
        and coalesce(a.is_admin, false) = true
    )
  );

drop policy if exists "telemetry_events_insert_none" on public.telemetry_events;
create policy "telemetry_events_insert_none"
  on public.telemetry_events for insert
  to anon, authenticated
  with check (false);

revoke all on table public.telemetry_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Runtime errors
-- ---------------------------------------------------------------------------
create table if not exists public.runtime_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null references auth.users(id) on delete set null,
  surface text null,
  route text null,
  error_name text null,
  message text not null,
  stack text null,
  metadata jsonb not null default '{}'::jsonb
);

-- Self-heal partially created tables: guarantee every column exists before
-- constraints/indexes reference it (handles reruns after a failed apply).
alter table public.runtime_errors add column if not exists created_at timestamptz default now();
alter table public.runtime_errors add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.runtime_errors add column if not exists surface text;
alter table public.runtime_errors add column if not exists route text;
alter table public.runtime_errors add column if not exists error_name text;
alter table public.runtime_errors add column if not exists message text;
alter table public.runtime_errors add column if not exists stack text;
alter table public.runtime_errors add column if not exists metadata jsonb default '{}'::jsonb;

-- Backfill nulls before restoring intended NOT NULL constraints.
update public.runtime_errors set message = coalesce(message, 'unknown') where message is null;
update public.runtime_errors set metadata = '{}'::jsonb where metadata is null;
update public.runtime_errors set created_at = now() where created_at is null;

-- Restore intended constraints + defaults.
alter table public.runtime_errors alter column created_at set default now();
alter table public.runtime_errors alter column created_at set not null;
alter table public.runtime_errors alter column message set not null;
alter table public.runtime_errors alter column metadata set default '{}'::jsonb;
alter table public.runtime_errors alter column metadata set not null;

create index if not exists runtime_errors_created_idx
  on public.runtime_errors (created_at desc);

create index if not exists runtime_errors_surface_idx
  on public.runtime_errors (surface);

alter table public.runtime_errors enable row level security;

drop policy if exists "runtime_errors_select_admin" on public.runtime_errors;
create policy "runtime_errors_select_admin"
  on public.runtime_errors for select
  to authenticated
  using (
    exists (
      select 1 from public.artists a
      where a.id = auth.uid()
        and coalesce(a.is_admin, false) = true
    )
  );

drop policy if exists "runtime_errors_insert_none" on public.runtime_errors;
create policy "runtime_errors_insert_none"
  on public.runtime_errors for insert
  to anon, authenticated
  with check (false);

revoke all on table public.runtime_errors from anon, authenticated;
