-- Depends on 20260327360000_marketplace_backend.sql (public.market_listings).
-- Sets buyer ownership after marketplace sale to verified + verification_method = transfer_chain.

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
begin
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

revoke all on function public.complete_market_sale(uuid, uuid) from public;
grant execute on function public.complete_market_sale(uuid, uuid) to authenticated;

comment on function public.complete_market_sale(uuid, uuid) is
  'Complete an active marketplace sale: value_event + verified ownership_event (transfer_chain), mark listing sold.';
