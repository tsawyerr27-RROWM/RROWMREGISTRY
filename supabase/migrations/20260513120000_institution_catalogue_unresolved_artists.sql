-- Institution catalogue: canonical artwork records without requiring artist accounts.
-- Plain-text artist identity, nullable artist_id, institution filing via filing_gallery_id.

-- ---------------------------------------------------------------------------
-- 1) Unresolved artist identity on artworks
-- ---------------------------------------------------------------------------
alter table public.artworks
  add column if not exists catalogue_artist_name text,
  add column if not exists filing_gallery_id uuid references public.galleries (id) on delete set null,
  add column if not exists pending_artist_email text;

comment on column public.artworks.catalogue_artist_name is
  'Plain-text artist name at institution registration when no platform artist is linked.';
comment on column public.artworks.filing_gallery_id is
  'Institution that filed this canonical record (independent of artist roster).';
comment on column public.artworks.pending_artist_email is
  'Optional email for later artist authentication / record deepening.';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'artworks'
      and column_name = 'artist_id'
      and is_nullable = 'NO'
  ) then
    alter table public.artworks alter column artist_id drop not null;
  end if;
end $$;

create index if not exists artworks_filing_gallery_idx
  on public.artworks (filing_gallery_id)
  where filing_gallery_id is not null;

-- ---------------------------------------------------------------------------
-- 2) Chronology: authorship contribution (not “edit”)
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
      'artist_authorship_contribution',
      'representation_ended',
      'artist_disputed_representation'
    )
  );

-- ---------------------------------------------------------------------------
-- 3) Institution registration (canonical record + filing in one transaction)
-- ---------------------------------------------------------------------------
create or replace function public.register_institution_artwork_atomic(
  p_gallery_id uuid,
  p_title text,
  p_year text,
  p_medium text,
  p_dimensions text,
  p_description text,
  p_image_url text,
  p_registry_id text,
  p_metadata_hash text,
  p_catalogue_artist_name text default null,
  p_artist_id uuid default null,
  p_pending_artist_email text default null
)
returns public.artworks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artwork public.artworks%rowtype;
  v_owner uuid;
  v_name text;
  v_email text;
  v_rel_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_gallery_id is null then
    raise exception 'Gallery is required';
  end if;

  if not exists (
    select 1
    from public.gallery_users gu
    where gu.gallery_id = p_gallery_id
      and gu.user_id = v_uid
  ) then
    raise exception 'Not authorised for this institution' using errcode = '42501';
  end if;

  v_name := nullif(trim(coalesce(p_catalogue_artist_name, '')), '');
  v_email := nullif(lower(trim(coalesce(p_pending_artist_email, ''))), '');

  if p_artist_id is null and v_name is null then
    raise exception 'Artist name is required when no artist account is linked';
  end if;

  if p_artist_id is not null and not exists (
    select 1 from public.artists ar where ar.id = p_artist_id
  ) then
    raise exception 'Artist account not found';
  end if;

  v_owner := coalesce(p_artist_id, v_uid);

  insert into public.artworks (
    artist_id,
    catalogue_artist_name,
    filing_gallery_id,
    pending_artist_email,
    title,
    year,
    medium,
    dimensions,
    description,
    image_url,
    registry_id,
    metadata_hash,
    representation_origin,
    current_owner_id
  )
  values (
    p_artist_id,
    case when p_artist_id is null then v_name else null end,
    p_gallery_id,
    v_email,
    p_title,
    p_year,
    p_medium,
    p_dimensions,
    p_description,
    p_image_url,
    p_registry_id,
    p_metadata_hash,
    'institution_filed',
    v_owner
  )
  returning * into v_artwork;

  insert into public.ownership_events (
    artwork_id,
    transfer_type,
    to_user_id,
    verification_status
  )
  values (
    v_artwork.id,
    'initial',
    v_owner,
    'recorded'
  );

  select r.id into v_rel_id
  from public.artwork_representation_relationships r
  where r.artwork_id = v_artwork.id
    and r.gallery_id = p_gallery_id
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
      v_artwork.id,
      p_gallery_id,
      p_artist_id,
      'institution_only',
      'institution'
    )
    returning id into v_rel_id;
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
    v_artwork.id,
    p_gallery_id,
    p_artist_id,
    v_rel_id,
    'institution',
    p_gallery_id,
    'institution_filed',
    jsonb_build_object(
      'filed_by_user_id', v_uid,
      'catalogue_artist_name', v_name,
      'pending_artist_email', v_email,
      'artist_id_linked', p_artist_id is not null
    )
  );

  return v_artwork;
