-- PRE-LAUNCH CONSOLIDATION (production hardening)
-- Goals:
-- - Remove legacy duplication
-- - Enforce single sources of truth (ownership_events, verification_events)
-- - Stabilize hashing + certificates for multi-issuance
-- - Safe backfills for missing invariants

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1) OWNERSHIP SYSTEM — SINGLE SOURCE OF TRUTH
-- ---------------------------------------------------------------------------
drop table if exists public.ownership_history cascade;
drop table if exists public.ownership_transfers cascade;

-- Canonical helper: latest ownership_events.to_user_id
create or replace function public.get_current_owner(p_artwork_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select oe.to_user_id
  from public.ownership_events oe
  where oe.artwork_id = p_artwork_id
    and oe.to_user_id is not null
  order by oe.created_at desc nulls last, oe.id desc
  limit 1
$$;

revoke all on function public.get_current_owner(uuid) from public;
grant execute on function public.get_current_owner(uuid) to anon, authenticated, service_role;

-- Ensure cache column exists (cache only; ownership_events remains source of truth)
alter table public.artworks
  add column if not exists current_owner_id uuid;

-- AFTER INSERT: sync artworks.current_owner_id (cache) to NEW.to_user_id
create or replace function public.ownership_events_sync_current_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.artwork_id is null then
    return new;
  end if;

  if new.to_user_id is not null then
    update public.artworks a
    set current_owner_id = new.to_user_id
    where a.id = new.artwork_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ownership_events_sync_current_owner on public.ownership_events;
create trigger trg_ownership_events_sync_current_owner
after insert on public.ownership_events
for each row
execute function public.ownership_events_sync_current_owner();

-- ---------------------------------------------------------------------------
-- 2) REMOVE TEST / DEV FIELDS
-- ---------------------------------------------------------------------------
alter table public.artworks
  drop column if exists test_owner_id;

-- ---------------------------------------------------------------------------
-- 3) CERTIFICATES — FIX STRUCTURE (allow multiple per artwork)
-- ---------------------------------------------------------------------------
alter table public.certificates
  drop constraint if exists certificates_artwork_id_key;

create index if not exists idx_certificates_artwork_id
  on public.certificates (artwork_id);

-- Centralized hashing (sha256(snapshot::text) hex)
create or replace function public.generate_certificate_hash(p_snapshot jsonb)
returns text
language sql
immutable
security definer
set search_path = public, extensions
as $$
  select encode(digest(coalesce(p_snapshot, '{}'::jsonb)::text, 'sha256'), 'hex')
$$;

revoke all on function public.generate_certificate_hash(jsonb) from public;
grant execute on function public.generate_certificate_hash(jsonb) to anon, authenticated, service_role;

