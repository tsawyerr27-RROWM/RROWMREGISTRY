-- Valuation authority follows canonical stewardship (not authorship).

alter table public.value_events
  add column if not exists source text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.value_events.source is
  'Origin of the value filing (e.g. deal_execution, studio).';
comment on column public.value_events.metadata is
  'Structured context for deal-derived and system value events.';

create index if not exists value_events_artwork_created_idx
  on public.value_events (artwork_id, created_at desc, id desc);

create index if not exists value_events_deal_execution_deal_id_idx
  on public.value_events ((metadata ->> 'deal_id'))
  where source = 'deal_execution';

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
  v_holder uuid;
  v_artist uuid;
begin
  v_uid := coalesce(p_user_id, auth.uid());
  if v_uid is null or p_artwork_id is null then
    return false;
  end if;

  v_holder := public.get_current_owner(p_artwork_id);
  if v_holder is not null then
    return v_holder = v_uid;
  end if;

  select a.artist_id into v_artist
  from public.artworks a
  where a.id = p_artwork_id;

  return v_artist is not null and v_artist = v_uid;
end;
$$;

comment on function public.can_record_value_event(uuid, uuid) is
  'True when user is canonical steward (ledger holder) or artist when no ledger holder exists.';

revoke all on function public.can_record_value_event(uuid, uuid) from public;
grant execute on function public.can_record_value_event(uuid, uuid) to authenticated, service_role;

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
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_artwork_id is null then
    raise exception 'Missing artwork_id' using errcode = '22023';
  end if;

  if not public.can_record_value_event(p_artwork_id, v_uid) then
    raise exception 'Only the current steward of this work may record valuation events'
      using errcode = '42501';
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
    created_at
  )
  values (
    p_artwork_id,
    p_declared_value,
    v_currency,
    coalesce(nullif(trim(p_value_type), ''), 'initial'),
    coalesce(nullif(trim(p_visibility_level), ''), 'private'),
    nullif(trim(p_note), ''),
    now()
  )
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.add_value_event(uuid, numeric, text, text, text, text) is
  'Insert value_events row when caller is current steward (ledger authority).';

revoke all on function public.add_value_event(uuid, numeric, text, text, text, text) from public;
grant execute on function public.add_value_event(uuid, numeric, text, text, text, text) to authenticated;
grant execute on function public.add_value_event(uuid, numeric, text, text, text, text) to service_role;

drop policy if exists "value_events_update_artist_own_artwork" on public.value_events;
drop policy if exists "value_events_update_steward_own_artwork" on public.value_events;

create or replace function public.on_value_event_sale_intent()
returns trigger
language plpgsql
as $$
begin
  if new.value_type in (
      'sale',
      'sale_value',
      'auction',
      'primary_sale',
      'secondary_sale'
    )
    and coalesce(new.ownership_resolved, false) = false then
    insert into public.sale_intents (artwork_id, value_event_id)
    values (new.artwork_id, new.id)
    on conflict (value_event_id) do nothing;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
