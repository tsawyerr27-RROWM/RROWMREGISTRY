-- Phase D: representation amendment requests (artist ↔ institution).
-- Requires artwork_confirmation_events (Phase B/C). Idempotent bootstrap below if missing.

-- ---------------------------------------------------------------------------
-- 0) Prerequisite tables (idempotent — safe if 20260509120000 already applied)
-- ---------------------------------------------------------------------------
create table if not exists public.artwork_representation_relationships (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  artist_id uuid references public.artists (id) on delete set null,
  status text not null default 'institution_only',
  initiated_by text not null default 'institution',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwork_confirmation_events (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  gallery_id uuid references public.galleries (id) on delete set null,
  artist_id uuid references public.artists (id) on delete set null,
  relationship_id uuid references public.artwork_representation_relationships (id) on delete set null,
  participant_type text not null,
  participant_id uuid not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 1) Extend confirmation event types
-- ---------------------------------------------------------------------------
alter table public.artwork_confirmation_events
  drop constraint if exists ace_event_type_check;

alter table public.artwork_confirmation_events
  add constraint ace_event_type_check check (
    event_type in (
      'institution_filed',
      'artist_confirmed_authorship',
      'artist_confirmed_representation',
      'artist_confirmed_chronology',
      'representation_ended',
      'artist_disputed_representation',
      'representation_amendment_requested',
      'representation_amendment_accepted',
      'representation_amendment_declined',
      'representation_amendment_withdrawn'
    )
  );

-- ---------------------------------------------------------------------------
-- 2) Amendment requests (one pending row per artwork)
-- ---------------------------------------------------------------------------
create table if not exists public.representation_amendment_requests (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  relationship_id uuid references public.artwork_representation_relationships (id) on delete set null,
  requested_by_user_id uuid not null,
  requester_role text not null,
  notes text not null default '',
  proposed_changes jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  resolution_notes text,
  resolved_by_user_id uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ram_requester_role_check check (requester_role in ('artist', 'institution')),
  constraint ram_status_check check (status in ('pending', 'withdrawn', 'accepted', 'declined'))
);

create unique index if not exists representation_amendment_one_pending_per_artwork
  on public.representation_amendment_requests (artwork_id)
  where status = 'pending';

create index if not exists representation_amendment_gallery_status_idx
  on public.representation_amendment_requests (gallery_id, status, created_at desc);

comment on table public.representation_amendment_requests is
  'Phase D: counterpart accepts or declines; optional proposed catalogue fields applied on acceptance.';

alter table public.representation_amendment_requests enable row level security;

drop policy if exists ram_select_artist on public.representation_amendment_requests;
create policy ram_select_artist
  on public.representation_amendment_requests for select
  to authenticated
  using (
    exists (
      select 1
      from public.artworks a
      where a.id = representation_amendment_requests.artwork_id
        and a.artist_id = auth.uid()
    )
  );

drop policy if exists ram_select_gallery on public.representation_amendment_requests;
create policy ram_select_gallery
  on public.representation_amendment_requests for select
  to authenticated
  using (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = representation_amendment_requests.gallery_id
        and gu.user_id = auth.uid()
    )
  );

grant select on public.representation_amendment_requests to authenticated;

-- ---------------------------------------------------------------------------
-- 3) request_representation_amendment
-- ---------------------------------------------------------------------------
create or replace function public.request_representation_amendment(
  p_artwork_id uuid,
  p_notes text,
  p_proposed_changes jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artist_id uuid;
  v_gallery_id uuid;
  v_relationship_id uuid;
  v_role text;
  v_notes text;
  v_amendment_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  v_notes := trim(coalesce(p_notes, ''));
  if length(v_notes) < 3 then
    raise exception 'Please add a short note (at least 3 characters) describing the amendment.';
  end if;

  select a.artist_id into v_artist_id from public.artworks a where a.id = p_artwork_id;
  if v_artist_id is null then
    raise exception 'Artwork not found';
  end if;

  select ar.gallery_id
    into v_gallery_id
  from public.artists ar
  where ar.id = v_artist_id
    and ar.represented_by_gallery is true
    and ar.gallery_id is not null;

  if v_gallery_id is null then
    raise exception 'Work is not under institution representation on file';
  end if;

  if v_artist_id = v_uid then
    v_role := 'artist';
  elsif exists (
    select 1
    from public.gallery_users gu
    where gu.gallery_id = v_gallery_id
      and gu.user_id = v_uid
      and gu.role in ('admin', 'staff')
  ) then
    v_role := 'institution';
  else
    raise exception 'Not authorised to request an amendment for this work' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.representation_amendment_requests r
    where r.artwork_id = p_artwork_id
      and r.status = 'pending'
  ) then
    raise exception 'An amendment request is already pending for this work';
  end if;

  select r.id
    into v_relationship_id
  from public.artwork_representation_relationships r
  where r.artwork_id = p_artwork_id
    and r.gallery_id = v_gallery_id
    and r.ended_at is null
  limit 1;

  insert into public.representation_amendment_requests (
    artwork_id,
    gallery_id,
    relationship_id,
    requested_by_user_id,
    requester_role,
    notes,
    proposed_changes
  )
  values (
    p_artwork_id,
    v_gallery_id,
    v_relationship_id,
    v_uid,
    v_role,
    v_notes,
    coalesce(p_proposed_changes, '{}'::jsonb)
  )
  returning id into v_amendment_id;

  insert into public.artwork_confirmation_events (
    artwork_id,
    gallery_id,
    artist_id,
    relationship_id,
    participant_type,
    participant_id,
    event_type,
    payload
  )
  values (
    p_artwork_id,
    v_gallery_id,
    v_artist_id,
    v_relationship_id,
    case when v_role = 'artist' then 'artist' else 'institution' end,
    case when v_role = 'artist' then v_uid else v_gallery_id end,
    'representation_amendment_requested',
    jsonb_build_object(
      'amendment_id', v_amendment_id,
      'requester_role', v_role
    )
  );

  return v_amendment_id;
