-- Phase 2C PR1C.6 — Eligibility override on mismatch applications

alter table public.field_opportunity_applications
  add column if not exists eligibility_override_requested boolean not null default false,
  add column if not exists eligibility_override_reason text;

comment on column public.field_opportunity_applications.eligibility_override_requested is
  'True when applicant applied despite discipline mismatch (PR1C.6 manual org review).';
comment on column public.field_opportunity_applications.eligibility_override_reason is
  'Applicant justification when eligibility_override_requested is true.';

alter table public.field_opportunity_applications
  drop constraint if exists field_opportunity_applications_override_reason_check;

alter table public.field_opportunity_applications
  add constraint field_opportunity_applications_override_reason_check
    check (
      (
        eligibility_override_requested = false
        and eligibility_override_reason is null
      )
      or (
        eligibility_override_requested = true
        and eligibility_override_reason is not null
        and char_length(trim(eligibility_override_reason)) >= 50
      )
    );
