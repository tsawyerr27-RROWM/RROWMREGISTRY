-- PR-BETA.7 — Ownership cache sync must fail hard; collector holdings RPC uses to_user_id only.

-- 1) artworks.current_owner_id cache: never swallow sync failures
create or replace function public.ownership_events_sync_current_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.artwork_id is null then
    return new;
  end if;

  if new.to_user_id is not null then
    update public.artworks a
    set current_owner_id = new.to_user_id
    where a.id = new.artwork_id;

    if not found then
      raise exception 'ownership_events_sync_current_owner: artwork % not found', new.artwork_id
        using errcode = 'P0002';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ownership_events_sync_current_owner on public.ownership_events;
create trigger trg_ownership_events_sync_current_owner
after insert on public.ownership_events
for each row
execute function public.ownership_events_sync_current_owner();

comment on function public.ownership_events_sync_current_owner() is
  'Cache sync: artworks.current_owner_id := NEW.to_user_id. Raises on failure (PR-BETA.7).';

-- 2) Collector holdings — ledger authority via to_user_id only
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
      oe.to_user_id as holder_id
    from public.ownership_events oe
    where oe.artwork_id is not null
    order by oe.artwork_id, oe.created_at desc nulls last, oe.id desc nulls last
  ) ranked
  where ranked.holder_id = p_user_id;
$$;

comment on function public.list_collector_owned_artwork_ids(uuid) is
  'Artwork ids where p_user_id is latest ownership_events.to_user_id (ledger authority).';

notify pgrst, 'reload schema';
