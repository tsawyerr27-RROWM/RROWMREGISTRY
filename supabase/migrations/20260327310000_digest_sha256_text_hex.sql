-- pgcrypto: digest() must not use an unknown-typed algorithm literal (digest(text, unknown) fails).
-- Pattern: encode(digest(<payload>::text, 'sha256'::text), 'hex')
--
-- Re-applies certificate hashing and defines/repairs update_artwork_timeline_hash (often created
-- outside this repo) so all digest() calls are type-safe.
-- Include "extensions" so SECURITY DEFINER bodies resolve digest() from pgcrypto.

create extension if not exists pgcrypto;

alter table public.artworks
  add column if not exists timeline_hash text;

-- ---------------------------------------------------------------------------
-- Certificate issuance (same logic as 20260325203000; digest args explicit)
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

-- ---------------------------------------------------------------------------
-- Timeline fingerprint on artworks (value + ownership ledgers)
-- ---------------------------------------------------------------------------
create or replace function public.update_artwork_timeline_hash()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  aid uuid;
  ve_j jsonb;
  oe_j jsonb;
  payload text;
  h text;
begin
  aid := coalesce(new.artwork_id, old.artwork_id);
  if aid is null then
    return coalesce(new, old);
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ve.id,
        'created_at', ve.created_at,
        'value_type', ve.value_type,
        'declared_value', ve.declared_value,
        'currency', ve.currency
      ) order by ve.created_at asc, ve.id asc
    ),
    '[]'::jsonb
  )
  into ve_j
  from public.value_events ve
  where ve.artwork_id = aid;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', oe.id,
        'created_at', oe.created_at,
        'transfer_type', oe.transfer_type,
        'value_event_id', oe.value_event_id
      ) order by oe.created_at asc, oe.id asc
    ),
    '[]'::jsonb
  )
  into oe_j
  from public.ownership_events oe
  where oe.artwork_id = aid;

  payload := jsonb_build_object(
    'value_events', ve_j,
    'ownership_events', oe_j
  )::text;

  h := encode(digest(payload::text, 'sha256'::text), 'hex');

  update public.artworks
  set timeline_hash = h
  where id = aid;

  return coalesce(new, old);
end;
$$;

comment on function public.update_artwork_timeline_hash() is
  'Recompute artworks.timeline_hash from ordered value_events + ownership_events (sha256 hex).';

drop trigger if exists value_event_hash_update on public.value_events;
create trigger value_event_hash_update
  after insert or update or delete on public.value_events
  for each row
  execute function public.update_artwork_timeline_hash();

drop trigger if exists ownership_event_timeline_hash on public.ownership_events;
create trigger ownership_event_timeline_hash
  after insert or update or delete on public.ownership_events
  for each row
  execute function public.update_artwork_timeline_hash();
