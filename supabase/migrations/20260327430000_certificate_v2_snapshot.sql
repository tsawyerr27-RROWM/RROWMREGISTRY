-- Certificate system V2: snapshot-based, ownership-aware, verification-aware.
-- Backend only; UI unchanged.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1) Extend certificates table
-- ---------------------------------------------------------------------------
alter table public.certificates
  add column if not exists certificate_snapshot jsonb,
  add column if not exists verification_summary jsonb,
  add column if not exists issued_by uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'certificates_issued_by_fkey'
  ) then
    alter table public.certificates
      add constraint certificates_issued_by_fkey
      foreign key (issued_by) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then null;
end $$;

comment on column public.certificates.certificate_snapshot is
  'Immutable jsonb snapshot used for certificate_hash (sha256(snapshot::text)).';
comment on column public.certificates.verification_summary is
  'Derived summary of verification sources at issuance time (gallery/artist/certificate).';

-- ---------------------------------------------------------------------------
-- 2) issue_certificate_for_verified_artwork() V2
-- ---------------------------------------------------------------------------
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

  -- Lock existing certificate row if present to avoid races.
  select c.*
  into v_cert
  from public.certificates c
  where c.artwork_id = v_art.id
  for update;

  if v_cert.id is null then
    insert into public.certificates (artwork_id, certificate_number, issued_at, revoked, issued_by)
    values (v_art.id, v_art.registry_id, now(), false, v_issued_by)
    returning * into v_cert;
    created := true;
  else
    created := false;
  end if;

  -- Owner snapshot: use latest ownership_events if present, else fall back to artworks.current_owner_id.
  select coalesce(oe.to_user_id, oe.to_owner_id)
  into v_latest_owner
  from public.ownership_events oe
  where oe.artwork_id = v_art.id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  v_latest_owner := coalesce(v_latest_owner, v_art.current_owner_id);

  -- Verification signals at issuance time.
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

  v_hash := encode(digest(v_snapshot::text, 'sha256'::text), 'hex');

  -- Immutability: only set snapshot/summary/hash when missing (or hash missing).
  if v_cert.certificate_snapshot is null then
    update public.certificates
    set
      certificate_snapshot = v_snapshot,
      verification_summary = v_summary,
      certificate_hash = v_hash,
      issued_by = coalesce(issued_by, v_issued_by)
    where id = v_cert.id;
  elsif v_cert.certificate_hash is null or v_cert.certificate_hash = '' then
    update public.certificates
    set
      certificate_hash = v_hash,
      verification_summary = coalesce(verification_summary, v_summary),
      issued_by = coalesce(issued_by, v_issued_by)
    where id = v_cert.id;
  end if;

  -- Multi-source verification: emit a certificate confirmation event (best-effort).
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

revoke all on function public.issue_certificate_for_verified_artwork(uuid) from public;
grant execute on function public.issue_certificate_for_verified_artwork(uuid) to service_role;

comment on function public.issue_certificate_for_verified_artwork(uuid) is
  'V2: issue immutable certificate_snapshot + certificate_hash; include ownership + verification signals.';

-- ---------------------------------------------------------------------------
-- 3) verify_certificate(registry_id)
-- ---------------------------------------------------------------------------
create or replace function public.verify_certificate(p_registry_id text)
returns table (
  certificate_hash text,
  snapshot jsonb,
  valid boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_art_id uuid;
  v_cert record;
  v_calc text;
begin
  select a.id into v_art_id
  from public.artworks a
  where a.registry_id = p_registry_id
  limit 1;

  if v_art_id is null then
    return;
  end if;

  select c.* into v_cert
  from public.certificates c
  where c.artwork_id = v_art_id
  order by c.issued_at desc nulls last, c.id desc
  limit 1;

  if v_cert.id is null then
    return;
  end if;

  snapshot := v_cert.certificate_snapshot;
  certificate_hash := v_cert.certificate_hash;

  if snapshot is null then
    valid := false;
    return next;
  end if;

  v_calc := encode(digest(snapshot::text, 'sha256'::text), 'hex');
  valid :=
    coalesce(v_cert.revoked, false) = false
    and coalesce(nullif(trim(certificate_hash), ''), '') <> ''
    and certificate_hash = v_calc;

  return next;
end;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

comment on function public.verify_certificate(text) is
  'Verify latest certificate for a registry_id by recomputing sha256(snapshot::text); returns hash, snapshot, validity.';

-- ---------------------------------------------------------------------------
-- 4) Backfill existing certificates (snapshot + hash) when missing
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select a.id as artwork_id
    from public.artworks a
    join public.certificates c on c.artwork_id = a.id
    where a.verification_status = 'verified'
      and a.registry_id is not null
      and (
        c.certificate_snapshot is null
        or c.certificate_hash is null
        or c.certificate_hash = ''
      )
  loop
    begin
      perform public.issue_certificate_for_verified_artwork(r.artwork_id);
    exception when others then
      null;
    end;
  end loop;
end $$;

