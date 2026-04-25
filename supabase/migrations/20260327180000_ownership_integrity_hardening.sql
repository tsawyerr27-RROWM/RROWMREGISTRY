-- Integrity: claim_source, safe assignment in request_verification, certificate identity,
-- admin claim_source, current_owner_id only when ledger row is verified.

alter table public.ownership_events
  add column if not exists claim_source text;

comment on column public.ownership_events.claim_source is
  'Provenance of trust transition: user | certificate | manual (admin).';

-- ---------------------------------------------------------------------------
-- Owner cache: only sync current_owner_id when verified; keep sale→external clear
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_refresh_artwork_owner_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t text;
  r public.ownership_events%rowtype;
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  r := new;

  if coalesce(trim(r.verification_status), '') = 'verified'
     and r.to_user_id is not null then
    update public.artworks
    set
      current_owner_id = r.to_user_id,
      test_owner_id = coalesce(r.to_user_id, test_owner_id)
    where id = r.artwork_id;
  else
    t := lower(trim(coalesce(r.transfer_type, '')));
    if r.to_user_id is null
       and t in ('sale', 'auction', 'primary_sale', 'secondary_sale') then
      update public.artworks
      set current_owner_id = null
      where id = r.artwork_id;
    end if;
  end if;

  return r;
end;
$$;

-- ---------------------------------------------------------------------------
-- User request: do not overwrite existing to_user_id; only fill when null
-- ---------------------------------------------------------------------------
create or replace function public.ownership_request_verification(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_artwork_id uuid;
  v_latest_id uuid;
  v_status text;
  v_to_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  select oe.artwork_id, oe.verification_status, oe.to_user_id
  into v_artwork_id, v_status, v_to_user
  from public.ownership_events oe
  where oe.id = p_event_id;

  if v_artwork_id is null then
    raise exception 'Ownership event not found'
      using errcode = '22023';
  end if;

  select oe2.id
  into v_latest_id
  from public.ownership_events oe2
  where oe2.artwork_id = v_artwork_id
  order by oe2.created_at desc nulls last, oe2.id desc
  limit 1;

  if v_latest_id is distinct from p_event_id then
    raise exception 'Only the latest ownership event can be claimed'
      using errcode = '22023';
  end if;

  if trim(coalesce(v_status, '')) is distinct from 'recorded' then
    raise exception 'Verification already requested or completed'
      using errcode = '22023';
  end if;

  if v_to_user is not null and v_to_user is distinct from auth.uid() then
    raise exception 'Not authorized for this ownership event'
      using errcode = '42501';
  end if;

  update public.ownership_events oe
  set
    verification_status = 'claimed',
    claim_source = 'user',
    to_user_id = coalesce(oe.to_user_id, auth.uid())
  where oe.id = p_event_id;
end;
$$;

comment on function public.ownership_request_verification(uuid) is
  'Latest recorded row → claimed; sets to_user_id only when empty (no override).';

-- ---------------------------------------------------------------------------
-- Certificate: auto-verify only when latest row to_user_id is exactly caller
-- ---------------------------------------------------------------------------
create or replace function public.ownership_certificate_verify(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_id uuid;
  holder uuid;
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return;
  end if;

  if not exists (
    select 1
    from public.certificates c
    where c.artwork_id = p_artwork_id
      and coalesce(c.revoked, false) = false
  ) then
    return;
  end if;

  select oe.id, oe.to_user_id
  into latest_id, holder
  from public.ownership_events oe
  where oe.artwork_id = p_artwork_id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  if latest_id is null then
    return;
  end if;

  if holder is null or holder is distinct from v_uid then
    return;
  end if;

  update public.ownership_events
  set
    verification_status = 'verified',
    verification_method = 'certificate',
    verified_by = v_uid,
    verified_at = now(),
    claim_source = 'certificate'
  where id = latest_id
    and verification_status is distinct from 'verified';
end;
$$;

comment on function public.ownership_certificate_verify(uuid) is
  'Non-revoked cert + latest row to_user_id = auth.uid() only; identity-safe.';

-- ---------------------------------------------------------------------------
-- Admin verify: record claim_source manual
-- ---------------------------------------------------------------------------
create or replace function public.ownership_admin_verify(
  p_event_id uuid,
  p_method text default 'manual',
  p_verified_by uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') != 'service_role' then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;

  if p_verified_by is null then
    raise exception 'verified_by required'
      using errcode = '22023';
  end if;

  update public.ownership_events
  set
    verification_status = 'verified',
    verified_by = p_verified_by,
    verified_at = now(),
    verification_method = nullif(trim(coalesce(p_method, '')), ''),
    claim_source = 'manual'
  where id = p_event_id;
end;
$$;
