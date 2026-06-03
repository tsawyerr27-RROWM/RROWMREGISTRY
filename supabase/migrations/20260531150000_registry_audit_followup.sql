-- Registry audit follow-up: certificate exposure, gallery invite atomic accept,
-- ownership claim custody, dispute stake, verify_certificate anon redaction.

-- ---------------------------------------------------------------------------
-- H1 follow-up: allow notes-only patches (ownership declaration file paths)
-- ---------------------------------------------------------------------------
create or replace function public.prevent_ownership_events_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_jsonb(old) - 'notes' - 'updated_at' = to_jsonb(new) - 'notes' - 'updated_at'
     and old.notes is distinct from new.notes
  then
    return new;
  end if;
  raise exception 'ownership_events are immutable' using errcode = '42501';
end;
$$;

-- ---------------------------------------------------------------------------
-- verify_certificate(registry_id): hide snapshot from anonymous callers
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

  certificate_hash := v_cert.certificate_hash;

  if auth.uid() is null then
    snapshot := null;
  else
    snapshot := v_cert.certificate_snapshot;
  end if;

  if v_cert.certificate_snapshot is null then
    valid := false;
    return next;
  end if;

  v_calc := encode(digest(v_cert.certificate_snapshot::text, 'sha256'::text), 'hex');
  valid :=
    coalesce(v_cert.revoked, false) = false
    and coalesce(nullif(trim(certificate_hash), ''), '') <> ''
    and certificate_hash = v_calc;

  return next;
end;
$$;

comment on function public.verify_certificate(text) is
  'Verify latest certificate for registry_id; anonymous callers receive hash + valid only (no snapshot).';

-- ---------------------------------------------------------------------------
-- certificates SELECT: participants only (not all authenticated users)
-- ---------------------------------------------------------------------------
drop policy if exists "certificates_select_authenticated" on public.certificates;

create policy "certificates_select_participants"
  on public.certificates
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.artworks a
      where a.id = certificates.artwork_id
        and (
          a.artist_id = auth.uid()
          or a.current_owner_id = auth.uid()
          or exists (
            select 1
            from public.gallery_users gu
            where gu.user_id = auth.uid()
              and gu.role in ('admin', 'staff')
              and (
                gu.gallery_id = a.filing_gallery_id
                or gu.gallery_id = (
                  select ar.gallery_id
                  from public.artists ar
                  where ar.id = a.artist_id
                )
              )
          )
        )
    )
    or exists (
      select 1
      from public.artists ar
      where ar.id = auth.uid()
        and coalesce(ar.is_admin, false) = true
    )
  );

-- ---------------------------------------------------------------------------
-- ownership_claims: custody + substantiated note required
-- ---------------------------------------------------------------------------
drop policy if exists "ownership_claims_insert_collector" on public.ownership_claims;

create policy "ownership_claims_insert_collector"
  on public.ownership_claims
  for insert
  with check (
    collector_id = auth.uid()
    and status = 'pending'
    and length(trim(coalesce(note, ''))) >= 12
    and exists (
      select 1
      from public.artworks a
      where a.id = ownership_claims.artwork_id
        and lower(coalesce(a.verification_status, '')) = 'verified'
        and (
          a.current_owner_id is null
          or a.current_owner_id = auth.uid()
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Dispute stake: caller must have a legitimate interest in the target
-- ---------------------------------------------------------------------------
create or replace function public.user_has_dispute_stake(
  p_user_id uuid,
  p_target_type text,
  p_target_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_user_id is null or p_target_id is null then false
    when p_target_type = 'ownership' then exists (
      select 1
      from public.ownership_events oe
      inner join public.artworks a on a.id = oe.artwork_id
      where oe.id = p_target_id
        and (
          oe.to_user_id = p_user_id
          or oe.created_by = p_user_id
          or a.artist_id = p_user_id
          or a.current_owner_id = p_user_id
          or exists (
            select 1
            from public.gallery_users gu
            where gu.user_id = p_user_id
              and gu.role in ('admin', 'staff')
              and gu.gallery_id in (a.filing_gallery_id, (
                select ar.gallery_id from public.artists ar where ar.id = a.artist_id
              ))
          )
        )
    )
    when p_target_type = 'artist' then exists (
      select 1
      from public.artists ar
      where ar.id = p_target_id
        and (
          ar.id = p_user_id
          or exists (
            select 1
            from public.gallery_users gu
            where gu.user_id = p_user_id
              and gu.gallery_id = ar.gallery_id
              and gu.role in ('admin', 'staff')
          )
        )
    )
    when p_target_type = 'gallery_relationship' then exists (
      select 1
      from public.gallery_artist_invites i
      where i.id = p_target_id
        and (
          i.accepted_user_id = p_user_id
          or (
            p_user_id = auth.uid()
            and lower(trim(coalesce(i.artist_email, ''))) = lower(
              trim(coalesce(auth.jwt() ->> 'email', ''))
            )
          )
          or exists (
            select 1
            from public.gallery_users gu
            where gu.user_id = p_user_id
              and gu.gallery_id = i.gallery_id
              and gu.role in ('admin', 'staff')
          )
        )
    )
    else false
  end;
$$;

revoke all on function public.user_has_dispute_stake(uuid, text, uuid) from public;
grant execute on function public.user_has_dispute_stake(uuid, text, uuid) to authenticated, service_role;

drop policy if exists "disputes_insert_own" on public.disputes;

create policy "disputes_insert_with_stake"
  on public.disputes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.user_has_dispute_stake(auth.uid(), target_type, target_id)
  );

-- ---------------------------------------------------------------------------
-- Atomic gallery artist invite acceptance
-- ---------------------------------------------------------------------------
create or replace function public.accept_gallery_artist_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
  v_inv public.gallery_artist_invites%rowtype;
  v_now timestamptz := now();
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_token is null or length(trim(p_token)) < 32 then
    raise exception 'Invalid invitation token' using errcode = '22023';
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' then
    raise exception 'Account email required to accept' using errcode = '42501';
  end if;

  select *
  into v_inv
  from public.gallery_artist_invites i
  where i.invite_token = trim(p_token)
  for update;

  if not found then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  if lower(coalesce(v_inv.status, '')) <> 'pending' then
    raise exception 'This invitation is no longer active' using errcode = '23514';
  end if;

  if v_inv.token_used_at is not null then
    raise exception 'This invitation has already been used' using errcode = '23514';
  end if;

  if v_inv.token_expires_at is not null and v_inv.token_expires_at < v_now then
    raise exception 'This invitation has expired' using errcode = '23514';
  end if;

  if lower(trim(coalesce(v_inv.artist_email, ''))) <> v_email then
    raise exception 'Sign in with the invited email address' using errcode = '42501';
  end if;

  update public.gallery_artist_invites
  set
    status = 'accepted',
    accepted_at = v_now,
    accepted_user_id = v_uid,
    token_used_at = v_now,
    invite_token = null,
    visibility_status = 'pending'
  where id = v_inv.id
    and status = 'pending';

  if exists (select 1 from public.artists ar where ar.id = v_uid) then
    update public.artists
    set
      gallery_id = v_inv.gallery_id,
      represented_by_gallery = true,
      shown_on_institutional_public = false
    where id = v_uid;
  end if;

  return jsonb_build_object(
    'ok', true,
    'gallery_id', v_inv.gallery_id
  );
end;
$$;

revoke all on function public.accept_gallery_artist_invite(text) from public;
grant execute on function public.accept_gallery_artist_invite(text) to authenticated;

comment on function public.accept_gallery_artist_invite(text) is
  'Atomically accept a pending gallery→artist invite for the authenticated user email.';
