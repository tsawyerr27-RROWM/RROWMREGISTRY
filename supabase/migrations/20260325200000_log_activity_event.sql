-- Dashboard + admin APIs call public.log_activity_event(...). PostgREST returns PGRST202
-- if this function (and usually activity_events) is missing.

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  message text not null,
  artwork_id uuid references public.artworks (id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_created_idx
  on public.activity_events (user_id, created_at desc);

alter table public.activity_events enable row level security;

drop policy if exists "activity_events_select_own" on public.activity_events;
create policy "activity_events_select_own"
  on public.activity_events for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.activity_events to authenticated;

-- Inserts only through SECURITY DEFINER function (below).

create or replace function public.log_activity_event(
  p_user_id uuid,
  p_type text,
  p_message text,
  p_artwork_id uuid default null,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') = 'service_role' then
    null;
  elsif (select auth.uid()) is not null and (select auth.uid()) = p_user_id then
    null;
  else
    raise exception 'log_activity_event: not allowed'
      using errcode = '42501';
  end if;

  insert into public.activity_events (user_id, type, message, artwork_id, metadata)
  values (p_user_id, p_type, p_message, p_artwork_id, p_metadata);
end;
$$;

comment on function public.log_activity_event(uuid, text, text, uuid, jsonb) is
  'Append a row to activity_events. Callers: same user as p_user_id, or service_role (admin).';

grant execute on function public.log_activity_event(uuid, text, text, uuid, jsonb) to authenticated;
grant execute on function public.log_activity_event(uuid, text, text, uuid, jsonb) to service_role;
