-- PR-BETA.6.1 — Canonical collector holdings + pending acquisition resolution (security definer).

create or replace function public.list_collector_owned_artwork_ids(p_user_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select ranked.artwork_id
  from (
    select distinct on (oe.artwork_id)
      oe.artwork_id,
      coalesce(oe.to_user_id, oe.to_owner_id) as holder_id
    from public.ownership_events oe
    where oe.artwork_id is not null
    order by oe.artwork_id, oe.created_at desc nulls last, oe.id desc nulls last
  ) ranked
  where ranked.holder_id = p_user_id;
$$;

comment on function public.list_collector_owned_artwork_ids(uuid) is
  'Artwork ids where p_user_id is the latest ownership_events holder.';

create or replace function public.list_pending_acquisition_transfers(p_user_id uuid)
returns table (
  provenance_transfer_id uuid,
  artwork_id uuid,
  deal_id uuid,
  invite_token text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  with caller as (
    select
      p_user_id as user_id,
      lower(trim(coalesce(
        (select u.email from auth.users u where u.id = p_user_id),
        ''
      ))) as email
  )
  select
    pt.id as provenance_transfer_id,
    pt.artwork_id,
    coalesce(
      (
        select d.id
        from public.deals d
        where d.artwork_id = pt.artwork_id
          and lower(coalesce(d.type, '')) = 'acquisition'
          and lower(coalesce(d.status, '')) in ('accepted', 'closed')
          and (
            d.participant_a_user_id = p_user_id
            or d.participant_b_user_id = p_user_id
          )
        order by d.updated_at desc nulls last
        limit 1
      ),
      (
        select (der.deal_id)::uuid
        from public.deal_execution_records der
        where der.kind = 'transfer'
          and lower(coalesce(der.status, '')) <> 'completed'
          and coalesce(der.metadata ->> 'provenance_transfer_id', '') = pt.id::text
        limit 1
      )
    ) as deal_id,
    pt.invite_token,
    pt.status
  from public.provenance_transfers pt
  cross join caller c
  where lower(coalesce(pt.status, '')) in ('pending_acceptance', 'initiated')
    and (
      pt.recipient_user_id = p_user_id
      or (
        c.email <> ''
        and lower(trim(coalesce(pt.recipient_email, ''))) = c.email
      )
    );
$$;

comment on function public.list_pending_acquisition_transfers(uuid) is
  'Pending provenance transfers addressed to p_user_id (by user id or account email).';

create or replace function public.user_has_pending_acquisition_on_artwork(
  p_user_id uuid,
  p_artwork_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.list_pending_acquisition_transfers(p_user_id) p
    where p.artwork_id = p_artwork_id
  );
$$;

comment on function public.user_has_pending_acquisition_on_artwork(uuid, uuid) is
  'True when p_user_id has a pending acquisition transfer on p_artwork_id.';

revoke all on function public.list_collector_owned_artwork_ids(uuid) from public;
revoke all on function public.list_pending_acquisition_transfers(uuid) from public;
revoke all on function public.user_has_pending_acquisition_on_artwork(uuid, uuid) from public;

grant execute on function public.list_collector_owned_artwork_ids(uuid) to authenticated, service_role;
grant execute on function public.list_pending_acquisition_transfers(uuid) to authenticated, service_role;
grant execute on function public.user_has_pending_acquisition_on_artwork(uuid, uuid) to authenticated, service_role;

notify pgrst, 'reload schema';
