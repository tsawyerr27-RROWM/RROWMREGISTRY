-- Sprint 5C.2A — Three-tier artwork trust model
-- filed → self_attested → verified
-- Replaces legacy binary unverified | verified on artworks.verification_status.

-- ---------------------------------------------------------------------------
-- 0) Certificate immutability — certificate_class is tier metadata only
--     Immutable payload: certificate_hash, certificate_snapshot, registry fields, etc.
-- ---------------------------------------------------------------------------

create or replace function public.prevent_certificate_mutation_after_issue()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  -- Allow updates while certificate is incomplete
  if old.certificate_hash is null
     or old.certificate_hash = ''
     or old.certificate_snapshot is null
  then
    return new;
  end if;

  -- Block mutation of issued payload; certificate_class alone may change
  if (to_jsonb(old) - 'certificate_class')
     is distinct from (to_jsonb(new) - 'certificate_class')
  then
    raise exception 'Certificates are immutable once issued.';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1) Certificate class column (backfill after artwork tier migration)
-- ---------------------------------------------------------------------------

alter table public.certificates
  add column if not exists certificate_class text;

comment on column public.certificates.certificate_class is
  'filing_attestation = Tier A (self-attested); verified_registry = Tier B (institutionally verified).';

-- ---------------------------------------------------------------------------
-- 2) Migrate verification_status values + constraint
-- ---------------------------------------------------------------------------

update public.artworks
set verification_status = 'filed'
where verification_status is null
   or verification_status in ('unverified', 'pending', '');

update public.artworks a
set verification_status = 'self_attested'
where a.verification_status = 'filed'
  and exists (
    select 1
    from public.verification_events ve
    where ve.artwork_id = a.id
      and ve.source = 'artist'
      and ve.status = 'confirmed'
  );

-- verified rows remain verified

alter table public.artworks
  alter column verification_status set default 'filed';

alter table public.artworks
  drop constraint if exists artworks_verification_status_check;

alter table public.artworks
  add constraint artworks_verification_status_check
  check (verification_status in ('filed', 'self_attested', 'verified'));

comment on column public.artworks.verification_status is
  'Trust tier: filed (registered) → self_attested (creator attestation) → verified (institutional).';

-- ---------------------------------------------------------------------------
-- 3) Authoritative status helpers (no auto-downgrade from events)
-- ---------------------------------------------------------------------------

create or replace function public.compute_artwork_verification_status(p_artwork_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select a.verification_status from public.artworks a where a.id = p_artwork_id),
    'filed'
  );
$$;

create or replace function public.refresh_artwork_verification_status(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Status is authoritative on artworks; refresh is a no-op (audit/events only).
  null;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) Tier A certificate — filing & attestation
-- ---------------------------------------------------------------------------

create or replace function public.issue_certificate_for_self_attested_artwork(
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
  v_hash text;
begin
  select a.id, a.registry_id, a.verification_status
    into v_art
  from public.artworks a
  where a.id = p_artwork_id;

  if v_art.id is null then
    raise exception 'Artwork not found' using errcode = 'P0002';
  end if;

  if v_art.verification_status is distinct from 'self_attested' then
    raise exception 'Artwork is not self-attested' using errcode = '22000';
  end if;

  if v_art.registry_id is null then
    raise exception 'Registry ID missing' using errcode = '22000';
  end if;

  select c.id, c.issued_at, c.certificate_hash, c.certificate_class
    into v_cert
  from public.certificates c
  where c.artwork_id = v_art.id
  order by c.issued_at desc nulls last, c.id desc
  limit 1
  for update;

  if v_cert.id is null then
    insert into public.certificates (
      artwork_id,
      certificate_number,
      issued_at,
      revoked,
      certificate_class
    )
    values (v_art.id, v_art.registry_id, now(), false, 'filing_attestation')
    returning id, issued_at, certificate_hash, certificate_class into v_cert;
    created := true;
  else
    update public.certificates
    set certificate_class = 'filing_attestation'
    where id = v_cert.id
      and certificate_class is distinct from 'filing_attestation';
    created := false;
  end if;

  v_hash := coalesce(v_cert.certificate_hash, '');
  if v_hash = '' then
    v_hash := encode(
      digest(
        jsonb_build_object(
          'artwork_id', v_art.id,
          'certificate_number', v_art.registry_id,
          'certificate_class', 'filing_attestation',
          'issued_at', v_cert.issued_at
        )::text,
        'sha256'::text
      ),
      'hex'
    );
    update public.certificates
    set certificate_hash = v_hash
    where artwork_id = v_art.id;
  end if;

  certificate_hash := v_hash;
  return next;
end;
$$;

revoke all on function public.issue_certificate_for_self_attested_artwork(uuid) from public;
grant execute on function public.issue_certificate_for_self_attested_artwork(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 5) Tier B certificate — verified registry (extend existing RPC)
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
  v_hash text;
begin
  select a.id, a.registry_id, a.verification_status
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

  select c.id, c.issued_at, c.certificate_hash
    into v_cert
  from public.certificates c
  where c.artwork_id = v_art.id
  order by c.issued_at desc nulls last, c.id desc
  limit 1
  for update;

  if v_cert.id is null then
    insert into public.certificates (
      artwork_id,
      certificate_number,
      issued_at,
      revoked,
      certificate_class
    )
    values (v_art.id, v_art.registry_id, now(), false, 'verified_registry')
    returning id, issued_at, certificate_hash into v_cert;
    created := true;
  else
    update public.certificates
    set certificate_class = 'verified_registry'
    where id = v_cert.id;
    created := false;
  end if;

  v_hash := coalesce(v_cert.certificate_hash, '');
  if v_hash = '' then
    v_hash := encode(
      digest(
        jsonb_build_object(
          'artwork_id', v_art.id,
          'certificate_number', v_art.registry_id,
          'certificate_class', 'verified_registry',
          'issued_at', v_cert.issued_at
        )::text,
        'sha256'::text
      ),
      'hex'
    );
    update public.certificates set certificate_hash = v_hash where artwork_id = v_art.id;
  end if;

  certificate_hash := v_hash;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6) Artist self-attestation — promotes filed → self_attested
