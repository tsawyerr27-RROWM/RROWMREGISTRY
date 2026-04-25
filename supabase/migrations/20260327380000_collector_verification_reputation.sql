-- Collector credibility: strict verification_method values, marketplace chain verification,
-- admin method normalization, and public-safe collector stats RPC.

-- ---------------------------------------------------------------------------
-- verification_method: admin | certificate | transfer_chain | null
-- ---------------------------------------------------------------------------
-- Backfill touches historical rows; ownership edit-window triggers would block
-- updates after 15 minutes. Pause user triggers for these UPDATEs only.
alter table public.ownership_events disable trigger user;

update public.ownership_events
set verification_method = 'admin'
where lower(trim(coalesce(verification_method, ''))) in ('manual', 'admin');

update public.ownership_events
set verification_method = null
where verification_method is not null
  and lower(trim(verification_method)) not in (
    'admin',
    'certificate',
    'transfer_chain'
  );

alter table public.ownership_events enable trigger user;

do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'ownership_events'
      and c.conname = 'ownership_events_verification_method_check'
  ) then
    alter table public.ownership_events
      drop constraint ownership_events_verification_method_check;
  end if;

  alter table public.ownership_events
    add constraint ownership_events_verification_method_check
    check (
      verification_method is null
      or lower(trim(verification_method)) in (
        'admin',
        'certificate',
        'transfer_chain'
      )
    );
exception
  when duplicate_object then
    null;
end $$;

comment on column public.ownership_events.verification_method is
  'How ownership reached verified: admin | certificate | transfer_chain; null if not verified or unknown.';

-- ---------------------------------------------------------------------------
-- Admin verify: always store canonical "admin" (p_method retained for future subtypes)
-- ---------------------------------------------------------------------------
create or replace function public.ownership_admin_verify(
  p_event_id uuid,
  p_method text default 'admin',
  p_verified_by uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_method text;
begin
  if coalesce((select auth.jwt() ->> 'role'), '') != 'service_role' then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;

  if p_verified_by is null then
    raise exception 'verified_by required'
      using errcode = '22023';
  end if;

  v_method := lower(trim(coalesce(p_method, '')));
  if v_method in ('', 'manual') then
    v_method := 'admin';
  end if;
  if v_method is distinct from 'admin' then
    raise exception 'Invalid verification method for admin verify'
      using errcode = '22023';
  end if;

  update public.ownership_events
  set
    verification_status = 'verified',
    verified_by = p_verified_by,
    verified_at = now(),
    verification_method = 'admin',
    claim_source = 'manual'
  where id = p_event_id;
end;
$$;

grant execute on function public.ownership_admin_verify(uuid, text, uuid) to service_role;

comment on function public.ownership_admin_verify(uuid, text, uuid) is
  'Mark ownership_events verified (admin). Stores verification_method = admin.';

-- complete_market_sale(transfer_chain buyer): see 20260327381000 (requires public.market_listings).

-- ---------------------------------------------------------------------------
-- Collector stats (latest ledger row per artwork; holder = coalesce(to_user_id, to_owner_id))
-- ---------------------------------------------------------------------------
create or replace function public.get_collector_stats(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer uuid;
  v_public boolean;
  v_total int;
  v_verified int;
  v_claimed int;
  v_recorded int;
  v_first timestamptz;
begin
  v_viewer := auth.uid();

  select cp.is_public
  into v_public
  from public.collector_profiles cp
  where cp.user_id = p_user_id;

  if v_viewer is distinct from p_user_id then
    if not coalesce(v_public, false) then
      raise exception 'Not authorized'
        using errcode = '42501';
    end if;
  end if;

  with latest_per_art as (
    select distinct on (oe.artwork_id)
      oe.artwork_id,
      coalesce(oe.to_user_id, oe.to_owner_id) as holder_id,
      lower(trim(coalesce(oe.verification_status, 'recorded'))) as v_status,
      oe.created_at
    from public.ownership_events oe
    order by oe.artwork_id, oe.created_at desc nulls last, oe.id desc
  ),
  held as (
    select l.*
    from latest_per_art l
    where l.holder_id = p_user_id
  )
  select
    count(*)::int,
    count(*) filter (where v_status = 'verified')::int,
    count(*) filter (where v_status = 'claimed')::int,
    count(*) filter (where v_status = 'recorded')::int
  into v_total, v_verified, v_claimed, v_recorded
  from held;

  select min(oe.created_at)
  into v_first
  from public.ownership_events oe
  where coalesce(oe.to_user_id, oe.to_owner_id) = p_user_id;

  return jsonb_build_object(
    'total_owned', coalesce(v_total, 0),
    'verified_owned', coalesce(v_verified, 0),
    'claimed_owned', coalesce(v_claimed, 0),
    'recorded_owned', coalesce(v_recorded, 0),
    'first_activity_at', v_first
  );
end;
$$;

revoke all on function public.get_collector_stats(uuid) from public;
grant execute on function public.get_collector_stats(uuid) to anon, authenticated;

comment on function public.get_collector_stats(uuid) is
  'Portfolio counts from latest ownership_events per artwork (current holder only). Public only if collector_profiles.is_public.';
