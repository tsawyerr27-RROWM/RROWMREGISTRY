-- Phase 2C PR1D — Opportunity application review workflow

alter table public.field_opportunity_applications
  drop constraint if exists field_opportunity_applications_status_check;

alter table public.field_opportunity_applications
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users (id) on delete set null;

alter table public.field_opportunity_applications
  add constraint field_opportunity_applications_status_check
    check (status in ('submitted', 'shortlisted', 'selected', 'rejected'));

comment on column public.field_opportunity_applications.reviewed_at is
  'When organisation staff last changed application status.';
comment on column public.field_opportunity_applications.reviewed_by is
  'auth.users id of organisation staff who last reviewed the application.';

create index if not exists field_opportunity_applications_status_idx
  on public.field_opportunity_applications (status);

-- ---------------------------------------------------------------------------
-- RLS — organisation staff may update application status
-- ---------------------------------------------------------------------------
drop policy if exists field_opportunity_applications_update_staff
  on public.field_opportunity_applications;
create policy field_opportunity_applications_update_staff
  on public.field_opportunity_applications
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.field_briefs fb
      where fb.id = field_opportunity_applications.opportunity_id
        and public.is_gallery_staff(fb.gallery_id)
    )
  )
  with check (
    status in ('submitted', 'shortlisted', 'selected', 'rejected')
    and exists (
      select 1
      from public.field_briefs fb
      where fb.id = field_opportunity_applications.opportunity_id
        and public.is_gallery_staff(fb.gallery_id)
    )
  );

grant update on public.field_opportunity_applications to authenticated;
