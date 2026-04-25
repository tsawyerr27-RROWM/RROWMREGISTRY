-- PostgREST (PGRST202) can fail to resolve set_onboarding_role(text, text) when
-- parameter names/order don't match the schema cache. Single jsonb arg is unambiguous.

-- Column must exist before the function body references it. If 20260401170000 was never
-- applied, this migration would otherwise fail at CREATE FUNCTION (42703).
alter table public.actor_profiles
  add column if not exists onboarding_complete boolean;

update public.actor_profiles
set onboarding_complete = coalesce(onboarding_complete, false)
where onboarding_complete is null;

alter table public.actor_profiles
  alter column onboarding_complete set default false;

alter table public.actor_profiles
  alter column onboarding_complete set not null;

drop function if exists public.set_onboarding_role(text, text);

create or replace function public.set_onboarding_role(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_name text;
  v_role text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if p_payload is null then
    raise exception 'Invalid payload';
  end if;

  v_role := trim(coalesce(p_payload->>'p_role', ''));
  if v_role not in ('artist', 'gallery', 'collector') then
    raise exception 'Invalid role';
  end if;

  v_name := trim(coalesce(p_payload->>'p_display_name', ''));

  insert into public.actor_profiles (user_id, role, display_name, onboarding_complete)
  values (v_uid, v_role, v_name, false)
  on conflict (user_id) do update set
    role = excluded.role,
    display_name = case
      when excluded.display_name = '' then actor_profiles.display_name
      else excluded.display_name
    end,
    onboarding_complete = false,
    updated_at = now();
end;
$$;

revoke all on function public.set_onboarding_role(jsonb) from public;
grant execute on function public.set_onboarding_role(jsonb) to authenticated;
