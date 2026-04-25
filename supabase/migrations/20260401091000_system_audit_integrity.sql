-- System audit + integrity layer (no UI changes)
-- - Auditable integrity report
-- - Certificate verification by certificate_id
-- - Optional ownership chain guard (if from_user_id is provided)
-- - Central system error logging for trigger/function failures

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1) System error logging
-- ---------------------------------------------------------------------------
create table if not exists public.system_errors (
  id uuid primary key default gen_random_uuid(),
  context text not null,
  error_message text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists system_errors_created_desc_idx
  on public.system_errors (created_at desc, id desc);

alter table public.system_errors enable row level security;

drop policy if exists "system_errors_select_admin" on public.system_errors;
create policy "system_errors_select_admin"
  on public.system_errors for select
  to authenticated
  using (
    exists (
      select 1 from public.artists a
      where a.id = auth.uid()
        and coalesce(a.is_admin, false) = true
    )
  );

drop policy if exists "system_errors_insert_none" on public.system_errors;
create policy "system_errors_insert_none"
  on public.system_errors for insert
  to anon, authenticated
  with check (false);

revoke all on table public.system_errors from anon, authenticated;

create or replace function public.log_system_error(
  p_context text,
  p_error_message text,
  p_details jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.system_errors (context, error_message, details)
  values (left(coalesce(p_context, 'unknown'), 180), left(coalesce(p_error_message, 'unknown'), 2000), p_details);
exception when others then
  -- Never block primary workflows because logging failed.
  null;
end;
$$;

revoke all on function public.log_system_error(text, text, jsonb) from public;
grant execute on function public.log_system_error(text, text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 2) Audit function: public.system_integrity_report()
-- ---------------------------------------------------------------------------
create or replace function public.system_integrity_report()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ownership jsonb;
  v_sales jsonb;
  v_certs jsonb;
  v_verif jsonb;
begin
  -- Ownership mismatches: artworks.current_owner_id != get_current_owner(id)
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'artwork_id', a.id,
        'registry_id', a.registry_id,
        'cached_current_owner_id', a.current_owner_id,
        'computed_current_owner_id', public.get_current_owner(a.id)
      )
    ),
    '[]'::jsonb
  )
  into v_ownership
  from (
    select a.*
    from public.artworks a
    where coalesce(a.current_owner_id::text, '') <> coalesce(public.get_current_owner(a.id)::text, '')
    order by a.created_at desc nulls last, a.id desc
    limit 200
  ) a;

  -- Unresolved sales: value_events.ownership_resolved = false (sale only)
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'value_event_id', v.id,
        'artwork_id', v.artwork_id,
        'created_at', v.created_at,
        'declared_value', v.declared_value,
        'currency', v.currency
      )
    ),
    '[]'::jsonb
  )
  into v_sales
  from (
    select v.*
    from public.value_events v
    where v.value_type = 'sale'
      and coalesce(v.ownership_resolved, false) = false
    order by v.created_at desc nulls last, v.id desc
    limit 200
  ) v;

  -- Invalid certificates: stored_hash != generate_certificate_hash(snapshot)
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'certificate_id', c.id,
        'artwork_id', c.artwork_id,
        'issued_at', c.issued_at,
        'stored_hash', c.certificate_hash,
        'expected_hash', public.generate_certificate_hash(c.certificate_snapshot)
      )
    ),
    '[]'::jsonb
  )
  into v_certs
  from (
    select c.*
    from public.certificates c
    where c.certificate_snapshot is not null
      and coalesce(nullif(trim(c.certificate_hash), ''), '') <> public.generate_certificate_hash(c.certificate_snapshot)
    order by c.issued_at desc nulls last, c.id desc
    limit 200
  ) c;

  -- Verification mismatch: artworks.verification_status != compute_artwork_verification_status(id)
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'artwork_id', a.id,
        'registry_id', a.registry_id,
        'stored_status', a.verification_status,
        'expected_status', public.compute_artwork_verification_status(a.id)
      )
    ),
    '[]'::jsonb
  )
  into v_verif
  from (
    select a.*
    from public.artworks a
    where coalesce(a.verification_status, '') <> coalesce(public.compute_artwork_verification_status(a.id), '')
    order by a.created_at desc nulls last, a.id desc
    limit 200
  ) a;

  return jsonb_build_object(
    'ownership_mismatches', v_ownership,
    'unresolved_sales', v_sales,
    'invalid_certificates', v_certs,
    'verification_mismatches', v_verif
  );
end;
$$;

revoke all on function public.system_integrity_report() from public;
grant execute on function public.system_integrity_report() to service_role;

-- ---------------------------------------------------------------------------
-- 3) Certificate verification by certificate_id
-- ---------------------------------------------------------------------------
create or replace function public.verify_certificate(p_certificate_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_cert record;
  v_expected text;
  v_stored text;
  v_valid boolean := false;
begin
  select c.*
  into v_cert
  from public.certificates c
  where c.id = p_certificate_id
  limit 1;

  if v_cert.id is null then
    return jsonb_build_object(
      'valid', false,
      'expected_hash', null,
      'stored_hash', null
    );
  end if;

  v_stored := nullif(trim(coalesce(v_cert.certificate_hash, '')), '');
  v_expected := case
    when v_cert.certificate_snapshot is null then null
    else public.generate_certificate_hash(v_cert.certificate_snapshot)
  end;

  v_valid :=
    coalesce(v_cert.revoked, false) = false
    and v_expected is not null
    and v_stored is not null
    and v_stored = v_expected;

  return jsonb_build_object(
    'valid', v_valid,
    'expected_hash', v_expected,
    'stored_hash', v_stored
  );
end;
$$;

revoke all on function public.verify_certificate(uuid) from public;
grant execute on function public.verify_certificate(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4) Ownership chain validation (optional): if caller provides from_user_id, it must match previous to_user_id.
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_chain_guard_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev_to uuid;
begin
  -- Only enforce when a caller supplies from_user_id (otherwise provenance trigger derives it).
  if new.from_user_id is null then
    return new;
  end if;

  select oe.to_user_id
  into v_prev_to
  from public.ownership_events oe
  where oe.artwork_id = new.artwork_id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  if v_prev_to is not null and new.from_user_id is distinct from v_prev_to then
    raise exception 'ownership_events: from_user_id must match previous to_user_id' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_aaa_ownership_events_chain_guard_bi on public.ownership_events;
create trigger trg_aaa_ownership_events_chain_guard_bi
before insert on public.ownership_events
for each row
execute function public.ownership_events_chain_guard_before_insert();

-- ---------------------------------------------------------------------------
-- 5) Add logging to key trigger functions (replace in place)
-- ---------------------------------------------------------------------------
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
exception when others then
  perform public.log_system_error(
    'ownership_events_sync_current_owner',
    sqlerrm,
    jsonb_build_object('artwork_id', new.artwork_id, 'ownership_event_id', new.id)
  );
  return new;
end;
$$;

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
exception when others then
  perform public.log_system_error(
    'enforce_verified_gallery_verification_event',
    sqlerrm,
    jsonb_build_object('artwork_id', new.artwork_id, 'source', new.source, 'source_id', new.source_id)
  );
  raise;
end;
$$;

create or replace function public.certificates_refresh_artwork_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_artwork_verification_status(coalesce(new.artwork_id, old.artwork_id));
  return coalesce(new, old);
exception when others then
  perform public.log_system_error(
    'certificates_refresh_artwork_verified',
    sqlerrm,
    jsonb_build_object('artwork_id', coalesce(new.artwork_id, old.artwork_id))
  );
  return coalesce(new, old);
end;
$$;

