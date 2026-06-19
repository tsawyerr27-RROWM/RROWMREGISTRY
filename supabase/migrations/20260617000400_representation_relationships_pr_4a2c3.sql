-- PR-4A.2c.3 — Artist–organisation representation relationships from deal execution

create table if not exists public.representation_relationships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  artist_user_id uuid not null references auth.users (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete set null,

  status text not null default 'active',
  exclusivity text not null default 'unspecified',
  territory text,
  starts_at date not null,
  ends_at date,
  notes text,

  constraint representation_relationships_status_check check (
    status in ('active', 'ended')
  ),
  constraint representation_relationships_exclusivity_check check (
    exclusivity in ('exclusive', 'nonexclusive', 'unspecified')
  )
);

comment on table public.representation_relationships is
  'Active artist–organisation representation filed from accepted deals.';

create unique index if not exists representation_relationships_one_active_per_pair
  on public.representation_relationships (artist_user_id, gallery_id)
  where status = 'active';

create index if not exists representation_relationships_deal_id_idx
  on public.representation_relationships (deal_id)
  where deal_id is not null;

create index if not exists representation_relationships_artist_idx
  on public.representation_relationships (artist_user_id, status, starts_at desc);

create index if not exists representation_relationships_gallery_idx
  on public.representation_relationships (gallery_id, status, starts_at desc);

alter table public.representation_relationships enable row level security;

drop policy if exists "representation_relationships_select_participant" on public.representation_relationships;
create policy "representation_relationships_select_participant"
  on public.representation_relationships for select
  to authenticated
  using (
    artist_user_id = auth.uid()
    or exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = representation_relationships.gallery_id
        and gu.user_id = auth.uid()
    )
  );

grant select on public.representation_relationships to authenticated;
grant all on public.representation_relationships to service_role;
