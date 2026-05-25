-- Gallery staff may create and update artwork authentication invites for their institution.

drop policy if exists aai_insert_gallery_staff on public.artwork_authentication_invites;
create policy aai_insert_gallery_staff
  on public.artwork_authentication_invites for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
        and gu.role in ('admin', 'staff')
    )
  );

drop policy if exists aai_update_gallery_staff on public.artwork_authentication_invites;
create policy aai_update_gallery_staff
  on public.artwork_authentication_invites for update
  to authenticated
  using (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
        and gu.role in ('admin', 'staff')
    )
  )
  with check (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
        and gu.role in ('admin', 'staff')
    )
  );

grant insert, update on public.artwork_authentication_invites to authenticated;
