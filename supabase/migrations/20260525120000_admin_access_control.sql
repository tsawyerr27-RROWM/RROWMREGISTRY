-- Formalize admin access control.
-- The is_admin column may already exist (added manually); ensure it is present
-- with proper defaults and constraints.

alter table public.artists
  add column if not exists is_admin boolean not null default false;

comment on column public.artists.is_admin is
  'Platform-level admin flag. Only settable via direct DB access or migration — never exposed through application APIs.';

-- Revoke direct UPDATE on is_admin from authenticated users to prevent self-escalation.
-- The column can only be changed via service-role (migrations, admin SQL).
create or replace function public.prevent_self_admin_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if current_setting('role', true) <> 'service_role' then
      raise exception 'Admin status can only be changed by a service-role operation'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_admin_self_escalation on public.artists;
create trigger trg_prevent_admin_self_escalation
  before update of is_admin on public.artists
  for each row
  execute procedure public.prevent_self_admin_escalation();

-- Grant admin to the designated platform owner.
-- Uses auth.users email lookup to resolve the user ID.
do $$
declare
  v_uid uuid;
begin
  select id into v_uid
  from auth.users
  where lower(email) = 'sawyerrtimi95@hotmail.com'
  limit 1;

  if v_uid is not null then
    update public.artists
    set is_admin = true
    where id = v_uid;

    -- Ensure actor_profiles exists for this user
    insert into public.actor_profiles (user_id, role)
    values (v_uid, 'artist')
    on conflict (user_id) do nothing;
  end if;
end;
$$;
