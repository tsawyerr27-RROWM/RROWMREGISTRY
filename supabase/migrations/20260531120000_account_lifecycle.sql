-- Enterprise account lifecycle: soft delete, audit log, data export, registry-safe anonymisation.

-- ---------------------------------------------------------------------------
-- actor_profiles lifecycle columns
-- ---------------------------------------------------------------------------

alter table public.actor_profiles
  add column if not exists account_status text not null default 'active';

alter table public.actor_profiles
  drop constraint if exists actor_profiles_account_status_check;

alter table public.actor_profiles
  add constraint actor_profiles_account_status_check
  check (account_status in ('active', 'deactivated', 'pending_deletion', 'deleted'));

alter table public.actor_profiles
  add column if not exists deactivated_at timestamptz;

alter table public.actor_profiles
  add column if not exists deleted_at timestamptz;

alter table public.actor_profiles
  add column if not exists deletion_scheduled_at timestamptz;

alter table public.actor_profiles
  add column if not exists deletion_reason text;

alter table public.actor_profiles
  add column if not exists deletion_requested_by uuid;

alter table public.actor_profiles
  add column if not exists deletion_notification_email text;

alter table public.actor_profiles
  add column if not exists recovery_token text;

alter table public.actor_profiles
  add column if not exists recovery_token_expires_at timestamptz;

create unique index if not exists actor_profiles_recovery_token_key
  on public.actor_profiles (recovery_token)
  where recovery_token is not null;

create index if not exists actor_profiles_pending_deletion_idx
  on public.actor_profiles (deletion_scheduled_at)
  where account_status = 'pending_deletion';

comment on column public.actor_profiles.account_status is
  'active | deactivated | pending_deletion | deleted';

-- ---------------------------------------------------------------------------
-- Immutable account audit log (retained after auth user deletion)
-- ---------------------------------------------------------------------------

create table if not exists public.account_audit_log (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null,
  actor_user_id uuid,
  event_type text not null,
  ip text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists account_audit_log_subject_created_idx
  on public.account_audit_log (subject_user_id, created_at desc);

create index if not exists account_audit_log_event_type_idx
  on public.account_audit_log (event_type, created_at desc);

alter table public.account_audit_log enable row level security;

drop policy if exists "account_audit_log_select_own" on public.account_audit_log;
create policy "account_audit_log_select_own"
  on public.account_audit_log for select
  to authenticated
  using (subject_user_id = auth.uid());

grant select on public.account_audit_log to authenticated;

-- ---------------------------------------------------------------------------
-- Data export requests
-- ---------------------------------------------------------------------------

create table if not exists public.data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending',
  format text not null default 'json',
  export_payload jsonb,
  storage_path text,
  error_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint data_export_requests_status_check
    check (status in ('pending', 'processing', 'ready', 'expired', 'failed')),
  constraint data_export_requests_format_check
    check (format in ('json', 'csv_bundle'))
);

create index if not exists data_export_requests_user_created_idx
  on public.data_export_requests (user_id, created_at desc);

alter table public.data_export_requests enable row level security;

drop policy if exists "data_export_requests_select_own" on public.data_export_requests;
create policy "data_export_requests_select_own"
  on public.data_export_requests for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.data_export_requests to authenticated;

-- ---------------------------------------------------------------------------
-- Rate limiting (DB-backed for multi-instance safety)
-- ---------------------------------------------------------------------------

create table if not exists public.account_action_rate_limits (
  id uuid primary key default gen_random_uuid(),
  action_key text not null,
  subject_key text not null,
  window_start timestamptz not null default now(),
  attempt_count int not null default 1,
  unique (action_key, subject_key)
);

create index if not exists account_action_rate_limits_window_idx
  on public.account_action_rate_limits (window_start);

-- ---------------------------------------------------------------------------
-- Provenance transfers: preserve rows when initiator account is removed
-- ---------------------------------------------------------------------------

alter table public.provenance_transfers
  drop constraint if exists provenance_transfers_from_user_id_fkey;

alter table public.provenance_transfers
  alter column from_user_id drop not null;

