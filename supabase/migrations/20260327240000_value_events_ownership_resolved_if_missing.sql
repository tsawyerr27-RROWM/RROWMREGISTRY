-- Deployments that skipped 20260325208000 lack value_events.ownership_resolved.
-- resolve_sale_on_ownership() UPDATE fails with 42703 without this column.

alter table public.value_events
  add column if not exists ownership_resolved boolean not null default false;

comment on column public.value_events.ownership_resolved is
  'True when a linked ownership_event has completed the sale transfer workflow.';
