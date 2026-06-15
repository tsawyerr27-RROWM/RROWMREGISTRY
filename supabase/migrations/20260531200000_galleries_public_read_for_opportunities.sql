-- Restore public galleries read required by field_briefs_select_public EXISTS subquery.
-- 20260401130000_galleries_select_rls.sql replaced broad public read with member-only
-- select; anon could not evaluate galleries.verified in opportunity RLS.

grant select on public.galleries to anon, authenticated;

drop policy if exists "rrowm_galleries_select_public" on public.galleries;
create policy "rrowm_galleries_select_public"
  on public.galleries
  for select
  to anon, authenticated
  using (true);

-- galleries_select_member and galleries_update_admin are unchanged.
