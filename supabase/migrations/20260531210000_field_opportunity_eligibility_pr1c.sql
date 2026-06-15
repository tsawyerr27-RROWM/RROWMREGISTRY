-- Phase 2C PR1C — Opportunity eligibility & requirements (information layer)

alter table public.field_briefs
  add column if not exists eligible_disciplines text[],
  add column if not exists eligible_locations text[],
  add column if not exists eligible_career_stages text[],
  add column if not exists eligibility_notes text,
  add column if not exists invitation_only boolean;

comment on column public.field_briefs.eligible_disciplines is
  'Optional discipline slugs describing who the opportunity is intended for.';
comment on column public.field_briefs.eligible_locations is
  'Optional location requirement slugs (informational only).';
comment on column public.field_briefs.eligible_career_stages is
  'Optional career stage slugs (informational only).';
comment on column public.field_briefs.eligibility_notes is
  'Free-text eligibility guidance shown on the public opportunity page.';
comment on column public.field_briefs.invitation_only is
  'When true, opportunity is marked invitation-only (does not block applications).';
