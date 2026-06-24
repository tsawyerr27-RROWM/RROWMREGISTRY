-- PR-BETA.7.2 — Write-path authority: replace artworks.current_owner_id checks with ledger (get_current_owner).

-- ---------------------------------------------------------------------------
-- ownership_events INSERT RLS: canonical holder may append transfers
-- ---------------------------------------------------------------------------
drop policy if exists "ownership_events_insert_current_owner" on public.ownership_events;

create policy "ownership_events_insert_current_owner"
  on public.ownership_events
  for insert
  to authenticated
  with check (
    public.get_current_owner(ownership_events.artwork_id) = auth.uid()
  );

comment on policy "ownership_events_insert_current_owner" on public.ownership_events is
  'Latest ownership_events.to_user_id holder may record transfers (ledger authority).';

-- ---------------------------------------------------------------------------
-- Artist insert: only while artist is canonical holder (or custody vacant)
-- ---------------------------------------------------------------------------
drop policy if exists "ownership_events_insert_artist_own_artwork" on public.ownership_events;

create policy "ownership_events_insert_artist_own_artwork"
  on public.ownership_events
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.artworks a
      where a.id = ownership_events.artwork_id
        and a.artist_id = auth.uid()
        and (
          public.get_current_owner(a.id) is null
          or public.get_current_owner(a.id) = auth.uid()
        )
    )
  );

comment on policy "ownership_events_insert_artist_own_artwork" on public.ownership_events is
  'Authored works: artist may append ledger rows only while canonical holder or vacant custody.';

-- ---------------------------------------------------------------------------
-- ownership_claims eligibility: ledger holder, not cache
-- ---------------------------------------------------------------------------
create or replace function public.user_can_submit_ownership_claim(
  p_user_id uuid,
  p_artwork_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_user_id is null or p_artwork_id is null then false
    when auth.uid() is not null and p_user_id is distinct from auth.uid() then false
    when exists (
      select 1
      from public.provenance_transfers pt
      where pt.artwork_id = p_artwork_id
        and pt.recipient_user_id = p_user_id
        and pt.status in ('pending_acceptance', 'initiated')
        and (
          coalesce(pt.note, '') like '%deal_execution%'
          or coalesce(pt.note, '') like '%deal_id=%'
        )
    ) then false
    else exists (
      select 1
      from public.artworks a
      where a.id = p_artwork_id
        and lower(coalesce(a.verification_status, '')) = 'verified'
        and (
          public.get_current_owner(a.id) is null
          or public.get_current_owner(a.id) = p_user_id
          or exists (
            select 1
            from public.provenance_transfers pt
            where pt.artwork_id = a.id
              and pt.recipient_user_id = p_user_id
              and pt.status in ('pending_acceptance', 'initiated')
          )
          or exists (
            select 1
            from public.registry_steward_invites rsi
            where rsi.artwork_id = a.id
              and rsi.status = 'pending'
              and rsi.invite_kind = 'custody'
              and (
                rsi.accepted_user_id = p_user_id
                or lower(trim(coalesce(rsi.recipient_email, ''))) = lower(
                  trim(coalesce(
                    (
                      select u.email
                      from auth.users u
                      where u.id = p_user_id
                    ),
                    ''
                  ))
                )
              )
          )
          or exists (
            select 1
            from public.deal_execution_records der
            inner join public.deals d on d.id = der.deal_id
            where d.artwork_id = a.id
              and der.kind = 'transfer'
              and der.status in ('pending', 'recorded', 'completed')
              and lower(coalesce(d.type, '')) = 'acquisition'
              and lower(coalesce(d.status, '')) in ('accepted', 'closed')
              and coalesce(der.metadata ->> 'recipient_user_id', '') = p_user_id::text
              and der.status <> 'completed'
          )
        )
    )
  end;
$$;

comment on function public.user_can_submit_ownership_claim(uuid, uuid) is
  'True when collector may submit ownership_claims; uses get_current_owner (ledger) not cache.';

drop policy if exists "ownership_claims_insert_collector" on public.ownership_claims;

create policy "ownership_claims_insert_collector"
  on public.ownership_claims
  for insert
  to authenticated
  with check (
    collector_id = auth.uid()
    and status = 'pending'
    and length(trim(coalesce(note, ''))) >= 12
    and public.user_can_submit_ownership_claim(auth.uid(), artwork_id)
  );

-- ---------------------------------------------------------------------------
-- certificates SELECT: participants via ledger holder
-- ---------------------------------------------------------------------------
drop policy if exists "certificates_select_participants" on public.certificates;

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
          or public.get_current_owner(a.id) = auth.uid()
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
-- Dispute stake: ledger participation, not cache
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
          or public.get_current_owner(a.id) = p_user_id
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
    else false
  end;
$$;

notify pgrst, 'reload schema';
