-- PR-BETA.6 — Block manual ownership_claims for in-platform acquisition transfers.

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
    -- Deal-based acquisitions complete via provenance accept, not manual claims.
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
          a.current_owner_id is null
          or a.current_owner_id = p_user_id
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
  'True when an authenticated collector may open an ownership_claims row. Deal acquisitions use provenance accept instead.';

notify pgrst, 'reload schema';
