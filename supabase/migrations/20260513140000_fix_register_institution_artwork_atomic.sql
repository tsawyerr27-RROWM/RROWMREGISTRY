-- Fix institution registration: explicit ownership event columns + migration guard.

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
  v_has_catalogue_cols boolean;
  v_has_oe_transfer boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'artworks'
      and column_name = 'filing_gallery_id'
  ) into v_has_catalogue_cols;

  if not v_has_catalogue_cols then
    raise exception
      'Institution catalogue columns are missing. Apply migration 20260513120000_institution_catalogue_unresolved_artists.sql'
      using errcode = 'P0001';
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

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'transfer_type'
  ) into v_has_oe_transfer;

  if v_has_oe_transfer then
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
  else
    insert into public.ownership_events (artwork_id, to_user_id)
    values (v_artwork.id, v_owner);
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'artwork_representation_relationships'
  ) then
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
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'artwork_confirmation_events'
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
  end if;

  return v_artwork;
end;
$$;

revoke all on function public.register_institution_artwork_atomic(
  uuid, text, text, text, text, text, text, text, text, text, uuid, text
) from public;
grant execute on function public.register_institution_artwork_atomic(
  uuid, text, text, text, text, text, text, text, text, text, uuid, text
) to authenticated;
