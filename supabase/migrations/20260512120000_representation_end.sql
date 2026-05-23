-- Phase E: end gallery ↔ artist representation; prior filings remain on the chronology.

-- ---------------------------------------------------------------------------
-- end_gallery_artist_representation
-- ---------------------------------------------------------------------------
create or replace function public.end_gallery_artist_representation(
  p_artist_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_gallery_id uuid;
  v_represented boolean;
  v_role text;
  v_note text;
  v_works_ended int := 0;
  v_rel record;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select ar.gallery_id, coalesce(ar.represented_by_gallery, false)
    into v_gallery_id, v_represented
  from public.artists ar
  where ar.id = p_artist_id;

  if v_gallery_id is null then
    raise exception 'Artist has no institution link on file';
  end if;

  if not v_represented then
    raise exception 'Representation is not active for this artist';
  end if;

  if p_artist_id = v_uid then
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
    raise exception 'Not authorised to end this representation' using errcode = '42501';
  end if;

  v_note := nullif(trim(coalesce(p_notes, '')), '');

  -- Close pending amendments for this gallery's works by this artist.
  update public.representation_amendment_requests r
  set
    status = 'withdrawn',
    updated_at = now(),
    resolved_at = now(),
    resolved_by_user_id = v_uid,
    resolution_notes = coalesce(v_note, 'Representation ended on file')
  where r.status = 'pending'
    and r.gallery_id = v_gallery_id
    and r.artwork_id in (
      select a.id from public.artworks a where a.artist_id = p_artist_id
    );

  for v_rel in
    select r.id, r.artwork_id
    from public.artwork_representation_relationships r
    where r.artist_id = p_artist_id
      and r.gallery_id = v_gallery_id
      and r.ended_at is null
  loop
    update public.artwork_representation_relationships
    set
      status = 'representation_ended',
      ended_at = now(),
      updated_at = now()
    where id = v_rel.id;

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
      v_rel.artwork_id,
      v_gallery_id,
      p_artist_id,
      v_rel.id,
      case when v_role = 'artist' then 'artist' else 'institution' end,
      case when v_role = 'artist' then v_uid else v_gallery_id end,
      'representation_ended',
      jsonb_build_object(
        'ended_by_role', v_role,
        'ended_by_user_id', v_uid,
        'notes', v_note
      )
    );

    v_works_ended := v_works_ended + 1;
  end loop;

  -- No per-work relationship rows yet: still record roster end on earliest catalogue work.
  if v_works_ended = 0 then
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
    select
      a.id,
      v_gallery_id,
      p_artist_id,
      null,
      case when v_role = 'artist' then 'artist' else 'institution' end,
      case when v_role = 'artist' then v_uid else v_gallery_id end,
      'representation_ended',
      jsonb_build_object(
        'scope', 'roster',
        'ended_by_role', v_role,
        'ended_by_user_id', v_uid,
        'notes', v_note
      )
    from public.artworks a
    where a.artist_id = p_artist_id
    order by a.created_at asc
    limit 1;
  end if;

  update public.artists
  set represented_by_gallery = false
  where id = p_artist_id;

  return jsonb_build_object(
    'ok', true,
    'artist_id', p_artist_id,
    'gallery_id', v_gallery_id,
    'works_ended', v_works_ended,
    'ended_by_role', v_role
  );
end;
$$;

revoke all on function public.end_gallery_artist_representation(uuid, text) from public;
grant execute on function public.end_gallery_artist_representation(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Active vs historical representation for dashboards / public copy
-- ---------------------------------------------------------------------------
create or replace function public.get_artist_representation_state(p_artist_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_artist_id uuid;
  v_gallery_id uuid;
  v_represented boolean;
  v_ended_works int;
  v_active_works int;
  v_has_ended_event boolean;
begin
  v_artist_id := coalesce(p_artist_id, auth.uid());
  if v_artist_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select ar.gallery_id, coalesce(ar.represented_by_gallery, false)
    into v_gallery_id, v_represented
  from public.artists ar
  where ar.id = v_artist_id;

  if v_gallery_id is null then
    return jsonb_build_object(
      'has_institution', false,
      'active', false,
      'historical', false
    );
  end if;

  select count(*)::int
    into v_active_works
  from public.artwork_representation_relationships r
  where r.artist_id = v_artist_id
    and r.gallery_id = v_gallery_id
    and r.ended_at is null;

  select count(*)::int
    into v_ended_works
  from public.artwork_representation_relationships r
  where r.artist_id = v_artist_id
    and r.gallery_id = v_gallery_id
    and r.ended_at is not null;

  select exists (
    select 1
    from public.artwork_confirmation_events e
    where e.artist_id = v_artist_id
      and e.gallery_id = v_gallery_id
      and e.event_type = 'representation_ended'
  )
  into v_has_ended_event;

  return jsonb_build_object(
    'has_institution', true,
    'gallery_id', v_gallery_id,
    'active', v_represented and v_active_works > 0,
    'represented_by_gallery', v_represented,
    'active_works', v_active_works,
    'ended_works', v_ended_works,
    'historical',
      (not v_represented or v_active_works = 0)
      and (v_ended_works > 0 or v_has_ended_event)
  );
end;
$$;

revoke all on function public.get_artist_representation_state(uuid) from public;
grant execute on function public.get_artist_representation_state(uuid) to authenticated;