end;
$$;

revoke all on function public.register_institution_artwork_atomic(
  uuid, text, text, text, text, text, text, text, text, text, uuid, text
) from public;
grant execute on function public.register_institution_artwork_atomic(
  uuid, text, text, text, text, text, text, text, text, text, uuid, text
) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Institution filing — use filing_gallery_id (not only represented roster)
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
  v_filing_gallery_id uuid;
  v_rel_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select a.artist_id, a.filing_gallery_id
    into v_artist_id, v_filing_gallery_id
  from public.artworks a
  where a.id = p_artwork_id;

  if not found then
    raise exception 'Artwork not found';
  end if;

  v_gallery_id := v_filing_gallery_id;

  if v_gallery_id is null and v_artist_id is not null then
    select ar.gallery_id
      into v_gallery_id
    from public.artists ar
    where ar.id = v_artist_id
      and ar.represented_by_gallery is true
      and ar.gallery_id is not null;
  end if;

  if v_gallery_id is null then
    raise exception 'No institution filing context for this work';
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

  if not exists (
    select 1
    from public.artwork_confirmation_events e
    where e.artwork_id = p_artwork_id
      and e.gallery_id = v_gallery_id
      and e.event_type = 'institution_filed'
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
      v_artist_id,
      v_rel_id,
      'institution',
      v_gallery_id,
      'institution_filed',
      jsonb_build_object('filed_by_user_id', v_uid)
    );
  end if;

  update public.artworks
  set
    representation_origin = 'institution_filed',
    filing_gallery_id = coalesce(filing_gallery_id, v_gallery_id)
  where id = p_artwork_id
    and coalesce(representation_origin, '') = '';

  return v_rel_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5) Artist review queue — linked works + claimable institution catalogue
-- ---------------------------------------------------------------------------
drop function if exists public.get_artist_representation_review_queue();

create or replace function public.get_artist_representation_review_queue()
returns table (
  artwork_id uuid,
  registry_id text,
  title text,
  image_url text,
  gallery_id uuid,
  gallery_name text,
  filed_at timestamptz,
  catalogue_artist_name text,
  artist_linked boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_email text;
  v_display text;
begin
  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));

  select lower(trim(coalesce(ar.display_name, ar.full_name, '')))
    into v_display
  from public.artists ar
  where ar.id = auth.uid();

  return query
  with filed as (
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
      fe.filed_at,
      a.catalogue_artist_name,
      (a.artist_id is not null) as artist_linked
    from public.artworks a
    inner join filed fe on fe.artwork_id = a.id
    where (
      a.artist_id = auth.uid()
      or (
        a.artist_id is null
        and (
          (v_email <> '' and lower(coalesce(a.pending_artist_email, '')) = v_email)
          or (
            v_display <> ''
            and a.catalogue_artist_name is not null
            and lower(trim(a.catalogue_artist_name)) = v_display
          )
        )
      )
    )
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
    p.filed_at,
    p.catalogue_artist_name,
    p.artist_linked
  from pending p
  left join public.galleries g on g.id = p.gallery_id
  order by p.filed_at asc;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6) Non-destructive artist linkage for institution-filed catalogue works
