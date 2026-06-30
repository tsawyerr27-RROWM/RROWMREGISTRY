-- Value chronology phase follows completed sale history (not current owner).

create or replace function public.has_completed_sale(p_artwork_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_artwork_id is null then
    return false;
  end if;

  if exists (
    select 1
    from public.value_events ve
    where ve.artwork_id = p_artwork_id
      and (
        lower(coalesce(ve.source, '')) in ('deal_execution', 'market_sale')
        or lower(coalesce(ve.value_type, '')) in (
          'sale_value',
          'sale',
          'primary_sale',
          'secondary_sale',
          'auction',
          'auction_sale',
          'gallery_resale',
          'market_sale'
        )
        or coalesce(ve.metadata ->> 'acquisition', '') in ('true', 't', '1')
      )
  ) then
    return true;
  end if;

  if exists (
    select 1
    from public.deals d
    where d.artwork_id = p_artwork_id
      and lower(coalesce(d.type, '')) = 'acquisition'
      and lower(coalesce(d.status, '')) = 'closed'
  ) then
    return true;
  end if;

  if exists (
    select 1
    from public.market_listings ml
    where ml.artwork_id = p_artwork_id
      and lower(coalesce(ml.status, '')) = 'sold'
  ) then
    return true;
  end if;

  return false;
end;
$$;

comment on function public.has_completed_sale(uuid) is
  'True when artwork chronology includes a completed sale (value event, closed acquisition, or sold listing).';

revoke all on function public.has_completed_sale(uuid) from public;
grant execute on function public.has_completed_sale(uuid) to authenticated, service_role;

create or replace function public.is_price_discovery_value_phase(p_artwork_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_artwork_id is not null
    and not public.has_completed_sale(p_artwork_id);
$$;

comment on function public.is_price_discovery_value_phase(uuid) is
  'True before any completed sale; manual artist valuations allowed in this phase only.';

revoke all on function public.is_price_discovery_value_phase(uuid) from public;
grant execute on function public.is_price_discovery_value_phase(uuid) to authenticated, service_role;

-- Backward-compatible alias
create or replace function public.is_primary_market_value_phase(p_artwork_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_price_discovery_value_phase(p_artwork_id);
$$;

comment on function public.is_primary_market_value_phase(uuid) is
  'Deprecated alias for is_price_discovery_value_phase (sale-history based).';

create or replace function public.can_record_value_event(
  p_artwork_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artist uuid;
begin
  v_uid := coalesce(p_user_id, auth.uid());
  if v_uid is null or p_artwork_id is null then
    return false;
  end if;

  select a.artist_id into v_artist
  from public.artworks a
  where a.id = p_artwork_id;

  if v_artist is null or v_artist <> v_uid then
    return false;
  end if;

  return public.is_price_discovery_value_phase(p_artwork_id);
end;
$$;

comment on function public.can_record_value_event(uuid, uuid) is
  'True when user is the artist and the work has never completed a sale (price discovery phase).';

create or replace function public.add_value_event(
  p_artwork_id uuid,
  p_declared_value numeric,
  p_currency text,
  p_value_type text,
  p_visibility_level text,
  p_note text default null
)
returns public.value_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_row public.value_events;
  v_currency text;
  v_value_type text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_artwork_id is null then
    raise exception 'Missing artwork_id' using errcode = '22023';
  end if;

  if not public.can_record_value_event(p_artwork_id, v_uid) then
    if public.is_price_discovery_value_phase(p_artwork_id) then
      raise exception 'Only the artist may record manual value events during the price discovery phase'
        using errcode = '42501';
    end if;
    raise exception 'Value chronology is market-driven after a completed sale has been recorded'
      using errcode = '42501';
  end if;

  v_value_type := lower(trim(coalesce(p_value_type, '')));
  if v_value_type = '' then
    v_value_type := 'initial_valuation';
  end if;

  if not public.is_manual_primary_value_type(v_value_type) then
    raise exception 'Value type % is not permitted for manual price-discovery filings', v_value_type
      using errcode = '22023';
  end if;

  v_currency := upper(trim(coalesce(p_currency, '')));
  if v_currency = '' then
    raise exception 'Missing currency' using errcode = '22023';
  end if;

  insert into public.value_events (
    artwork_id,
    declared_value,
    currency,
    value_type,
    visibility_level,
    note,
    source,
    created_at
  )
  values (
    p_artwork_id,
    p_declared_value,
    v_currency,
    v_value_type,
    coalesce(nullif(trim(p_visibility_level), ''), 'private'),
    nullif(trim(p_note), ''),
    'studio',
    now()
  )
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.add_value_event(uuid, numeric, text, text, text, text) is
  'Insert manual value_events row during price discovery (no completed sale on chronology).';

create or replace function public.add_value_correction(
  p_artwork_id uuid,
  p_references_event_id uuid,
  p_corrected_value numeric,
  p_currency text,
  p_reason text,
  p_visibility_level text default 'private'
)
returns public.value_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_row public.value_events;
  v_ref public.value_events;
  v_currency text;
  v_reason text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_artwork_id is null or p_references_event_id is null then
    raise exception 'Missing artwork_id or references_event_id' using errcode = '22023';
  end if;

  if not public.can_record_value_event(p_artwork_id, v_uid) then
    if public.is_price_discovery_value_phase(p_artwork_id) then
      raise exception 'Only the artist may record manual value events during the price discovery phase'
        using errcode = '42501';
    end if;
    raise exception 'Value chronology is market-driven after a completed sale has been recorded'
      using errcode = '42501';
  end if;

  select * into v_ref
  from public.value_events
  where id = p_references_event_id
    and artwork_id = p_artwork_id;

  if not found then
    raise exception 'Referenced value event not found for this artwork' using errcode = 'P0002';
  end if;

  v_currency := upper(trim(coalesce(p_currency, '')));
  if v_currency = '' then
    raise exception 'Missing currency' using errcode = '22023';
  end if;

  v_reason := nullif(trim(coalesce(p_reason, '')), '');
  if v_reason is null then
    raise exception 'Correction reason is required' using errcode = '22023';
  end if;

  insert into public.value_events (
    artwork_id,
    declared_value,
    currency,
    value_type,
    visibility_level,
    note,
    references_event_id,
    source,
    created_at
  )
  values (
    p_artwork_id,
    p_corrected_value,
    v_currency,
    'value_correction',
    coalesce(nullif(trim(p_visibility_level), ''), 'private'),
    v_reason,
    p_references_event_id,
    'studio',
    now()
  )
  returning * into v_row;

  return v_row;
end;
$$;

notify pgrst, 'reload schema';