end;
$$;

revoke all on function public.request_representation_amendment(uuid, text, jsonb) from public;
grant execute on function public.request_representation_amendment(uuid, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) withdraw_representation_amendment (requester only)
-- ---------------------------------------------------------------------------
create or replace function public.withdraw_representation_amendment(p_amendment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_row record;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select r.* into v_row
  from public.representation_amendment_requests r
  where r.id = p_amendment_id;

  if v_row.id is null then
    raise exception 'Amendment request not found';
  end if;

  if v_row.requested_by_user_id <> v_uid then
    raise exception 'Only the requester can withdraw this amendment' using errcode = '42501';
  end if;

  if v_row.status <> 'pending' then
    raise exception 'This amendment is no longer pending';
  end if;

  update public.representation_amendment_requests
  set
    status = 'withdrawn',
    updated_at = now(),
    resolved_at = now(),
    resolved_by_user_id = v_uid,
    resolution_notes = 'Withdrawn by requester'
  where id = p_amendment_id;

  insert into public.artwork_confirmation_events (
    artwork_id,
    gallery_id,
    artist_id,
    relationship_id,
    participant_type,
    participant_id,
    event_type,
    payload
  )
  values (
    v_row.artwork_id,
    v_row.gallery_id,
    (select artist_id from public.artworks where id = v_row.artwork_id),
    v_row.relationship_id,
    case when v_row.requester_role = 'artist' then 'artist' else 'institution' end,
    case when v_row.requester_role = 'artist' then v_uid else v_row.gallery_id end,
    'representation_amendment_withdrawn',
    jsonb_build_object('amendment_id', p_amendment_id)
  );
end;
$$;

revoke all on function public.withdraw_representation_amendment(uuid) from public;
grant execute on function public.withdraw_representation_amendment(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5) resolve_representation_amendment (counterpart only)
-- ---------------------------------------------------------------------------
create or replace function public.resolve_representation_amendment(
  p_amendment_id uuid,
  p_accept boolean,
  p_resolution_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_row record;
  v_artist_id uuid;
  v_note text;
  v_title text;
  v_year text;
  v_medium text;
  v_dimensions text;
  v_description text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select r.* into v_row
  from public.representation_amendment_requests r
  where r.id = p_amendment_id;

  if v_row.id is null then
    raise exception 'Amendment request not found';
  end if;

  if v_row.status <> 'pending' then
    raise exception 'This amendment is no longer pending';
  end if;

  select a.artist_id into v_artist_id from public.artworks a where a.id = v_row.artwork_id;

  if v_row.requester_role = 'artist' then
    if not exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = v_row.gallery_id
        and gu.user_id = v_uid
        and gu.role in ('admin', 'staff')
    ) then
      raise exception 'Only institution staff can resolve this request' using errcode = '42501';
    end if;
  else
    if v_uid <> v_artist_id then
      raise exception 'Only the artist can resolve this institution request' using errcode = '42501';
    end if;
  end if;

  v_note := nullif(trim(coalesce(p_resolution_notes, '')), '');

  v_title := nullif(trim(coalesce(v_row.proposed_changes ->> 'title', '')), '');
  v_year := nullif(trim(coalesce(v_row.proposed_changes ->> 'year', '')), '');
  v_medium := nullif(trim(coalesce(v_row.proposed_changes ->> 'medium', '')), '');
  v_dimensions := nullif(trim(coalesce(v_row.proposed_changes ->> 'dimensions', '')), '');
  v_description := nullif(trim(coalesce(v_row.proposed_changes ->> 'description', '')), '');

  if p_accept then
    update public.representation_amendment_requests
    set
      status = 'accepted',
      updated_at = now(),
      resolved_at = now(),
      resolved_by_user_id = v_uid,
      resolution_notes = v_note
    where id = p_amendment_id;

    if v_title is not null then
      update public.artworks set title = v_title where id = v_row.artwork_id;
    end if;
    if v_year is not null then
      update public.artworks set year = v_year where id = v_row.artwork_id;
    end if;
    if v_medium is not null then
      update public.artworks set medium = v_medium where id = v_row.artwork_id;
    end if;
    if v_dimensions is not null then
      update public.artworks set dimensions = v_dimensions where id = v_row.artwork_id;
    end if;
    if v_description is not null then
      update public.artworks set description = v_description where id = v_row.artwork_id;
    end if;

    insert into public.artwork_confirmation_events (
      artwork_id,
      gallery_id,
      artist_id,
      relationship_id,
      participant_type,
      participant_id,
      event_type,
      payload
    )
    values (
      v_row.artwork_id,
      v_row.gallery_id,
      v_artist_id,
      v_row.relationship_id,
      case when v_row.requester_role = 'artist' then 'institution' else 'artist' end,
      case when v_row.requester_role = 'artist' then v_row.gallery_id else v_uid end,
      'representation_amendment_accepted',
      jsonb_build_object('amendment_id', p_amendment_id, 'resolution_notes', v_note)
    );
  else
    update public.representation_amendment_requests
    set
      status = 'declined',
      updated_at = now(),
      resolved_at = now(),
      resolved_by_user_id = v_uid,
      resolution_notes = v_note
    where id = p_amendment_id;

    insert into public.artwork_confirmation_events (
      artwork_id,
      gallery_id,
      artist_id,
      relationship_id,
      participant_type,
      participant_id,
      event_type,
      payload
    )
    values (
      v_row.artwork_id,
      v_row.gallery_id,
      v_artist_id,
      v_row.relationship_id,
      case when v_row.requester_role = 'artist' then 'institution' else 'artist' end,
      case when v_row.requester_role = 'artist' then v_row.gallery_id else v_uid end,
      'representation_amendment_declined',
      jsonb_build_object('amendment_id', p_amendment_id, 'resolution_notes', v_note)
    );
  end if;
end;
$$;

revoke all on function public.resolve_representation_amendment(uuid, boolean, text) from public;
grant execute on function public.resolve_representation_amendment(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Gallery summary: pending amendment count
-- ---------------------------------------------------------------------------
create or replace function public.get_gallery_representation_summary(p_gallery_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_result jsonb;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.gallery_users gu
    where gu.gallery_id = p_gallery_id
      and gu.user_id = v_uid
  ) then
    raise exception 'Not authorised for this institution' using errcode = '42501';
  end if;

  with gallery_artworks as (
    select a.id as artwork_id
    from public.artworks a
    inner join public.artists ar on ar.id = a.artist_id
    where ar.gallery_id = p_gallery_id
  ),
  institution_filed as (
    select distinct e.artwork_id
    from public.artwork_confirmation_events e
    inner join gallery_artworks g on g.artwork_id = e.artwork_id
    where e.gallery_id = p_gallery_id
      and e.event_type = 'institution_filed'
  ),
  artist_confirmed as (
    select distinct e.artwork_id
    from public.artwork_confirmation_events e
    inner join gallery_artworks g on g.artwork_id = e.artwork_id
    where e.gallery_id = p_gallery_id
      and e.event_type in (
        'artist_confirmed_authorship',
        'artist_confirmed_representation',
        'artist_confirmed_chronology'
      )
  ),
  pending_invites as (
    select count(*)::int as c
    from public.gallery_artist_invites i
    where i.gallery_id = p_gallery_id
      and lower(coalesce(i.status, '')) = 'pending'
  ),
  amendments_pending as (
    select count(*)::int as c
    from public.representation_amendment_requests r
    where r.gallery_id = p_gallery_id
      and r.status = 'pending'
  )
  select jsonb_build_object(
    'catalogue_works',
    (select count(*)::int from gallery_artworks),
    'institution_filed',
    (select count(*)::int from institution_filed),
    'artist_confirmed',
    (select count(*)::int from artist_confirmed),
    'participation_pending',
    (
      select count(*)::int
      from institution_filed i
      where not exists (
        select 1 from artist_confirmed a where a.artwork_id = i.artwork_id
      )
    ),
    'roster_invites_pending',
    (select c from pending_invites),
    'amendments_pending',
    (select c from amendments_pending)
  )
  into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

revoke all on function public.get_gallery_representation_summary(uuid) from public;
grant execute on function public.get_gallery_representation_summary(uuid) to authenticated;
