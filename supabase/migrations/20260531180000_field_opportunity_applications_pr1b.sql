-- Phase 2C PR1B — Field opportunity applications (applicant submit + org read)

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.field_brief_is_accepting_applications(p_brief_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.field_briefs fb
    inner join public.galleries g on g.id = fb.gallery_id
    where fb.id = p_brief_id
      and fb.visibility_state = 'published'
      and fb.participation_mode = 'open'
      and g.verified = true
      and (fb.opens_at is null or fb.opens_at <= now())
      and (fb.closes_at is null or fb.closes_at >= now())
  );
$$;

comment on function public.field_brief_is_accepting_applications(uuid) is
  'True when a brief is published, open participation, verified gallery, and inside its application window.';

-- ---------------------------------------------------------------------------
-- field_opportunity_applications
-- ---------------------------------------------------------------------------
create table if not exists public.field_opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.field_briefs (id) on delete cascade,
  applicant_user_id uuid not null references auth.users (id) on delete cascade,
  applicant_actor_id uuid not null references public.actor_profiles (user_id) on delete cascade,
  status text not null default 'submitted',
  statement_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint field_opportunity_applications_status_check
    check (status in ('submitted')),
  constraint field_opportunity_applications_opportunity_applicant_unique
    unique (opportunity_id, applicant_user_id),
  constraint field_opportunity_applications_applicant_actor_matches
    check (applicant_actor_id = applicant_user_id)
);

create index if not exists field_opportunity_applications_opportunity_id_idx
  on public.field_opportunity_applications (opportunity_id);

create index if not exists field_opportunity_applications_applicant_user_id_idx
  on public.field_opportunity_applications (applicant_user_id);

create index if not exists field_opportunity_applications_created_at_idx
  on public.field_opportunity_applications (created_at desc);

comment on table public.field_opportunity_applications is
  'Creative applications to published Field opportunities (PR1B submit-only).';

drop trigger if exists field_opportunity_applications_set_updated_at
  on public.field_opportunity_applications;
create trigger field_opportunity_applications_set_updated_at
  before update on public.field_opportunity_applications
  for each row execute function public.field_opportunity_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.field_opportunity_applications enable row level security;

drop policy if exists field_opportunity_applications_select_applicant
  on public.field_opportunity_applications;
create policy field_opportunity_applications_select_applicant
  on public.field_opportunity_applications
  for select
  to authenticated
  using (applicant_user_id = auth.uid());

drop policy if exists field_opportunity_applications_select_staff
  on public.field_opportunity_applications;
create policy field_opportunity_applications_select_staff
  on public.field_opportunity_applications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.field_briefs fb
      where fb.id = field_opportunity_applications.opportunity_id
        and public.is_gallery_staff(fb.gallery_id)
    )
  );

drop policy if exists field_opportunity_applications_insert_applicant
  on public.field_opportunity_applications;
create policy field_opportunity_applications_insert_applicant
  on public.field_opportunity_applications
  for insert
  to authenticated
  with check (
    applicant_user_id = auth.uid()
    and applicant_actor_id = auth.uid()
    and status = 'submitted'
    and exists (
      select 1
      from public.actor_profiles ap
      where ap.user_id = auth.uid()
        and ap.role = 'artist'
    )
    and public.field_brief_is_accepting_applications(opportunity_id)
  );

grant select, insert on public.field_opportunity_applications to authenticated;
grant all on public.field_opportunity_applications to service_role;
