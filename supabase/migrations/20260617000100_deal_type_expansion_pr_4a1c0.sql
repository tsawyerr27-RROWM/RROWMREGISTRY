-- PR-4A.1c.0 — Expand deal type constraints for intent-based proposals

alter table public.deals drop constraint if exists deals_type_check;

alter table public.deals
  add constraint deals_type_check check (
    type in (
      'sale',
      'loan',
      'consignment',
      'exhibition',
      'other',
      'commission',
      'acquisition',
      'representation',
      'licensing',
      'collaboration'
    )
  );

notify pgrst, 'reload schema';
