-- Idempotent certificate issuance: return existing hash when fully issued;
-- fill partial rows in place instead of inserting duplicate certificate rows.

create or replace function public.issue_certificate_for_verified_artwork(
  p_artwork_id uuid
)
returns table (
  created boolean,
  certificate_hash text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_art record;
  v_latest record;
  v_cert record;
  v_latest_owner uuid;
  v_gallery_verified boolean := false;
  v_artist_verified boolean := false;
  v_gallery_id uuid := null;
  v_gallery_name text := null;
  v_verified_by jsonb := null;
  v_issued_by uuid := auth.uid();
  v_snapshot jsonb;
  v_summary jsonb;
  v_hash text;
begin
  select
    a.id,
    a.registry_id,
    a.title,
    a.artist_id,
    a.verification_status,
    a.current_owner_id,
    a.approved_by,
    a.approved_at
  into v_art
  from public.artworks a
  where a.id = p_artwork_id;

  if v_art.id is null then
    raise exception 'Artwork not found' using errcode = 'P0002';
  end if;

  if v_art.verification_status is distinct from 'verified' then
    raise exception 'Artwork is not verified' using errcode = '22000';
  end if;

  if v_art.registry_id is null then
    raise exception 'Registry ID missing' using errcode = '22000';
  end if;

  select c.*
  into v_latest
  from public.certificates c
  where c.artwork_id = v_art.id
  order by c.issued_at desc nulls last, c.id desc
  limit 1
  for update;

  if v_latest.id is not null
     and v_latest.certificate_snapshot is not null
     and coalesce(v_latest.certificate_hash, '') <> ''
  then
    created := false;
    certificate_hash := v_latest.certificate_hash;
    return next;
  end if;

  if v_latest.id is null then
    insert into public.certificates (artwork_id, certificate_number, issued_at, revoked, issued_by)
    values (v_art.id, v_art.registry_id, now(), false, v_issued_by)
    returning * into v_cert;
    created := true;
  else
    v_cert := v_latest;
    created := false;
  end if;

  select coalesce(oe.to_user_id, oe.to_owner_id)
  into v_latest_owner
  from public.ownership_events oe
  where oe.artwork_id = v_art.id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  v_latest_owner := coalesce(v_latest_owner, v_art.current_owner_id);

  v_gallery_verified := exists (
    select 1 from public.verification_events ve
    where ve.artwork_id = v_art.id
      and ve.status = 'confirmed'
      and ve.source = 'gallery'
  );
  v_artist_verified := exists (
    select 1 from public.verification_events ve
    where ve.artwork_id = v_art.id
      and ve.status = 'confirmed'
      and ve.source = 'artist'
  );

  select ve.source_id
  into v_gallery_id
  from public.verification_events ve
  where ve.artwork_id = v_art.id
    and ve.status = 'confirmed'
    and ve.source = 'gallery'
  order by ve.created_at desc nulls last, ve.id desc
  limit 1;

  if v_gallery_id is not null then
    select g.name into v_gallery_name
    from public.galleries g
    where g.id = v_gallery_id;
  end if;

  v_verified_by :=
    case
      when v_gallery_id is not null then
        jsonb_build_object(
          'type', 'gallery',
          'gallery_id', v_gallery_id,
          'gallery_name', nullif(trim(coalesce(v_gallery_name, '')), '')
        )
      when v_art.approved_by is not null then
        jsonb_build_object(
          'type', 'admin',
          'user_id', v_art.approved_by
        )
      else
        null
    end;

  v_summary := jsonb_build_object(
    'gallery', v_gallery_verified,
    'artist', v_artist_verified,
    'certificate', true
  );

  v_snapshot := jsonb_build_object(
    'artwork_id', v_art.id,
    'registry_id', v_art.registry_id,
    'title', v_art.title,
    'artist_id', v_art.artist_id,
    'issued_at', v_cert.issued_at,
    'issued_by', v_issued_by,
    'current_owner_id', v_latest_owner,
    'verification_sources', jsonb_build_object(
      'certificate', true,
      'gallery', v_gallery_verified,
      'artist', v_artist_verified
    ),
    'verified_by', v_verified_by
  );

  v_hash := public.generate_certificate_hash(v_snapshot);

  update public.certificates c
  set
    certificate_snapshot = coalesce(c.certificate_snapshot, v_snapshot),
    verification_summary = coalesce(c.verification_summary, v_summary),
    certificate_hash = case
      when c.certificate_hash is null or c.certificate_hash = '' then v_hash
      else c.certificate_hash
    end,
    issued_by = coalesce(c.issued_by, v_issued_by)
  where c.id = v_cert.id;

  begin
    insert into public.verification_events (artwork_id, source, source_id, status, metadata, created_at)
    values (
      v_art.id,
      'certificate',
      null,
      'confirmed',
      jsonb_build_object('certificate_id', v_cert.id),
      now()
    );
  exception when others then
    null;
  end;

  certificate_hash := v_hash;
  return next;
end;
$$;
