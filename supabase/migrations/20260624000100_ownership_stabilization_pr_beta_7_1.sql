-- PR-BETA.7.1 — Ownership stabilization: restore from_user_id derivation, hard-fail cache sync,
-- fix provenance accept to populate from_user_id explicitly.

-- 1) BEFORE INSERT: derive from_user_id from prior ledger row (or artist for first event)
create or replace function public.ownership_events_provenance_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_to_user uuid;
  v_artist uuid;
begin
  if new.transfer_type is null or trim(new.transfer_type) = '' then
    new.transfer_type := 'transfer';
  end if;

  if new.from_user_id is not null then
    return new;
  end if;

  select oe.to_user_id
  into p_to_user
  from public.ownership_events oe
  where oe.artwork_id = new.artwork_id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  if found and p_to_user is not null then
    new.from_user_id := p_to_user;
  else
    select a.artist_id into v_artist
    from public.artworks a
    where a.id = new.artwork_id
    limit 1;
    new.from_user_id := v_artist;
  end if;

  new.created_by := coalesce(new.created_by, auth.uid());
  return new;
end;
$$;

drop trigger if exists trg_ownership_events_provenance_bi on public.ownership_events;
create trigger trg_ownership_events_provenance_bi
before insert on public.ownership_events
for each row
execute function public.ownership_events_provenance_before_insert();

comment on function public.ownership_events_provenance_before_insert() is
  'Derives from_user_id from latest ownership_events.to_user_id (or artist_id for genesis row) when omitted.';

-- 2) Hard-fail artworks.current_owner_id cache sync
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

    if not found then
      raise exception 'ownership_events_sync_current_owner: artwork % not found', new.artwork_id
        using errcode = 'P0002';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ownership_events_sync_current_owner on public.ownership_events;
create trigger trg_ownership_events_sync_current_owner
after insert on public.ownership_events
for each row
execute function public.ownership_events_sync_current_owner();

-- 3) Provenance accept: explicit canonical holder resolution (does not depend on provenance BI)
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
  v_canonical_holder uuid;
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

  v_canonical_holder := public.get_current_owner(v_tr.artwork_id);

  if v_canonical_holder is null then
    raise exception 'No canonical ownership holder on file for this work'
      using errcode = '23514';
  end if;

  if v_tr.from_user_id is not null and v_tr.from_user_id is distinct from v_canonical_holder then
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
    from_user_id,
    to_user_id,
    created_by,
    notes,
    provenance_transfer_id
  )
  values (
    v_tr.artwork_id,
    'ownership_transfer',
    v_canonical_holder,
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

comment on function public.accept_provenance_transfer(text) is
  'Accept pending provenance continuation; resolves seller from latest ownership_events.to_user_id (ledger authority).';

-- 4) Collector holdings — to_user_id only
create or replace function public.list_collector_owned_artwork_ids(p_user_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select ranked.artwork_id
  from (
    select distinct on (oe.artwork_id)
      oe.artwork_id,
      oe.to_user_id as holder_id
    from public.ownership_events oe
    where oe.artwork_id is not null
    order by oe.artwork_id, oe.created_at desc nulls last, oe.id desc nulls last
  ) ranked
  where ranked.holder_id = p_user_id;
$$;

notify pgrst, 'reload schema';
