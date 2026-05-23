-- Phase C: artist review queue + layered confirmation on institution-filed works.
--
-- This file references public.artwork_confirmation_events (Phase B). The block below
-- is idempotent: it creates those objects if missing so this migration succeeds when
-- run alone (e.g. SQL editor) or if 20260509120000 was skipped. Prefer applying
-- 20260509120000_artwork_representation_governance.sql first so you also get
-- record_institution_artwork_filing and get_gallery_representation_summary.

-- ---------------------------------------------------------------------------
-- 0) Ensure Phase B core objects exist (idempotent)
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

alter table public.artworks
  add column if not exists representation_origin text;

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
-- 1) Queue: institution-filed works awaiting artist participation
-- ---------------------------------------------------------------------------
create or replace function public.get_artist_representation_review_queue()
returns table (
  artwork_id uuid,
  registry_id text,
  title text,
  image_url text,
  gallery_id uuid,
  gallery_name text,
  filed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with ar as (
    select id, gallery_id, represented_by_gallery
    from public.artists
    where id = auth.uid()
  ),
  filed as (
    select
      e.artwork_id,
      e.gallery_id,
      max(e.created_at) as filed_at
    from public.artwork_confirmation_events e
    where e.event_type = 'institution_filed'
    group by e.artwork_id, e.gallery_id
  ),
  pending as (
    select
      a.id as artwork_id,
      a.registry_id,
      a.title,
      a.image_url,
      fe.gallery_id,
      fe.filed_at
    from public.artworks a
    inner join ar on true
    inner join filed fe
      on fe.artwork_id = a.id
      and fe.gallery_id = ar.gallery_id
    where a.artist_id = auth.uid()
      and ar.gallery_id is not null
      and coalesce(ar.represented_by_gallery, false) is true
      and not exists (
        select 1
        from public.artwork_confirmation_events c
        where c.artwork_id = a.id
          and c.participant_type = 'artist'
          and c.participant_id = auth.uid()
          and c.event_type in (
            'artist_confirmed_authorship',
            'artist_confirmed_representation',
            'artist_confirmed_chronology'
          )
      )
  )
  select
    p.artwork_id,
    coalesce(p.registry_id::text, ''),
    p.title,
    p.image_url,
    p.gallery_id,
    coalesce(g.name::text, '') as gallery_name,
    p.filed_at
  from pending p
  left join public.galleries g on g.id = p.gallery_id
  order by p.filed_at asc;
$$;

revoke all on function public.get_artist_representation_review_queue() from public;
grant execute on function public.get_artist_representation_review_queue() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Artist confirms authorship, representation, and chronology (idempotent)
-- ---------------------------------------------------------------------------
create or replace function public.artist_confirm_representation_on_file(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artist_id uuid;
  v_gallery_id uuid;
  v_represented boolean;
  v_rel_id uuid;
  v_types text[] := array[
    'artist_confirmed_authorship',
    'artist_confirmed_representation',
    'artist_confirmed_chronology'
  ];
  v_t text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select a.artist_id into v_artist_id
  from public.artworks a
  where a.id = p_artwork_id;

  select ar.gallery_id, coalesce(ar.represented_by_gallery, false)
    into v_gallery_id, v_represented
  from public.artists ar
  where ar.id = v_uid;

  if v_artist_id is null then
    raise exception 'Artwork not found';
  end if;

  if v_artist_id <> v_uid then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if v_gallery_id is null or v_represented is not true then
    raise exception 'You are not represented by an institution on file for this action'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.artwork_confirmation_events e
    where e.artwork_id = p_artwork_id
      and e.gallery_id = v_gallery_id
      and e.event_type = 'institution_filed'
  ) then
    raise exception 'No institution filing on file for this work';
  end if;

  select r.id
    into v_rel_id
  from public.artwork_representation_relationships r
  where r.artwork_id = p_artwork_id
    and r.gallery_id = v_gallery_id
    and r.ended_at is null
  limit 1;

  foreach v_t in array v_types
  loop
    if not exists (
      select 1
      from public.artwork_confirmation_events e
      where e.artwork_id = p_artwork_id
        and e.participant_type = 'artist'
        and e.participant_id = v_uid
        and e.event_type = v_t
    ) then
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
        v_uid,
        v_rel_id,
        'artist',
        v_uid,
        v_t,
        '{}'::jsonb
      );
    end if;
  end loop;

  if v_rel_id is not null then
    update public.artwork_representation_relationships
    set
      status = 'artist_confirmed',
      updated_at = now()
    where id = v_rel_id
      and ended_at is null;
  end if;

  if not exists (
    select 1
    from public.verification_events ve
    where ve.artwork_id = p_artwork_id
      and ve.source = 'artist'
      and ve.source_id = v_uid
      and lower(coalesce(ve.status, '')) = 'confirmed'
  ) then
    begin
      insert into public.verification_events (
        artwork_id,
        source,
        source_id,
        status,
        created_at,
        metadata
      )
      values (
        p_artwork_id,
        'artist',
        v_uid,
        'confirmed',
        now(),
        jsonb_build_object(
          'artist_user_id', v_uid,
          'representation_confirm', true
        )
      );
    exception when others then
      null;
    end;
  end if;

  perform public.refresh_artwork_verification_status(p_artwork_id);
end;
$$;

revoke all on function public.artist_confirm_representation_on_file(uuid) from public;
grant execute on function public.artist_confirm_representation_on_file(uuid) to authenticated;