-- ---------------------------------------------------------------------------
create or replace function public.artist_link_catalogue_work(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
  v_display text;
  v_row public.artworks%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_row from public.artworks where id = p_artwork_id;
  if not found then
    raise exception 'Artwork not found';
  end if;

  if v_row.artist_id is not null and v_row.artist_id <> v_uid then
    raise exception 'Work is already linked to another artist' using errcode = '42501';
  end if;

  if v_row.artist_id = v_uid then
    return;
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  select lower(trim(coalesce(ar.display_name, ar.full_name, '')))
    into v_display
  from public.artists ar
  where ar.id = v_uid;

  if not exists (
    select 1
    from public.artwork_confirmation_events e
    where e.artwork_id = p_artwork_id
      and e.event_type = 'institution_filed'
  ) then
    raise exception 'No institution filing on file for this work';
  end if;

  if not (
    (v_email <> '' and lower(coalesce(v_row.pending_artist_email, '')) = v_email)
    or (
      v_display <> ''
      and v_row.catalogue_artist_name is not null
      and lower(trim(v_row.catalogue_artist_name)) = v_display
    )
  ) then
    raise exception 'Not authorized to link this catalogue work' using errcode = '42501';
  end if;

  update public.artworks
  set
    artist_id = v_uid,
    catalogue_artist_name = null
  where id = p_artwork_id;

  update public.artwork_representation_relationships
  set artist_id = v_uid, updated_at = now()
  where artwork_id = p_artwork_id
    and ended_at is null
    and artist_id is null;
end;
$$;

revoke all on function public.artist_link_catalogue_work(uuid) from public;
grant execute on function public.artist_link_catalogue_work(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 7) Artist authenticate + confirm (catalogue claim + layered attestation)
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
  v_filing_gallery_id uuid;
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

  select a.artist_id, a.filing_gallery_id
    into v_artist_id, v_filing_gallery_id
  from public.artworks a
  where a.id = p_artwork_id;

  if not found then
    raise exception 'Artwork not found';
  end if;

  if v_artist_id is null then
    perform public.artist_link_catalogue_work(p_artwork_id);
    v_artist_id := v_uid;
  elsif v_artist_id <> v_uid then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  v_gallery_id := v_filing_gallery_id;

  if v_gallery_id is null then
    select ar.gallery_id, coalesce(ar.represented_by_gallery, false)
      into v_gallery_id, v_represented
    from public.artists ar
    where ar.id = v_uid;
  else
    select coalesce(ar.represented_by_gallery, false)
      into v_represented
    from public.artists ar
    where ar.id = v_uid;
  end if;

  if v_gallery_id is null then
    select e.gallery_id into v_gallery_id
    from public.artwork_confirmation_events e
    where e.artwork_id = p_artwork_id
      and e.event_type = 'institution_filed'
    order by e.created_at desc
    limit 1;
  end if;

  if v_gallery_id is null then
    raise exception 'No institution filing on file for this work';
  end if;

  if v_filing_gallery_id is null
    and (v_gallery_id is null or coalesce(v_represented, false) is not true)
  then
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
      artist_id = coalesce(artist_id, v_uid),
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
        verification_method
      )
      values (
        p_artwork_id,
        'artist',
        v_uid,
        'confirmed',
        'artist_representation_confirm'
      );
    exception
      when others then
        null;
    end;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8) Archival authorship contribution (append-only; not field overwrite)
-- ---------------------------------------------------------------------------
create or replace function public.artist_contribute_authorship_on_file(
  p_artwork_id uuid,
  p_authorship_statement text default null,
  p_chronology_contribution text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artist_id uuid;
  v_gallery_id uuid;
  v_stmt text;
  v_chron text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  v_stmt := nullif(trim(coalesce(p_authorship_statement, '')), '');
  v_chron := nullif(trim(coalesce(p_chronology_contribution, '')), '');

  if v_stmt is null and v_chron is null then
    raise exception 'Contribution text is required';
  end if;

  select a.artist_id, a.filing_gallery_id
    into v_artist_id, v_gallery_id
  from public.artworks a
  where a.id = p_artwork_id;

  if not found then
    raise exception 'Artwork not found';
  end if;

  if v_artist_id is null then
    perform public.artist_link_catalogue_work(p_artwork_id);
    v_artist_id := v_uid;
  elsif v_artist_id <> v_uid then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if v_gallery_id is null then
    select e.gallery_id into v_gallery_id
    from public.artwork_confirmation_events e
    where e.artwork_id = p_artwork_id
      and e.event_type = 'institution_filed'
    order by e.created_at desc
    limit 1;
  end if;

  insert into public.artwork_confirmation_events (
    artwork_id,
    gallery_id,
    artist_id,
    participant_type,
    participant_id,
    event_type,
    payload
  )
  values (
    p_artwork_id,
    v_gallery_id,
    v_uid,
    'artist',
    v_uid,
    'artist_authorship_contribution',
    jsonb_build_object(
      'authorship_statement', v_stmt,
      'chronology_contribution', v_chron,
      'contribution_kind', 'archival_authorship'
    )
  );
end;
$$;

revoke all on function public.artist_contribute_authorship_on_file(uuid, text, text) from public;
grant execute on function public.artist_contribute_authorship_on_file(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 9) Gallery summary — count institution-filed catalogue (not only roster artists)
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
    where a.filing_gallery_id = p_gallery_id
       or exists (
         select 1
         from public.artists ar
         where ar.id = a.artist_id
           and ar.gallery_id = p_gallery_id
       )
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
        'artist_confirmed_chronology',
        'artist_authorship_contribution'
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
