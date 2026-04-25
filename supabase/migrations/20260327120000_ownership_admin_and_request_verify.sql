-- Admin verification (service_role only) + collector request-verification RPC

-- ---------------------------------------------------------------------------
-- ownership_admin_verify: called from Next API with service role + admin session check
-- p_verified_by: required — service JWT has no auth.uid() for verified_by
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
    verification_method = nullif(trim(coalesce(p_method, '')), '')
  where id = p_event_id;
end;
$$;

grant execute on function public.ownership_admin_verify(uuid, text, uuid) to service_role;

comment on function public.ownership_admin_verify(uuid, text, uuid) is
  'Mark an ownership_events row verified (manual/admin). Server-only: service_role + p_verified_by.';

-- ---------------------------------------------------------------------------
-- ownership_request_verification: latest event only, recorded → claimed
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

  update public.ownership_events
  set
    verification_status = 'claimed',
    to_user_id = auth.uid()
  where id = p_event_id;
end;
$$;

grant execute on function public.ownership_request_verification(uuid) to authenticated;

comment on function public.ownership_request_verification(uuid) is
  'Assert current owner: latest ledger row, status recorded, sets claimed + to_user_id = auth.uid().';
