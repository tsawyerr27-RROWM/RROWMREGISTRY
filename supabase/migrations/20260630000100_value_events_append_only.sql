-- Value chronology: append-only for authenticated users; service role retains override.

alter table public.value_events
  add column if not exists references_event_id uuid references public.value_events (id) on delete restrict;

comment on column public.value_events.references_event_id is
  'Prior value_events row corrected by this filing (value_correction only).';

create index if not exists value_events_references_event_id_idx
  on public.value_events (references_event_id)
  where references_event_id is not null;

-- ---------------------------------------------------------------------------
-- Immutability: block user edits/deletes; allow system ownership_resolved sync
-- ---------------------------------------------------------------------------
create or replace function public.enforce_value_event_immutability()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Value events cannot be deleted.'
      using errcode = 'P0001';
  end if;

  if tg_op = 'UPDATE' then
    if (
      (to_jsonb(new) - 'ownership_resolved' - 'updated_at')
      =
      (to_jsonb(old) - 'ownership_resolved' - 'updated_at')
    ) then
      return new;
    end if;

    raise exception 'Value events are immutable registry records.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_value_event_immutability on public.value_events;
create trigger trg_enforce_value_event_immutability
before update or delete on public.value_events
for each row
execute function public.enforce_value_event_immutability();

comment on function public.enforce_value_event_immutability() is
  'Append-only value chronology: only ownership_resolved may change after insert (system path).';

-- ---------------------------------------------------------------------------
-- RLS: SELECT only for authenticated/anon; no UPDATE/DELETE policies
-- ---------------------------------------------------------------------------
drop policy if exists "value_events_update_artist_own_artwork" on public.value_events;
drop policy if exists "value_events_update_steward_own_artwork" on public.value_events;
drop policy if exists "value_events_update" on public.value_events;
drop policy if exists "value_events_delete" on public.value_events;
drop policy if exists "rrowm_value_events_delete" on public.value_events;

revoke update, delete on public.value_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Correction filing (append-only alternative to edit)
-- ---------------------------------------------------------------------------
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
    raise exception 'Only the current steward of this work may record valuation events'
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
    metadata,
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
    'studio_correction',
    jsonb_build_object(
      'references_event_id', p_references_event_id,
      'corrected_value', p_corrected_value
    ),
    now()
  )
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.add_value_correction(uuid, uuid, numeric, text, text, text) is
  'Append corrective valuation filing; does not mutate the referenced event.';

revoke all on function public.add_value_correction(uuid, uuid, numeric, text, text, text) from public;
grant execute on function public.add_value_correction(uuid, uuid, numeric, text, text, text) to authenticated;
grant execute on function public.add_value_correction(uuid, uuid, numeric, text, text, text) to service_role;

notify pgrst, 'reload schema';
