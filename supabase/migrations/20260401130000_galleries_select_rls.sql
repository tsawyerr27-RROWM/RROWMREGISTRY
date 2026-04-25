-- Allow gallery staff to read their own gallery org row.
-- Fixes "Gallery not found" in /gallery-dashboard when RLS blocks SELECT.

alter table public.galleries enable row level security;

drop policy if exists "galleries_select_member" on public.galleries;
create policy "galleries_select_member"
  on public.galleries for select
  to authenticated
  using (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = galleries.id
        and gu.user_id = auth.uid()
    )
  );

grant select on public.galleries to authenticated;

