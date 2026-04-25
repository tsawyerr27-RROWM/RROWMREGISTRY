-- Server-side certificate issuance with certificate_hash.
-- Ensures certificate rows are created idempotently and `certificate_hash` is populated.

create extension if not exists pgcrypto;

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
  v_artwork record;
  v_cert record;
  v_hash text;
begin
  select a.id, a.registry_id, a.verification_status
    into v_artwork
  from public.artworks a
  where a.id = p_artwork_id;

  if v_artwork.id is null then
    raise exception 'Artwork not found' using errcode = 'P0002';
  end if;

  if v_artwork.verification_status is distinct from 'verified' then
    raise exception 'Artwork is not verified' using errcode = '22000';
  end if;

  if v_artwork.registry_id is null then
    raise exception 'Registry ID missing' using errcode = '22000';
  end if;

  -- Lock existing row if present to avoid races.
  select c.id, c.issued_at, c.certificate_hash
    into v_cert
  from public.certificates c
  where c.artwork_id = v_artwork.id
  for update;

  if v_cert.id is null then
    insert into public.certificates (artwork_id, certificate_number, issued_at, revoked)
    values (v_artwork.id, v_artwork.registry_id, now(), false)
    returning id, issued_at, certificate_hash into v_cert;
    created := true;
  else
    created := false;
  end if;

  -- Deterministic per-row hash (stable once issued_at is set).
  -- Explicit ::text on both digest args avoids digest(text, unknown) resolution errors.
  v_hash := encode(
    digest(
      jsonb_build_object(
        'artwork_id', v_artwork.id,
        'certificate_number', v_artwork.registry_id,
        'issued_at', v_cert.issued_at
      )::text,
      'sha256'::text
    ),
    'hex'
  );

  if v_cert.certificate_hash is distinct from v_hash then
    update public.certificates
      set certificate_hash = v_hash
    where artwork_id = v_artwork.id;
  end if;

  certificate_hash := v_hash;
  return next;
end;
$$;

comment on function public.issue_certificate_for_verified_artwork(uuid) is
  'Server-side issuance: ensure certificates row exists for verified artwork and set certificate_hash (sha256 of canonical json).';

grant execute on function public.issue_certificate_for_verified_artwork(uuid) to service_role;

-- Update the verification trigger to use the canonical issuance function.
create or replace function public.ensure_certificate_on_artwork_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status = 'verified'
     and new.registry_id is not null
     and (
       tg_op = 'INSERT'
       or old.verification_status is distinct from new.verification_status
     )
  then
    perform public.issue_certificate_for_verified_artwork(new.id);
  end if;
  return new;
end;
$$;

-- Backfill missing certificate_hash values for existing verified works.
do $$
declare
  r record;
begin
  for r in
    select a.id
    from public.artworks a
    join public.certificates c on c.artwork_id = a.id
    where a.verification_status = 'verified'
      and a.registry_id is not null
      and (c.certificate_hash is null or c.certificate_hash = '')
  loop
    begin
      perform public.issue_certificate_for_verified_artwork(r.id);
    exception when others then
      -- Ignore individual failures so migration completes; investigate separately.
      null;
    end;
  end loop;
end $$;

