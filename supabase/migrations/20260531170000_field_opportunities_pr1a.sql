-- Phase 2C PR1A — Field opportunities foundation (programmes + briefs)

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_gallery_staff(p_gallery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gallery_users gu
    where gu.gallery_id = p_gallery_id
      and gu.user_id = auth.uid()
      and gu.role in ('admin', 'staff')
  );
$$;

comment on function public.is_gallery_staff(uuid) is
  'True when auth.uid() is admin/staff on the gallery.';

-- ---------------------------------------------------------------------------
-- field_programmes
-- ---------------------------------------------------------------------------
create table if not exists public.field_programmes (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  visibility_state text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint field_programmes_visibility_state_check
    check (visibility_state in ('draft', 'published', 'archived')),
  constraint field_programmes_slug_gallery_unique unique (gallery_id, slug)
);

create index if not exists field_programmes_gallery_id_idx
  on public.field_programmes (gallery_id);

create index if not exists field_programmes_visibility_state_idx
  on public.field_programmes (visibility_state);

comment on table public.field_programmes is
  'Optional cultural container for related field briefs (season, residency slate).';

-- ---------------------------------------------------------------------------
-- field_briefs (Opportunity publishable unit)
-- ---------------------------------------------------------------------------
create table if not exists public.field_briefs (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  programme_id uuid references public.field_programmes (id) on delete set null,
  title text not null,
  description text,
  sector text not null,
  practices_required text[] not null default '{}'::text[],
  brief_type text not null,
  participation_mode text not null default 'open',
  visibility_state text not null default 'draft',
  opens_at timestamptz,
  closes_at timestamptz,
  registry_outcome_required boolean not null default false,
  registry_outcome_copy text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint field_briefs_brief_type_check
    check (brief_type in (
      'open_call',
      'residency_award',
      'direct_commission',
      'production_partner_search'
    )),
  constraint field_briefs_participation_mode_check
    check (participation_mode in ('open', 'roster_only', 'invite_only', 'direct')),
  constraint field_briefs_visibility_state_check
    check (visibility_state in ('draft', 'published', 'withdrawn'))
);

create index if not exists field_briefs_gallery_id_idx
  on public.field_briefs (gallery_id);

create index if not exists field_briefs_programme_id_idx
  on public.field_briefs (programme_id);

create index if not exists field_briefs_visibility_state_idx
  on public.field_briefs (visibility_state);

create index if not exists field_briefs_sector_idx
  on public.field_briefs (sector);

create index if not exists field_briefs_brief_type_idx
  on public.field_briefs (brief_type);

create index if not exists field_briefs_closes_at_idx
  on public.field_briefs (closes_at);

comment on table public.field_briefs is
  'Organisation-published opportunity unit (Brief) for Phase 2C matching marketplace.';

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.field_opportunity_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists field_programmes_set_updated_at on public.field_programmes;
create trigger field_programmes_set_updated_at
  before update on public.field_programmes
  for each row execute function public.field_opportunity_set_updated_at();

drop trigger if exists field_briefs_set_updated_at on public.field_briefs;
create trigger field_briefs_set_updated_at
  before update on public.field_briefs
  for each row execute function public.field_opportunity_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — field_programmes
-- ---------------------------------------------------------------------------
alter table public.field_programmes enable row level security;

drop policy if exists field_programmes_select_public on public.field_programmes;
create policy field_programmes_select_public
  on public.field_programmes
  for select
  to anon, authenticated
  using (
    visibility_state = 'published'
    and exists (
      select 1 from public.galleries g
      where g.id = field_programmes.gallery_id
        and g.verified = true
    )
  );

drop policy if exists field_programmes_select_staff on public.field_programmes;
create policy field_programmes_select_staff
  on public.field_programmes
  for select
  to authenticated
  using (public.is_gallery_staff(gallery_id));

drop policy if exists field_programmes_insert_staff on public.field_programmes;
create policy field_programmes_insert_staff
  on public.field_programmes
  for insert
  to authenticated
  with check (public.is_gallery_staff(gallery_id));

drop policy if exists field_programmes_update_staff on public.field_programmes;
create policy field_programmes_update_staff
  on public.field_programmes
  for update
  to authenticated
  using (public.is_gallery_staff(gallery_id))
  with check (public.is_gallery_staff(gallery_id));

drop policy if exists field_programmes_delete_staff on public.field_programmes;
create policy field_programmes_delete_staff
  on public.field_programmes
  for delete
  to authenticated
  using (public.is_gallery_staff(gallery_id));

-- ---------------------------------------------------------------------------
-- RLS — field_briefs
-- ---------------------------------------------------------------------------
alter table public.field_briefs enable row level security;

drop policy if exists field_briefs_select_public on public.field_briefs;
create policy field_briefs_select_public
  on public.field_briefs
  for select
  to anon, authenticated
  using (
    visibility_state = 'published'
    and participation_mode = 'open'
    and exists (
      select 1 from public.galleries g
      where g.id = field_briefs.gallery_id
        and g.verified = true
    )
  );

drop policy if exists field_briefs_select_staff on public.field_briefs;
create policy field_briefs_select_staff
  on public.field_briefs
  for select
  to authenticated
  using (public.is_gallery_staff(gallery_id));

drop policy if exists field_briefs_insert_staff on public.field_briefs;
create policy field_briefs_insert_staff
  on public.field_briefs
  for insert
  to authenticated
  with check (public.is_gallery_staff(gallery_id));

drop policy if exists field_briefs_update_staff on public.field_briefs;
create policy field_briefs_update_staff
  on public.field_briefs
  for update
  to authenticated
  using (public.is_gallery_staff(gallery_id))
  with check (public.is_gallery_staff(gallery_id));

drop policy if exists field_briefs_delete_staff on public.field_briefs;
create policy field_briefs_delete_staff
  on public.field_briefs
  for delete
  to authenticated
  using (public.is_gallery_staff(gallery_id));

grant select on public.field_programmes to anon, authenticated;
grant select, insert, update, delete on public.field_programmes to authenticated;
grant select on public.field_briefs to anon, authenticated;
grant select, insert, update, delete on public.field_briefs to authenticated;
grant all on public.field_programmes to service_role;
grant all on public.field_briefs to service_role;