alter table public.provenance_transfers
  add constraint provenance_transfers_from_user_id_fkey
  foreign key (from_user_id) references auth.users (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Audit log RPC
-- ---------------------------------------------------------------------------

create or replace function public.log_account_audit_event(
  p_subject_user_id uuid,
  p_actor_user_id uuid,
  p_event_type text,
  p_ip text default null,
  p_user_agent text default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce((select auth.jwt() ->> 'role'), '') = 'service_role' then
    null;
  elsif (select auth.uid()) is not null
    and (
      (select auth.uid()) = p_subject_user_id
      or (select auth.uid()) = p_actor_user_id
    ) then
    null;
  else
    raise exception 'log_account_audit_event: not allowed'
      using errcode = '42501';
  end if;

  insert into public.account_audit_log (
    subject_user_id, actor_user_id, event_type, ip, user_agent, metadata
  )
  values (
    p_subject_user_id, p_actor_user_id, p_event_type, p_ip, p_user_agent, p_metadata
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.log_account_audit_event(uuid, uuid, text, text, text, jsonb)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Anonymise user profiles (registry records preserved)
-- ---------------------------------------------------------------------------

create or replace function public.anonymise_user_for_deletion(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_hidden jsonb := '{"profile": false, "ownership": false, "values": false, "location": false}'::jsonb;
begin
  select role into v_role from public.actor_profiles where user_id = p_user_id;

  update public.actor_profiles
  set
    display_name = 'Deleted User',
    public_presence = v_hidden,
    updated_at = now()
  where user_id = p_user_id;

  if v_role = 'artist' then
    update public.artists
    set
      display_name = 'Deleted User',
      bio = null,
      website = null,
      instagram = null,
      public_presence = v_hidden
    where id = p_user_id;
  elsif v_role = 'collector' then
    update public.collector_profiles
    set
      display_name = 'Deleted User',
      bio = null,
      location = null,
      anonymous_on_public = true,
      public_presence = v_hidden
    where user_id = p_user_id;
  elsif v_role = 'gallery' then
    update public.galleries g
    set
      description = null,
      website_url = null,
      location = null,
      public_presence = v_hidden
    from public.gallery_users gu
    where gu.user_id = p_user_id and gu.gallery_id = g.id;
  end if;
end;
$$;

grant execute on function public.anonymise_user_for_deletion(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Final erasure (after grace period) — auth user removed; audit log retained
-- ---------------------------------------------------------------------------

create or replace function public.finalise_account_deletion(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.anonymise_user_for_deletion(p_user_id);

  update public.actor_profiles
  set
    account_status = 'deleted',
    deleted_at = now(),
    display_name = 'Deleted User',
    recovery_token = null,
    recovery_token_expires_at = null,
    updated_at = now()
  where user_id = p_user_id;

  delete from public.data_export_requests where user_id = p_user_id;
end;
$$;

grant execute on function public.finalise_account_deletion(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Rate limit check (returns true if allowed)
-- ---------------------------------------------------------------------------

create or replace function public.check_account_action_rate_limit(
  p_action_key text,
  p_subject_key text,
  p_max_attempts int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.account_action_rate_limits%rowtype;
  v_cutoff timestamptz := now() - make_interval(secs => p_window_seconds);
begin
  select * into v_row
  from public.account_action_rate_limits
  where action_key = p_action_key and subject_key = p_subject_key
  for update;

  if not found then
    insert into public.account_action_rate_limits (action_key, subject_key, attempt_count)
    values (p_action_key, p_subject_key, 1);
    return true;
  end if;

  if v_row.window_start < v_cutoff then
    update public.account_action_rate_limits
    set window_start = now(), attempt_count = 1
    where id = v_row.id;
    return true;
  end if;

  if v_row.attempt_count >= p_max_attempts then
    return false;
  end if;

  update public.account_action_rate_limits
  set attempt_count = attempt_count + 1
  where id = v_row.id;

  return true;
end;
$$;

grant execute on function public.check_account_action_rate_limit(text, text, int, int)
  to service_role;
