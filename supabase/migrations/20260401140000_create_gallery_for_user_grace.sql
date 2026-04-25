-- create_gallery_for_user: avoid subscription_status = 'inactive' when the column
-- is an enum (e.g. active | grace | expired | suspended), which breaks bootstrap
-- and leaves gallery accounts stuck on "complete setup".

create or replace function public.create_gallery_for_user(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_existing uuid;
  v_id uuid;
  base text;
  final_slug text;
  n int := 0;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select gu.gallery_id into v_existing
  from public.gallery_users gu
  where gu.user_id = v_uid
  order by gu.created_at asc
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  base := lower(
    trim(
      both '-'
      from regexp_replace(
        trim(coalesce(p_name, '')),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    )
  );
  if base = '' or base is null then
    base := 'gallery';
  end if;
  final_slug := base || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);

  while exists (select 1 from public.galleries g where g.slug = final_slug) loop
    n := n + 1;
    final_slug := base || '-' || substr(replace(v_uid::text, '-', ''), 1, 8) || '-' || n::text;
  end loop;

  -- Use 'grace' (not 'inactive') so enum-typed subscription_status columns apply cleanly.
  insert into public.galleries (name, slug, verified, subscription_status)
  values (trim(coalesce(p_name, 'Gallery')), final_slug, false, 'grace')
  returning id into v_id;

  insert into public.gallery_users (gallery_id, user_id, role)
  values (v_id, v_uid, 'admin');

  return v_id;
end;
$$;

revoke all on function public.create_gallery_for_user(text) from public;
grant execute on function public.create_gallery_for_user(text) to authenticated;
