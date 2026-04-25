-- Marketplace enquiries (preparation only; UI gated by feature flag).

create table if not exists public.market_enquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.market_listings (id) on delete cascade,
  buyer_user_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists market_enquiries_listing_id_idx
  on public.market_enquiries (listing_id);

create index if not exists market_enquiries_buyer_user_id_idx
  on public.market_enquiries (buyer_user_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'market_enquiries_status_check'
  ) then
    alter table public.market_enquiries
      add constraint market_enquiries_status_check
      check (status in ('open', 'accepted', 'declined'));
  end if;
exception
  when duplicate_object then null;
end $$;

alter table public.market_enquiries enable row level security;

-- Buyer can insert their own enquiry (listing must be selectable to them).
drop policy if exists "market_enquiries_insert_buyer" on public.market_enquiries;
create policy "market_enquiries_insert_buyer"
  on public.market_enquiries for insert
  to authenticated
  with check (
    buyer_user_id = auth.uid()
    and exists (
      select 1
      from public.market_listings ml
      where ml.id = market_enquiries.listing_id
        and (
          ml.visibility = 'public'
          or ml.seller_user_id = auth.uid()
        )
    )
  );

-- Buyer can read their own enquiries; seller can read enquiries for their listings.
drop policy if exists "market_enquiries_select_buyer_or_seller" on public.market_enquiries;
create policy "market_enquiries_select_buyer_or_seller"
  on public.market_enquiries for select
  to authenticated
  using (
    buyer_user_id = auth.uid()
    or exists (
      select 1
      from public.market_listings ml
      where ml.id = market_enquiries.listing_id
        and ml.seller_user_id = auth.uid()
    )
  );

-- Seller can update status for enquiries on their listings.
drop policy if exists "market_enquiries_update_seller" on public.market_enquiries;
create policy "market_enquiries_update_seller"
  on public.market_enquiries for update
  to authenticated
  using (
    exists (
      select 1
      from public.market_listings ml
      where ml.id = market_enquiries.listing_id
        and ml.seller_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.market_listings ml
      where ml.id = market_enquiries.listing_id
        and ml.seller_user_id = auth.uid()
    )
  );

