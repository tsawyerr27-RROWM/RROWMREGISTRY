-- Ownership verification: recorded | claimed | verified
-- + certificate-based auto-verify RPC
-- + artwork owner cache refresh on UPDATE (claim path updates latest row)

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
alter table public.ownership_events
  add column if not exists verification_status text default 'recorded',
  add column if not exists verified_by uuid,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_method text;

update public.ownership_events
set verification_status = 'recorded'
where verification_status is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ownership_events_verified_by_fkey'
  ) then
    alter table public.ownership_events
      add constraint ownership_events_verified_by_fkey
      foreign key (verified_by) references auth.users (id)
      on delete set null;
  end if;
exception
  when invalid_foreign_key then
    null;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'ownership_events'
      and c.conname = 'ownership_events_verification_status_check'
  ) then
    execute 'alter table public.ownership_events drop constraint ownership_events_verification_status_check';
  end if;

  execute $ct$
    alter table public.ownership_events
      add constraint ownership_events_verification_status_check
      check (verification_status in ('recorded', 'claimed', 'verified'))
  $ct$;
exception
  when duplicate_object then
    null;
end $$;

-- ---------------------------------------------------------------------------
-- Default verification on insert (runs after provenance BI trigger)
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_verification_default_bi()
returns trigger
language plpgsql
as $$
begin
  new.verification_status :=
    coalesce(nullif(trim(new.verification_status), ''), 'recorded');
  return new;
end;
$$;

drop trigger if exists trg_ownership_events_verification_default_bi on public.ownership_events;
create trigger trg_ownership_events_verification_default_bi
before insert on public.ownership_events
for each row
execute function public.ownership_events_verification_default_bi();

-- ---------------------------------------------------------------------------
-- Owner cache: INSERT + UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.ownership_events_refresh_artwork_owner_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t text;
  r public.ownership_events%rowtype;
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  r := new;

  if r.to_user_id is not null then
    update public.artworks
    set
      current_owner_id = r.to_user_id,
      test_owner_id = coalesce(r.to_user_id, test_owner_id)
    where id = r.artwork_id;
  else
    t := lower(trim(coalesce(r.transfer_type, '')));
    if t in ('sale', 'auction', 'primary_sale', 'secondary_sale') then
      update public.artworks
      set current_owner_id = null
      where id = r.artwork_id;
    end if;
  end if;

  return r;
end;
$$;

drop trigger if exists trg_ownership_events_owner_cache on public.ownership_events;
create trigger trg_ownership_events_owner_cache
after insert on public.ownership_events
for each row
execute function public.ownership_events_refresh_artwork_owner_cache();

drop trigger if exists trg_ownership_events_owner_cache_up on public.ownership_events;
create trigger trg_ownership_events_owner_cache_up
after update on public.ownership_events
for each row
execute function public.ownership_events_refresh_artwork_owner_cache();

-- ---------------------------------------------------------------------------
-- Certificate holder: mark latest ledger row verified (security definer)
-- ---------------------------------------------------------------------------
create or replace function public.ownership_certificate_verify(p_artwork_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_id uuid;
  holder uuid;
begin
  if auth.uid() is null then
    return;
  end if;

  if not exists (
    select 1
    from public.certificates c
    where c.artwork_id = p_artwork_id
      and coalesce(c.revoked, false) = false
  ) then
    return;
  end if;

  select oe.id, oe.to_user_id
  into latest_id, holder
  from public.ownership_events oe
  where oe.artwork_id = p_artwork_id
  order by oe.created_at desc nulls last, oe.id desc
  limit 1;

  if latest_id is null or holder is distinct from auth.uid() then
    return;
  end if;

  update public.ownership_events
  set
    verification_status = 'verified',
    verification_method = 'certificate',
    verified_by = auth.uid(),
    verified_at = now()
  where id = latest_id
    and verification_status is distinct from 'verified';
end;
$$;

grant execute on function public.ownership_certificate_verify(uuid) to authenticated;

comment on function public.ownership_certificate_verify(uuid) is
  'If a non-revoked certificate exists for the artwork and the latest ownership_event.to_user_id is the caller, mark that row verified (certificate).';
