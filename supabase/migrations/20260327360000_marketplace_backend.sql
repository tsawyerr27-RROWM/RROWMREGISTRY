-- Marketplace backend (no UI): listings integrated with ownership + value_events.

-- ---------------------------------------------------------------------------
-- 1) market_listings table
-- ---------------------------------------------------------------------------
create table if not exists public.market_listings (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  seller_user_id uuid not null references auth.users (id) on delete cascade,
  price numeric not null,
  currency text not null,
  status text not null default 'active',
  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'market_listings_price_positive'
  ) then
    alter table public.market_listings
      add constraint market_listings_price_positive
      check (price > 0);
  end if;
exception
  when duplicate_object then null;
end $$;

create index if not exists market_listings_artwork_id_idx
  on public.market_listings (artwork_id);

create index if not exists market_listings_seller_user_id_idx
  on public.market_listings (seller_user_id);

create index if not exists market_listings_status_idx
  on public.market_listings (status);

do $$
begin
  -- Keep values flexible but enforce expected states.
  if not exists (
    select 1 from pg_constraint where conname = 'market_listings_status_check'
  ) then
    alter table public.market_listings
      add constraint market_listings_status_check
      check (status in ('active', 'sold', 'cancelled', 'expired'));
  end if;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'market_listings_visibility_check'
  ) then
    alter table public.market_listings
      add constraint market_listings_visibility_check
      check (visibility in ('public', 'private'));
  end if;
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 2) RLS
-- ---------------------------------------------------------------------------
alter table public.market_listings enable row level security;

-- Ensure helper exists before policies reference it.
-- ---------------------------------------------------------------------------
-- 3) Ownership rule: can_list_artwork(artwork_id, user_id)
-- ---------------------------------------------------------------------------
create or replace function public.can_list_artwork(
  p_artwork_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  with latest as (
    select oe.to_user_id, oe.verification_status
    from public.ownership_events oe
    where oe.artwork_id = p_artwork_id
    order by oe.created_at desc nulls last, oe.id desc
    limit 1
  )
  select
    exists (
      select 1
      from latest
      where latest.to_user_id = p_user_id
        and lower(coalesce(latest.verification_status, 'recorded')) = 'verified'
    );
$$;

comment on function public.can_list_artwork(uuid, uuid) is
  'True only when the latest ownership_events row has to_user_id = user and verification_status = verified.';

drop policy if exists "market_listings_select_public_or_seller" on public.market_listings;
create policy "market_listings_select_public_or_seller"
  on public.market_listings for select
  to anon, authenticated
  using (
    (visibility = 'public')
    or (seller_user_id = auth.uid())
  );

drop policy if exists "market_listings_insert_seller" on public.market_listings;
create policy "market_listings_insert_seller"
  on public.market_listings for insert
  to authenticated
  with check (
    seller_user_id = auth.uid()
    and public.can_list_artwork(artwork_id, auth.uid())
  );

drop policy if exists "market_listings_update_seller" on public.market_listings;
create policy "market_listings_update_seller"
  on public.market_listings for update
  to authenticated
  using (seller_user_id = auth.uid())
  with check (seller_user_id = auth.uid());

-- Defense-in-depth: reject inserts even if policy changes later.
create or replace function public.market_listings_before_insert_enforce()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if new.seller_user_id is distinct from auth.uid() then
    raise exception 'seller_user_id must equal auth.uid()' using errcode = '42501';
  end if;
  if not public.can_list_artwork(new.artwork_id, auth.uid()) then
    raise exception 'You can only list artworks you currently hold with verified ownership' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_market_listings_enforce on public.market_listings;
create trigger trg_market_listings_enforce
before insert on public.market_listings
for each row
execute function public.market_listings_before_insert_enforce();

-- ---------------------------------------------------------------------------
-- 4) RPC: complete_market_sale(listing_id, buyer_user_id)
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
begin
  if p_listing_id is null then
    raise exception 'Missing listing id' using errcode = '22023';
  end if;
  if p_buyer_user_id is null then
    raise exception 'Missing buyer user id' using errcode = '22023';
  end if;

  -- Lock listing row to prevent double-complete.
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

  -- Seller must still own the artwork and the listing must be for verified ownership.
  if not public.can_list_artwork(v_listing.artwork_id, v_listing.seller_user_id) then
    raise exception 'Seller no longer holds verified ownership for this artwork' using errcode = '42501';
  end if;

  -- Value event visibility mirrors listing visibility (private -> certificate, public -> public).
  v_visibility_level := case when v_listing.visibility = 'private' then 'certificate' else 'public' end;

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
    'recorded',
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
  'Complete an active marketplace sale: insert sale value_event + sale ownership_event, then mark listing sold.';

