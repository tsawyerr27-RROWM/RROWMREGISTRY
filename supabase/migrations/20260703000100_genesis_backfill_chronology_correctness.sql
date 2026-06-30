-- PR-BETA.7.2 — Genesis backfill chronology correctness.
-- Problem: PR-BETA.7 used coalesce(current_owner_id, artist_id) for a single registration row,
-- encoding cache as genesis truth and erasing artist custody + transfer for sold-without-ledger works.
-- Fix: append-only rows only; never UPDATE/DELETE ownership_events.

-- ---------------------------------------------------------------------------
-- 1) Remaining zero-event artworks — single registration (artist or sole holder)
-- ---------------------------------------------------------------------------
insert into public.ownership_events (
  artwork_id,
  transfer_type,
  from_user_id,
  to_user_id,
  created_by,
  notes,
  verification_status,
  created_at
)
select
  a.id,
  'registration',
  null,
  coalesce(a.current_owner_id, a.artist_id),
  coalesce(a.artist_id, a.current_owner_id),
  'Backfilled genesis ownership event (PR-BETA.7.2)',
  'recorded',
  coalesce(a.created_at, now())
from public.artworks a
where coalesce(a.current_owner_id, a.artist_id) is not null
  and not exists (
    select 1 from public.ownership_events oe where oe.artwork_id = a.id
  )
  and (
    a.artist_id is null
    or a.current_owner_id is null
    or a.current_owner_id = a.artist_id
  );

-- ---------------------------------------------------------------------------
-- 2) Remaining zero-event artworks — sold without ledger (two-row chronology)
-- ---------------------------------------------------------------------------
do $$
declare
  rec record;
  v_created timestamptz;
  v_transfer timestamptz;
begin
  for rec in
    select
      a.id,
      a.artist_id,
      a.current_owner_id,
      a.created_at,
      a.updated_at
    from public.artworks a
    where a.artist_id is not null
      and a.current_owner_id is not null
      and a.current_owner_id is distinct from a.artist_id
      and not exists (
        select 1 from public.ownership_events oe where oe.artwork_id = a.id
      )
  loop
    v_created := coalesce(rec.created_at, now());
    v_transfer :=
      coalesce(rec.updated_at, rec.created_at, now()) + interval '1 microsecond';

    insert into public.ownership_events (
      artwork_id,
      transfer_type,
      from_user_id,
      to_user_id,
      created_by,
      notes,
      verification_status,
      created_at
    )
    values (
      rec.id,
      'registration',
      null,
      rec.artist_id,
      rec.artist_id,
      'Backfilled registration genesis (PR-BETA.7.2)',
      'recorded',
      v_created
    );

    insert into public.ownership_events (
      artwork_id,
      transfer_type,
      from_user_id,
      to_user_id,
      created_by,
      notes,
      verification_status,
      created_at
    )
    values (
      rec.id,
      'ownership_transfer',
      rec.artist_id,
      rec.current_owner_id,
      rec.artist_id,
      'Backfilled transfer for legacy sale without ledger row (PR-BETA.7.2)',
      'recorded',
      v_transfer
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Chronicle PR-BETA.7 cache-derived single-row genesis (append correction)
-- ---------------------------------------------------------------------------
insert into public.ownership_events (
  artwork_id,
  transfer_type,
  from_user_id,
  to_user_id,
  created_by,
  notes,
  verification_status,
  created_at
)
select
  a.id,
  'record_correction',
  a.artist_id,
  oe.to_user_id,
  coalesce(a.artist_id, oe.to_user_id),
  format(
    'Chronology notice: genesis backfill PR-BETA.7 assigned holder from cache without transfer row; artist custody not recorded on ledger. references_event=%s; artwork_id=%s',
    oe.id::text,
    a.id::text
  ),
  'recorded',
  now()
from public.artworks a
join public.ownership_events oe on oe.artwork_id = a.id
where a.artist_id is not null
  and oe.transfer_type = 'registration'
  and oe.to_user_id is not null
  and oe.to_user_id is distinct from a.artist_id
  and coalesce(oe.notes, '') like '%PR-BETA.7%'
  and coalesce(oe.notes, '') not like '%PR-BETA.7.2%'
  and not exists (
    select 1
    from public.ownership_events oe2
    where oe2.artwork_id = a.id
      and oe2.transfer_type = 'ownership_transfer'
  )
  and not exists (
    select 1
    from public.ownership_events oe3
    where oe3.artwork_id = a.id
      and oe3.transfer_type = 'record_correction'
      and coalesce(oe3.notes, '') like '%references_event=' || oe.id::text || '%'
  );

-- ---------------------------------------------------------------------------
-- 4) Post-migration verification
-- ---------------------------------------------------------------------------
do $$
declare
  v_zero_events bigint;
  v_sold_without_transfer bigint;
begin
  select count(*)
  into v_zero_events
  from public.artworks a
  where not exists (
    select 1 from public.ownership_events oe where oe.artwork_id = a.id
  )
  and coalesce(a.current_owner_id, a.artist_id) is not null;

  select count(*)
  into v_sold_without_transfer
  from public.artworks a
  where a.artist_id is not null
    and a.current_owner_id is not null
    and a.current_owner_id is distinct from a.artist_id
    and exists (
      select 1
      from public.ownership_events oe
      where oe.artwork_id = a.id
    )
    and not exists (
      select 1
      from public.ownership_events oe2
      where oe2.artwork_id = a.id
        and oe2.transfer_type = 'ownership_transfer'
    );

  raise notice 'PR-BETA.7.2: artworks_still_without_ledger=%', v_zero_events;
  raise notice 'PR-BETA.7.2: sold_artworks_without_transfer_row=%', v_sold_without_transfer;
end $$;

notify pgrst, 'reload schema';
