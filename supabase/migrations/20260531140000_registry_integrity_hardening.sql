-- Registry integrity hardening (Phase 4.5 remediation)
-- C2: complete_market_sale — caller must be the buyer
-- C3: artist_link_catalogue_work — email match only (no display-name hijack)
-- H1: ownership_events — drop artist UPDATE policy; block updates
-- H3: verification_events — remove direct authenticated INSERT policies
-- H6: accept_provenance_transfer — atomic accept with custodian check

-- ---------------------------------------------------------------------------
-- C2: Marketplace sale completion — only the buyer may invoke
-- ---------------------------------------------------------------------------
create or replace function public.complete_market_sale(
  p_listing_id uuid,
  p_buyer_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.market_listings%rowtype;
  v_now timestamptz := now();
  v_value_event_id uuid;
  v_visibility_level text;
  v_caller uuid;
begin
  v_caller := auth.uid();
  if v_caller is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if v_caller is distinct from p_buyer_user_id then
    raise exception 'Only the buyer may complete this sale' using errcode = '42501';
  end if;

  if p_listing_id is null then
    raise exception 'Missing listing id' using errcode = '22023';
  end if;
  if p_buyer_user_id is null then
    raise exception 'Missing buyer user id' using errcode = '22023';
  end if;

  select *
  into v_listing
  from public.market_listings ml
  where ml.id = p_listing_id
  for update;

  if not found then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if v_listing.status <> 'active' then
    raise exception 'Listing is not active (status=%)', v_listing.status using errcode = '23514';
  end if;

  if v_listing.expires_at is not null and v_listing.expires_at <= v_now then
    update public.market_listings
    set status = 'expired'
    where id = v_listing.id;
    raise exception 'Listing has expired' using errcode = '23514';
  end if;

  if v_listing.seller_user_id = p_buyer_user_id then
    raise exception 'Buyer cannot be the seller' using errcode = '23514';
  end if;

  if not public.can_list_artwork(v_listing.artwork_id, v_listing.seller_user_id) then
    raise exception 'Seller no longer holds verified ownership for this artwork' using errcode = '42501';
  end if;

  v_visibility_level := case
    when v_listing.visibility = 'private' then 'certificate'
    else 'public'
  end;

  insert into public.value_events (
    artwork_id,
    value_type,
    declared_value,
    currency,
    visibility_level,
    created_at
  )
  values (
    v_listing.artwork_id,
    'sale',
    v_listing.price,
    v_listing.currency,
    v_visibility_level,
    v_now
  )
  returning id into v_value_event_id;

  insert into public.ownership_events (
    artwork_id,
    transfer_type,
    to_user_id,
    value_event_id,
    sale_price,
    sale_currency,
    sale_date,
    verification_status,
    verification_method,
    verified_at,
    verified_by,
    created_at
  )
  values (
    v_listing.artwork_id,
    'sale',
    p_buyer_user_id,
    v_value_event_id,
    v_listing.price,
    v_listing.currency,
    v_now,
    'verified',
    'transfer_chain',
    v_now,
    null,
    v_now
  );

  update public.market_listings
  set status = 'sold'
  where id = v_listing.id;

  return v_value_event_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- C3: Catalogue artist linkage — pending email only
-- ---------------------------------------------------------------------------
create or replace function public.artist_link_catalogue_work(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
  v_row public.artworks%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_row from public.artworks where id = p_artwork_id;
  if not found then
    raise exception 'Artwork not found';
  end if;

  if v_row.artist_id is not null and v_row.artist_id <> v_uid then
    raise exception 'Work is already linked to another artist' using errcode = '42501';
  end if;

  if v_row.artist_id = v_uid then
    return;
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    raise exception 'Account email required to link catalogue work' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.artwork_confirmation_events e
    where e.artwork_id = p_artwork_id
      and e.event_type = 'institution_filed'
  ) then
    raise exception 'No institution filing on file for this work';
  end if;

  if lower(coalesce(v_row.pending_artist_email, '')) <> v_email then
    raise exception 'Not authorized to link this catalogue work' using errcode = '42501';
  end if;

  update public.artworks
  set
    artist_id = v_uid,
    catalogue_artist_name = null
  where id = p_artwork_id;

  update public.artwork_representation_relationships
  set artist_id = v_uid, updated_at = now()
  where artwork_id = p_artwork_id
    and ended_at is null
    and artist_id is null;
end;
$$;

-- ---------------------------------------------------------------------------
-- H1: ownership_events immutability
-- ---------------------------------------------------------------------------
drop policy if exists "ownership_events_update_artist_own_artwork" on public.ownership_events;

create or replace function public.prevent_ownership_events_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'ownership_events are immutable' using errcode = '42501';
end;
$$;

drop trigger if exists trg_ownership_events_prevent_update on public.ownership_events;
create trigger trg_ownership_events_prevent_update
  before update on public.ownership_events
  for each row
  execute function public.prevent_ownership_events_update();

-- ---------------------------------------------------------------------------
-- H3: verification_events — RPC / SECURITY DEFINER only for inserts
-- ---------------------------------------------------------------------------
drop policy if exists "verification_events_insert_artist_own_work" on public.verification_events;
drop policy if exists "verification_events_insert_verified_gallery" on public.verification_events;

-- ---------------------------------------------------------------------------
-- H6: Atomic provenance transfer acceptance
-- ---------------------------------------------------------------------------
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

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    raise exception 'Account email required to accept' using errcode = '42501';
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

  if lower(trim(coalesce(v_tr.recipient_email, ''))) <> v_email then
    raise exception 'Sign in with the email address this continuation was sent to'
      using errcode = '42501';
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
  'Accept a pending provenance continuation invite atomically (email + custodian checks).';
