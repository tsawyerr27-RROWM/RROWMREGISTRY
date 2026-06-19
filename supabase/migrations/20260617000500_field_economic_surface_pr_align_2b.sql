-- PR-ALIGN.2b: public economic-layer reads + field counterparty resolution

drop policy if exists "representation_relationships_select_public_active"
  on public.representation_relationships;
create policy "representation_relationships_select_public_active"
  on public.representation_relationships for select
  to anon, authenticated
  using (status = 'active');

grant select on public.representation_relationships to anon;

create or replace function public.resolve_field_deal_counterparty(p_role text, p_slug text)
returns table (
  user_id uuid,
  display_label text,
  gallery_id uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_slug text := lower(trim(p_slug));
  v_role text := lower(trim(p_role));
begin
  if v_slug = '' then
    return;
  end if;

  if v_role = 'creative' then
    return query
    select
      a.id,
      coalesce(
        nullif(trim(a.display_name), ''),
        nullif(trim(a.full_name), ''),
        'Creative'
      )::text,
      null::uuid
    from public.artists a
    where lower(trim(a.slug)) = v_slug
      and coalesce((a.public_presence ->> 'profile')::boolean, true) = true
    limit 1;
    return;
  end if;

  if v_role = 'organisation' then
    return query
    select
      gu.user_id,
      coalesce(nullif(trim(g.name), ''), 'Organisation')::text,
      g.id
    from public.galleries g
    inner join public.gallery_users gu on gu.gallery_id = g.id
    where lower(trim(g.slug)) = v_slug
      and coalesce((g.public_presence ->> 'profile')::boolean, true) = true
    order by case when gu.role = 'admin' then 0 else 1 end, gu.created_at asc
    limit 1;
    return;
  end if;

  if v_role = 'collector' then
    return query
    select
      cp.user_id,
      coalesce(nullif(trim(cp.display_name), ''), 'Collector')::text,
      null::uuid
    from public.collector_profiles cp
    where lower(trim(cp.slug)) = v_slug
      and cp.is_public = true
    limit 1;
    return;
  end if;
end;
$$;

comment on function public.resolve_field_deal_counterparty(text, text) is
  'Resolve a public Field profile slug to a deal counterparty user (prefers gallery admin).';

grant execute on function public.resolve_field_deal_counterparty(text, text) to authenticated;
