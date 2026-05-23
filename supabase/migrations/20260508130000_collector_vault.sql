-- Collector vault: private per-artwork materials (not public by default).
-- Files live in private bucket `collector-vault`; app issues signed URLs.

create or replace function public.latest_ownership_holder_user_id(p_artwork_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(oe.to_user_id, oe.to_owner_id)
  from public.ownership_events oe
  where oe.artwork_id = p_artwork_id
  order by oe.created_at desc nulls last, oe.id desc nulls last
  limit 1;
$$;

comment on function public.latest_ownership_holder_user_id(uuid) is
  'Effective on-platform holder for vault access (latest ownership_events row).';

create or replace function public.user_can_view_collector_vault(p_artwork_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  if exists (
    select 1 from public.artists ar
    where ar.id = uid and coalesce(ar.is_admin, false)
  ) then
    return true;
  end if;
  if exists (
    select 1 from public.artworks a
    where a.id = p_artwork_id and a.artist_id = uid
  ) then
    return true;
  end if;
  if public.latest_ownership_holder_user_id(p_artwork_id) = uid then
    return true;
  end if;
  return false;
end;
$$;

create or replace function public.user_can_write_collector_vault(p_artwork_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  if exists (
    select 1 from public.artists ar
    where ar.id = uid and coalesce(ar.is_admin, false)
  ) then
    return true;
  end if;
  if public.latest_ownership_holder_user_id(p_artwork_id) = uid then
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.latest_ownership_holder_user_id(uuid) to authenticated;
grant execute on function public.user_can_view_collector_vault(uuid) to authenticated;
grant execute on function public.user_can_write_collector_vault(uuid) to authenticated;

create table if not exists public.collector_vault_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text,
  notes text,
  storage_path text,
  original_filename text,
  mime_type text,
  byte_size bigint,
  constraint collector_vault_items_category_check check (
    category in (
      'invoice',
      'acquisition_record',
      'certificate',
      'condition_report',
      'internal_notes',
      'shipping_reference',
      'other'
    )
  ),
  constraint collector_vault_items_payload_check check (
    (storage_path is not null and length(trim(storage_path)) > 0)
    or (notes is not null and length(trim(notes)) > 0)
  )
);

comment on table public.collector_vault_items is
  'Private stewardship materials per artwork; never public. Files in collector-vault bucket.';

create index if not exists collector_vault_items_artwork_created_idx
  on public.collector_vault_items (artwork_id, created_at desc);

create unique index if not exists collector_vault_items_storage_path_uq
  on public.collector_vault_items (storage_path)
  where storage_path is not null;

alter table public.collector_vault_items enable row level security;

drop policy if exists "collector_vault_items_select_auth" on public.collector_vault_items;
create policy "collector_vault_items_select_auth"
  on public.collector_vault_items for select
  to authenticated
  using (public.user_can_view_collector_vault(artwork_id));

drop policy if exists "collector_vault_items_insert_auth" on public.collector_vault_items;
create policy "collector_vault_items_insert_auth"
  on public.collector_vault_items for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and public.user_can_write_collector_vault(artwork_id)
  );

drop policy if exists "collector_vault_items_delete_auth" on public.collector_vault_items;
create policy "collector_vault_items_delete_auth"
  on public.collector_vault_items for delete
  to authenticated
  using (
    uploaded_by = auth.uid()
    and public.user_can_write_collector_vault(artwork_id)
  );

grant select, insert, delete on public.collector_vault_items to authenticated;
grant all on public.collector_vault_items to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'collector-vault',
  'collector-vault',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
