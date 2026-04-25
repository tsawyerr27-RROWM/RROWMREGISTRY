-- bootstrap_gallery_profile: if user already has gallery_users (partial / legacy
-- bootstrap, grace flow, double-submit), succeed instead of 409 — sync actor_profiles
-- and return their gallery id.

create or replace function public.bootstrap_gallery_profile(
  p_name text,
  p_slug text,
  p_location text default null,
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_gid uuid;
  base_slug text;
  final_slug text;
  n int := 0;
  v_name text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if exists (select 1 from public.gallery_users gu where gu.user_id = v_uid) then
    select gu.gallery_id into v_gid
    from public.gallery_users gu
    where gu.user_id = v_uid
    order by case when gu.role = 'admin' then 0 else 1 end, gu.created_at
    limit 1;

    v_name := trim(coalesce(p_name, ''));
    if v_name = '' then
      select g.name into v_name from public.galleries g where g.id = v_gid;
    end if;
    v_name := coalesce(nullif(trim(v_name), ''), 'Gallery');

    insert into public.actor_profiles (user_id, role, display_name, onboarding_complete)
    values (v_uid, 'gallery', v_name, true)
    on conflict (user_id) do update set
      role = 'gallery',
      display_name = excluded.display_name,
      onboarding_complete = true,
      updated_at = now();

    return v_gid;
  end if;

  v_name := trim(coalesce(p_name, ''));
  if v_name = '' then
    raise exception 'Gallery name is required';
  end if;

  base_slug := lower(
    trim(
      both '-'
      from regexp_replace(
        trim(coalesce(p_slug, '')),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    )
  );
  if base_slug = '' or base_slug is null then
    base_slug := 'gallery';
  end if;

  final_slug := base_slug || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);

  while exists (select 1 from public.galleries g where g.slug = final_slug) loop
    n := n + 1;
    final_slug :=
      base_slug || '-' || substr(replace(v_uid::text, '-', ''), 1, 8) || '-' || n::text;
  end loop;

  insert into public.galleries (name, slug, location, website_url, verified, subscription_status)
  values (
    v_name,
    final_slug,
    nullif(trim(coalesce(p_location, '')), ''),
    nullif(trim(coalesce(p_website, '')), ''),
    false,
    'grace'
  )
  returning id into v_gid;

  insert into public.gallery_users (gallery_id, user_id, role)
  values (v_gid, v_uid, 'admin');

  insert into public.actor_profiles (user_id, role, display_name, onboarding_complete)
  values (v_uid, 'gallery', v_name, true)
  on conflict (user_id) do update set
    role = 'gallery',
    display_name = excluded.display_name,
    onboarding_complete = true,
    updated_at = now();

  return v_gid;
end;
$$;

revoke all on function public.bootstrap_gallery_profile(text, text, text, text) from public;
grant execute on function public.bootstrap_gallery_profile(text, text, text, text) to authenticated;
