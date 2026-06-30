-- Value chronology phase model: manual valuations only while artist still holds the work.

create or replace function public.is_primary_market_value_phase(p_artwork_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_artist uuid;
  v_holder uuid;
begin
  if p_artwork_id is null then
    return false;
  end if;

  select a.artist_id into v_artist
  from public.artworks a
  where a.id = p_artwork_id;

  if v_artist is null then
    return false;
  end if;

  v_holder := public.get_current_owner(p_artwork_id);
  return v_holder is null or v_holder = v_artist;
end;
$$;

comment on function public.is_primary_market_value_phase(uuid) is
  'True when canonical owner is the artist (primary market); manual value filings allowed for artist.';

revoke all on function public.is_primary_market_value_phase(uuid) from public;
grant execute on function public.is_primary_market_value_phase(uuid) to authenticated, service_role;

create or replace function public.is_manual_primary_value_type(p_value_type text)
returns boolean
language sql
immutable
as $$
  select coalesce(
    lower(trim(p_value_type)),
    ''
  ) = any (
    array[
      'initial_valuation',
      'valuation',
      'exhibition_value',
      'listing_value',
      'appraisal',
      'initial',
      'internal_estimate'
    ]
  );
$$;

comment on function public.is_manual_primary_value_type(text) is
  'Manual value event types permitted during the primary market phase.';

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

  return public.is_primary_market_value_phase(p_artwork_id);
end;
$$;

comment on function public.can_record_value_event(uuid, uuid) is
  'True when user is the artist and the work is still in the primary market (artist-owned).';

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
    if public.is_primary_market_value_phase(p_artwork_id) then
      raise exception 'Only the artist may record manual value events while the work remains in the primary market'
        using errcode = '42501';
    end if;
    raise exception 'Value chronology is market-driven after the work leaves the artist''s holdings'
      using errcode = '42501';
  end if;

  v_value_type := lower(trim(coalesce(p_value_type, '')));
  if v_value_type = '' then
    v_value_type := 'initial_valuation';
  end if;

  if not public.is_manual_primary_value_type(v_value_type) then
    raise exception 'Value type % is not permitted for manual primary-market filings', v_value_type
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
  'Insert manual value_events row during primary market (artist-owned phase only).';

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
    if public.is_primary_market_value_phase(p_artwork_id) then
      raise exception 'Only the artist may record manual value events while the work remains in the primary market'
        using errcode = '42501';
    end if;
    raise exception 'Value chronology is market-driven after the work leaves the artist''s holdings'
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