-- Update issuance to be multi-certificate safe (latest row lock; issue new snapshot over time)
-- NOTE: This replaces the function from certificate V2 migration, but preserves its API.
create or replace function public.issue_certificate_for_verified_artwork(
  p_artwork_id uuid
)
returns table (
  created boolean,
  certificate_hash text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_art record;
  v_latest record;
  v_cert record;
  v_latest_owner uuid;
  v_gallery_verified boolean := false;
  v_artist_verified boolean := false;
  v_gallery_id uuid := null;
  v_gallery_name text := null;
  v_verified_by jsonb := null;
  v_issued_by uuid := auth.uid();
  v_snapshot jsonb;
  v_summary jsonb;
  v_hash text;
begin
  select
    a.id,
    a.registry_id,
    a.title,
    a.artist_id,
    a.verification_status,
    a.current_owner_id,
    a.approved_by,
    a.approved_at
  into v_art
  from public.artworks a
  where a.id = p_artwork_id;

  if v_art.id is null then
    raise exception 'Artwork not found' using errcode = 'P0002';
  end if;

  if v_art.verification_status is distinct from 'verified' then
    raise exception 'Artwork is not verified' using errcode = '22000';
  end if;

  if v_art.registry_id is null then
    raise exception 'Registry ID missing' using errcode = '22000';
  end if;

  -- Lock the latest certificate row if present (multiple certificates allowed).
  select c.*
  into v_latest
  from public.certificates c
  where c.artwork_id = v_art.id
  order by c.issued_at desc nulls last, c.id desc
  limit 1
  for update;

  -- If no cert exists OR latest already has a snapshot/hash, issue a new certificate row.
  if v_latest.id is null
     or v_latest.certificate_snapshot is not null
     or (v_latest.certificate_hash is not null and v_latest.certificate_hash <> '') then
    insert into public.certificates (artwork_id, certificate_number, issued_at, revoked, issued_by)
    values (v_art.id, v_art.registry_id, now(), false, v_issued_by)
    returning * into v_cert;
    created := true;
  else
    v_cert := v_latest;
    created := false;
  end if;

  -- Owner snapshot: use latest ownership_events if present, else fall back to artworks.current_owner_id.
  select coalesce(oe.to_user_id, oe.to_owner_id)
  into v_latest_owner
  from public.ownership_events oe
  where oe.artwork_id = v_art.id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  v_latest_owner := coalesce(v_latest_owner, v_art.current_owner_id);

  -- Verification signals at issuance time.
  v_gallery_verified := exists (
    select 1 from public.verification_events ve
    where ve.artwork_id = v_art.id
      and ve.status = 'confirmed'
      and ve.source = 'gallery'
  );
  v_artist_verified := exists (
    select 1 from public.verification_events ve
    where ve.artwork_id = v_art.id
      and ve.status = 'confirmed'
      and ve.source = 'artist'
  );

  select ve.source_id
  into v_gallery_id
  from public.verification_events ve
  where ve.artwork_id = v_art.id
    and ve.status = 'confirmed'
    and ve.source = 'gallery'
  order by ve.created_at desc nulls last, ve.id desc
  limit 1;

  if v_gallery_id is not null then
    select g.name into v_gallery_name
    from public.galleries g
    where g.id = v_gallery_id;
  end if;

  v_verified_by :=
    case
      when v_gallery_id is not null then
        jsonb_build_object(
          'type', 'gallery',
          'gallery_id', v_gallery_id,
          'gallery_name', nullif(trim(coalesce(v_gallery_name, '')), '')
        )
      when v_art.approved_by is not null then
        jsonb_build_object(
          'type', 'admin',
          'user_id', v_art.approved_by
        )
      else
        null
    end;

  v_summary := jsonb_build_object(
    'gallery', v_gallery_verified,
    'artist', v_artist_verified,
    'certificate', true
  );

  v_snapshot := jsonb_build_object(
    'artwork_id', v_art.id,
    'registry_id', v_art.registry_id,
    'title', v_art.title,
    'artist_id', v_art.artist_id,
    'issued_at', v_cert.issued_at,
    'issued_by', v_issued_by,
    'current_owner_id', v_latest_owner,
    'verification_sources', jsonb_build_object(
      'certificate', true,
      'gallery', v_gallery_verified,
      'artist', v_artist_verified
    ),
    'verified_by', v_verified_by
  );

  v_hash := public.generate_certificate_hash(v_snapshot);

  update public.certificates
  set
    certificate_snapshot = coalesce(certificate_snapshot, v_snapshot),
    verification_summary = coalesce(verification_summary, v_summary),
    certificate_hash = case
      when certificate_hash is null or certificate_hash = '' then v_hash
      else certificate_hash
    end,
    issued_by = coalesce(issued_by, v_issued_by)
  where id = v_cert.id;

  -- Multi-source verification: emit a certificate confirmation event (best-effort).
  begin
    insert into public.verification_events (artwork_id, source, source_id, status, metadata, created_at)
    values (
      v_art.id,
      'certificate',
      null,
      'confirmed',
      jsonb_build_object('certificate_id', v_cert.id),
      now()
    );
  exception when others then
    null;
  end;

  certificate_hash := v_hash;
  return next;
end;
$$;

revoke all on function public.issue_certificate_for_verified_artwork(uuid) from public;
grant execute on function public.issue_certificate_for_verified_artwork(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4) VERIFICATION — DEFINE SOURCE OF TRUTH
-- ---------------------------------------------------------------------------
-- Canonical computation (verified if non-revoked certificate exists OR confirmed verified gallery event exists)
create or replace function public.compute_artwork_verification_status(p_artwork_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verified boolean := false;
begin
  if p_artwork_id is null then
    return 'unverified';
  end if;

  v_verified := exists (
    select 1
    from public.certificates c
    where c.artwork_id = p_artwork_id
      and coalesce(c.revoked, false) = false
  )
  or exists (
    select 1
    from public.verification_events ve
    where ve.artwork_id = p_artwork_id
      and ve.status = 'confirmed'
      and ve.source = 'gallery'
      and exists (
        select 1 from public.galleries g
        where g.id = ve.source_id
          and g.verified is true
      )
  );

  return case when v_verified then 'verified' else 'unverified' end;
end;
$$;

revoke all on function public.compute_artwork_verification_status(uuid) from public;
grant execute on function public.compute_artwork_verification_status(uuid) to authenticated, service_role;

-- Refresh writer: derived-only sync to artworks.verification_status
create or replace function public.refresh_artwork_verification_status(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if p_artwork_id is null then return; end if;
  v_status := public.compute_artwork_verification_status(p_artwork_id);
  update public.artworks a
  set verification_status = v_status
  where a.id = p_artwork_id;
end;
$$;

revoke all on function public.refresh_artwork_verification_status(uuid) from public;
grant execute on function public.refresh_artwork_verification_status(uuid) to authenticated, service_role;

-- Trigger stays on verification_events, but ensure it uses the derived function.
drop trigger if exists trg_verification_events_refresh_artwork_verified on public.verification_events;
create trigger trg_verification_events_refresh_artwork_verified
after insert or update or delete on public.verification_events
for each row
execute function public.verification_events_refresh_artwork_verified();

-- Also refresh when certificates change (revocation/new issuance affects derived status).
create or replace function public.certificates_refresh_artwork_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_artwork_verification_status(coalesce(new.artwork_id, old.artwork_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_certificates_refresh_artwork_verified on public.certificates;
create trigger trg_certificates_refresh_artwork_verified
after insert or update or delete on public.certificates
for each row
execute function public.certificates_refresh_artwork_verified();

-- ---------------------------------------------------------------------------
-- 5) GALLERY AUTHORITY ENFORCEMENT (DB-level safety)
-- ---------------------------------------------------------------------------
create or replace function public.enforce_verified_gallery_verification_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gid uuid;
  v_ok boolean;
begin
  if coalesce(new.source, '') = 'gallery' then
    v_gid := coalesce(new.source_id, new.verified_by_gallery_id);
    if v_gid is null then
      raise exception 'Gallery verification requires source_id' using errcode = '23514';
    end if;
    select exists (select 1 from public.galleries g where g.id = v_gid and g.verified is true)
    into v_ok;
    if not v_ok then
      raise exception 'Unverified gallery cannot verify artworks' using errcode = '42501';
    end if;
    new.source_id := v_gid;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_verified_gallery_verification_event on public.verification_events;
create trigger trg_enforce_verified_gallery_verification_event
before insert or update on public.verification_events
for each row
execute function public.enforce_verified_gallery_verification_event();

-- ---------------------------------------------------------------------------
-- 6) OWNERSHIP EVENT CLEAN RULES
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_to_party_present_check'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_to_party_present_check
      check (to_user_id is not null or nullif(trim(coalesce(to_name, '')), '') is not null);
  end if;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 7) VALUE EVENTS → OWNERSHIP CONSISTENCY
-- ---------------------------------------------------------------------------
-- Already enforced by earlier migrations: value_events updates after 15 minutes are allowed
-- only when changing ownership_resolved (plus updated_at). No-op here; keep as production invariant.

-- ---------------------------------------------------------------------------
-- 10) DATA CLEANUP (safe backfills)
-- ---------------------------------------------------------------------------
-- C) ownership_events without verification_status → set 'recorded'
update public.ownership_events
set verification_status = 'recorded'
where verification_status is null or trim(coalesce(verification_status, '')) = '';

-- B) certificates without hash → regenerate (only when snapshot exists)
update public.certificates
set certificate_hash = public.generate_certificate_hash(certificate_snapshot)
where (certificate_hash is null or certificate_hash = '')
  and certificate_snapshot is not null;

-- A) artworks with no ownership_events → create an initial "creation" ownership event to the artist (best-effort)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='ownership_events' and column_name='transfer_type')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='ownership_events' and column_name='verification_status')
  then
    insert into public.ownership_events (artwork_id, transfer_type, to_user_id, verification_status, created_at)
    select a.id, 'creation', a.artist_id, 'recorded', coalesce(a.created_at, now())
    from public.artworks a
    where a.artist_id is not null
      and not exists (
        select 1 from public.ownership_events oe where oe.artwork_id = a.id
      );
  end if;
exception when others then
  null;
end $$;