-- ---------------------------------------------------------------------------

create or replace function public.artist_confirm_artwork(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.artworks a
    where a.id = p_artwork_id
      and a.artist_id = auth.uid()
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  insert into public.verification_events (
    artwork_id, source, source_id, status, created_at, metadata
  )
  values (
    p_artwork_id,
    'artist',
    auth.uid(),
    'confirmed',
    now(),
    jsonb_build_object('artist_user_id', auth.uid(), 'trust_tier', 'self_attested')
  );

  update public.artworks a
  set verification_status = 'self_attested'
  where a.id = p_artwork_id
    and a.verification_status = 'filed'
    and a.artist_id = auth.uid();
end;
$$;

revoke all on function public.artist_confirm_artwork(uuid) from public;
grant execute on function public.artist_confirm_artwork(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 7) Institutional verification — filed | self_attested → verified (no downgrade)
-- ---------------------------------------------------------------------------

create or replace function public.gallery_verify_artwork(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_gallery_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select ar.gallery_id
  into v_gallery_id
  from public.artworks aw
  inner join public.artists ar on ar.id = aw.artist_id
  inner join public.gallery_users gu on gu.gallery_id = ar.gallery_id
  inner join public.galleries g on g.id = gu.gallery_id
  where aw.id = p_artwork_id
    and gu.user_id = auth.uid()
    and g.verified is true
  limit 1;

  if v_gallery_id is null then
    raise exception 'Not authorized for gallery verification' using errcode = '42501';
  end if;

  update public.artworks a
  set
    verification_status = 'verified',
    verification_hash = encode(
      digest(
        concat_ws(
          '|',
          coalesce(a.title::text, ''),
          coalesce(a.artist_id::text, ''),
          coalesce(a.registry_id::text, ''),
          coalesce(a.created_at::text, '')
        ),
        'sha256'
      ),
      'hex'
    ),
    approved_by = auth.uid(),
    approved_at = now()
  where a.id = p_artwork_id
    and a.verification_status in ('filed', 'self_attested');

  begin
    insert into public.verification_events (
      artwork_id, source, source_id, status, metadata, created_at,
      verification_method, verified_by_gallery_id
    )
    values (
      p_artwork_id,
      'gallery',
      v_gallery_id,
      'confirmed',
      jsonb_build_object('actor_user_id', auth.uid()),
      now(),
      'gallery',
      v_gallery_id
    );
  exception when others then
    null;
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8) Auto-issue certificates on tier promotion
-- ---------------------------------------------------------------------------

create or replace function public.ensure_certificate_on_artwork_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status then
    if new.verification_status = 'self_attested' then
      perform public.issue_certificate_for_self_attested_artwork(new.id);
    elsif new.verification_status = 'verified' then
      perform public.issue_certificate_for_verified_artwork(new.id);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_artworks_issue_certificate_on_verified on public.artworks;
create trigger trg_artworks_issue_certificate_on_verified
after update of verification_status on public.artworks
for each row
execute function public.ensure_certificate_on_artwork_verified();

-- ---------------------------------------------------------------------------
-- 9) Artist registration RPC (repo baseline — sets filed)
-- ---------------------------------------------------------------------------

create or replace function public.register_artwork_atomic(
  p_artist_id uuid,
  p_title text,
  p_year text,
  p_medium text,
  p_dimensions text,
  p_description text,
  p_image_url text,
  p_registry_id text,
  p_metadata_hash text
)
returns public.artworks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_artwork public.artworks%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_artist_id is distinct from v_uid then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  insert into public.artworks (
    artist_id,
    title,
    year,
    medium,
    dimensions,
    description,
    image_url,
    registry_id,
    metadata_hash,
    verification_status,
    current_owner_id
  )
  values (
    p_artist_id,
    p_title,
    p_year,
    p_medium,
    p_dimensions,
    p_description,
    p_image_url,
    p_registry_id,
    p_metadata_hash,
    'filed',
    p_artist_id
  )
  returning * into v_artwork;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ownership_events'
      and column_name = 'transfer_type'
  ) then
    insert into public.ownership_events (
      artwork_id, transfer_type, to_user_id, verification_status
    )
    values (v_artwork.id, 'initial', p_artist_id, 'recorded');
  else
    insert into public.ownership_events (artwork_id, to_user_id)
    values (v_artwork.id, p_artist_id);
  end if;

  return v_artwork;
end;
$$;

revoke all on function public.register_artwork_atomic(
  uuid, text, text, text, text, text, text, text, text
) from public;
grant execute on function public.register_artwork_atomic(
  uuid, text, text, text, text, text, text, text, text
) to authenticated;

-- Backfill certificate_class once artwork tiers are authoritative
update public.certificates c
set certificate_class = case a.verification_status
  when 'verified' then 'verified_registry'
  when 'self_attested' then 'filing_attestation'
  else 'filing_attestation'
end
from public.artworks a
where a.id = c.artwork_id
  and c.certificate_class is distinct from case a.verification_status
    when 'verified' then 'verified_registry'
    when 'self_attested' then 'filing_attestation'
    else 'filing_attestation'
  end;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'certificates_certificate_class_check'
  ) then
    alter table public.certificates
      add constraint certificates_certificate_class_check
      check (certificate_class in ('filing_attestation', 'verified_registry'));
  end if;
end $$;
