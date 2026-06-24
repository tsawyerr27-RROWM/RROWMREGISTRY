-- PR-BETA.5b — Allow eligible acquisition recipients to submit ownership claims.

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
    else exists (
      select 1
      from public.artworks a
      where a.id = p_artwork_id
        and lower(coalesce(a.verification_status, '')) = 'verified'
        and (
          -- Vacant custody or caller is already recorded custodian
          a.current_owner_id is null
          or a.current_owner_id = p_user_id
          -- Pending provenance continuation addressed to this user
          or exists (
            select 1
            from public.provenance_transfers pt
            where pt.artwork_id = a.id
              and pt.recipient_user_id = p_user_id
              and pt.status in ('pending_acceptance', 'initiated')
          )
          -- Pending registry steward custody invite for this user
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
          -- Recorded acquisition execution naming this user as recipient
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
          )
          -- Accepted acquisition deal where caller is the acquiring participant
          or exists (
            select 1
            from public.deals d
            where d.artwork_id = a.id
              and lower(coalesce(d.type, '')) = 'acquisition'
              and lower(coalesce(d.status, '')) in ('accepted', 'closed')
              and a.current_owner_id is not null
              and a.current_owner_id <> p_user_id
              and (
                (
                  d.participant_a_user_id = p_user_id
                  and d.participant_b_user_id = a.current_owner_id
                )
                or (
                  d.participant_b_user_id = p_user_id
                  and d.participant_a_user_id = a.current_owner_id
                )
              )
          )
        )
    )
  end;
$$;

comment on function public.user_can_submit_ownership_claim(uuid, uuid) is
  'True when an authenticated collector may open an ownership_claims row for a verified work.';

revoke all on function public.user_can_submit_ownership_claim(uuid, uuid) from public;
grant execute on function public.user_can_submit_ownership_claim(uuid, uuid)
  to authenticated, service_role;

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

notify pgrst, 'reload schema';
