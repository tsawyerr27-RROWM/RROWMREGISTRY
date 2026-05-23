-- Phase B: artwork representation relationships, confirmation chronology, institution filing.

-- ---------------------------------------------------------------------------
-- 1) Relationships (one active row per artwork + institution)
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
  updated_at timestamptz not null default now(),
  constraint arr_status_check check (
    status in (
      'institution_only',
      'invited_pending_artist',
      'artist_confirmed',
      'artist_disputed',
      'representation_ended'
    )
  ),
  constraint arr_initiated_by_check check (
    initiated_by in ('institution', 'artist', 'system')
  )
);

create unique index if not exists artwork_representation_active_uq
  on public.artwork_representation_relationships (artwork_id, gallery_id)
  where ended_at is null;

create index if not exists artwork_representation_gallery_idx
  on public.artwork_representation_relationships (gallery_id, status)
  where ended_at is null;

comment on table public.artwork_representation_relationships is
  'Institution ↔ artwork representation lifecycle; ended_at null = active.';

-- ---------------------------------------------------------------------------
-- 2) Confirmation / filing events (append-only chronology)
-- ---------------------------------------------------------------------------
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
  created_at timestamptz not null default now(),
  constraint ace_participant_type_check check (
    participant_type in ('institution', 'artist', 'system')
  ),
  constraint ace_event_type_check check (
    event_type in (
      'institution_filed',
      'artist_confirmed_authorship',
      'artist_confirmed_representation',
      'artist_confirmed_chronology',
      'representation_ended',
      'artist_disputed_representation'
    )
  )
);

create index if not exists artwork_confirmation_events_artwork_idx
  on public.artwork_confirmation_events (artwork_id, created_at desc);

create index if not exists artwork_confirmation_events_gallery_idx
  on public.artwork_confirmation_events (gallery_id, event_type);

comment on table public.artwork_confirmation_events is
  'Layered participation chronology for institution and artist confirmations.';

-- ---------------------------------------------------------------------------
-- 3) Artwork origin marker (institution-filed vs artist-self)
-- ---------------------------------------------------------------------------
alter table public.artworks
  add column if not exists representation_origin text;

comment on column public.artworks.representation_origin is
  'institution_filed | artist_self — how the registry record entered the system.';

-- ---------------------------------------------------------------------------
-- 4) RLS — read for gallery staff & represented artist; writes via RPC only
-- ---------------------------------------------------------------------------
alter table public.artwork_representation_relationships enable row level security;
alter table public.artwork_confirmation_events enable row level security;

drop policy if exists arr_select_gallery_staff on public.artwork_representation_relationships;
create policy arr_select_gallery_staff
  on public.artwork_representation_relationships for select
  to authenticated
  using (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_representation_relationships.gallery_id
        and gu.user_id = auth.uid()
    )
  );

drop policy if exists arr_select_artist on public.artwork_representation_relationships;
create policy arr_select_artist
  on public.artwork_representation_relationships for select
  to authenticated
  using (artist_id = auth.uid());

drop policy if exists ace_select_gallery_staff on public.artwork_confirmation_events;
create policy ace_select_gallery_staff
  on public.artwork_confirmation_events for select
  to authenticated
  using (
    gallery_id is not null
    and exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_confirmation_events.gallery_id
        and gu.user_id = auth.uid()
    )
  );

drop policy if exists ace_select_artist on public.artwork_confirmation_events;
create policy ace_select_artist
  on public.artwork_confirmation_events for select
  to authenticated
  using (artist_id = auth.uid());

grant select on public.artwork_representation_relationships to authenticated;
grant select on public.artwork_confirmation_events to authenticated;

-- ---------------------------------------------------------------------------
-- 5) Record institution filing after gallery registers a represented work
-- ---------------------------------------------------------------------------
create or replace function public.record_institution_artwork_filing(p_artwork_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artist_id uuid;
  v_gallery_id uuid;
  v_rel_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select a.artist_id into v_artist_id
  from public.artworks a
  where a.id = p_artwork_id;

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
    raise exception 'Artist is not institution-represented for this work';
  end if;

  if not exists (
    select 1
    from public.gallery_users gu
    where gu.gallery_id = v_gallery_id
      and gu.user_id = v_uid
  ) then
    raise exception 'Not authorised for this institution' using errcode = '42501';
  end if;

  select r.id
    into v_rel_id
  from public.artwork_representation_relationships r
  where r.artwork_id = p_artwork_id
    and r.gallery_id = v_gallery_id
    and r.ended_at is null
  limit 1;

  if v_rel_id is null then
    insert into public.artwork_representation_relationships (
      artwork_id,
      gallery_id,
      artist_id,
      status,
      initiated_by
    )
    values (
      p_artwork_id,
      v_gallery_id,
      v_artist_id,
      'institution_only',
      'institution'
    )
    returning id into v_rel_id;
  else
    update public.artwork_representation_relationships
    set updated_at = now()
    where id = v_rel_id;
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
    p_artwork_id,
    v_gallery_id,
    v_artist_id,
    v_rel_id,
    'institution',
    v_gallery_id,
    'institution_filed',
    jsonb_build_object('filed_by_user_id', v_uid)
  );

  update public.artworks
  set representation_origin = 'institution_filed'
  where id = p_artwork_id
    and coalesce(representation_origin, '') = '';

  return v_rel_id;
end;
$$;

revoke all on function public.record_institution_artwork_filing(uuid) from public;
grant execute on function public.record_institution_artwork_filing(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Gallery dashboard participation summary
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
    (select c from pending_invites)
  )
  into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

revoke all on function public.get_gallery_representation_summary(uuid) from public;
grant execute on function public.get_gallery_representation_summary(uuid) to authenticated;
