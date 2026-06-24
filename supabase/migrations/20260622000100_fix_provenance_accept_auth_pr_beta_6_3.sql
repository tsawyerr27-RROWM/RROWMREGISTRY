-- PR-BETA.6.3 — Trust recipient_user_id for provenance transfer acceptance (email fallback only).

create or replace function public.accept_provenance_transfer(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
  v_tr public.provenance_transfers%rowtype;
  v_art public.artworks%rowtype;
  v_notes text;
  v_oe_id uuid;
  v_now timestamptz := now();
  v_ctx text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_token is null or length(trim(p_token)) < 32 then
    raise exception 'Invalid token' using errcode = '22023';
  end if;

  select *
  into v_tr
  from public.provenance_transfers t
  where t.invite_token = trim(p_token)
  for update;

  if not found then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  if lower(coalesce(v_tr.status, '')) <> 'pending_acceptance' then
    raise exception 'This invitation is no longer open for confirmation' using errcode = '23514';
  end if;

  if v_tr.token_expires_at is not null and v_tr.token_expires_at < v_now then
    update public.provenance_transfers
    set status = 'expired'
    where id = v_tr.id and status = 'pending_acceptance';
    raise exception 'This invitation has expired' using errcode = '23514';
  end if;

  if v_tr.recipient_user_id is not null then
    if v_tr.recipient_user_id is distinct from v_uid then
      raise exception 'Transfer not intended for this account' using errcode = '42501';
    end if;
  else
    v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
    if v_email = '' then
      raise exception 'Account email required to accept' using errcode = '42501';
    end if;
    if lower(trim(coalesce(v_tr.recipient_email, ''))) <> v_email then
      raise exception 'Transfer not intended for this account' using errcode = '42501';
    end if;
  end if;

  if v_tr.from_user_id is not null and v_tr.from_user_id = v_uid then
    raise exception 'You cannot confirm a chronology invitation you sent yourself'
      using errcode = '23514';
  end if;

  select * into v_art from public.artworks where id = v_tr.artwork_id;
  if not found then
    raise exception 'Work not found' using errcode = 'P0002';
  end if;

  if lower(coalesce(v_art.verification_status, '')) <> 'verified' then
    raise exception 'Chronology continuation requires a verified catalogue record'
      using errcode = '23514';
  end if;

  if v_art.current_owner_id is null or v_art.current_owner_id is distinct from v_tr.from_user_id then
    raise exception 'Custodian on file no longer matches this invitation' using errcode = '42501';
  end if;

  v_notes := format(
    'provenance_continuation; transfer_id=%s; category=%s',
    v_tr.id::text,
    coalesce(v_tr.transfer_type, 'private_transfer')
  );
  v_ctx := nullif(trim(coalesce(v_tr.note, '')), '');
  if v_ctx is not null then
    v_notes := v_notes || '; context=' || left(replace(v_ctx, E'\n', ' '), 2000);
  end if;

  insert into public.ownership_events (
    artwork_id,
    transfer_type,
    to_user_id,
    created_by,
    notes,
    provenance_transfer_id
  )
  values (
    v_tr.artwork_id,
    'ownership_transfer',
    v_uid,
    v_uid,
    v_notes,
    v_tr.id
  )
  returning id into v_oe_id;

  update public.provenance_transfers
  set
    status = 'completed',
    recipient_user_id = v_uid,
    completed_at = v_now,
    token_used_at = v_now,
    ownership_event_id = v_oe_id
  where id = v_tr.id
    and status = 'pending_acceptance';

  if not found then
    raise exception 'Invitation could not be completed' using errcode = '23514';
  end if;

  return jsonb_build_object(
    'ok', true,
    'ownership_event_id', v_oe_id,
    'artwork_id', v_tr.artwork_id
  );
end;
$$;

revoke all on function public.accept_provenance_transfer(text) from public;
grant execute on function public.accept_provenance_transfer(text) to authenticated;

comment on function public.accept_provenance_transfer(text) is
  'Accept a pending provenance continuation invite atomically (recipient_user_id or email + custodian checks).';

notify pgrst, 'reload schema';
