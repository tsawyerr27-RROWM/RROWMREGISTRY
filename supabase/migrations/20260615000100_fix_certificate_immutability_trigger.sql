-- Replace hidden lock_certificates trigger: allow UPDATE until snapshot + hash are set.

drop trigger if exists lock_certificates on public.certificates;
drop function if exists public.prevent_certificate_updates();

create or replace function public.prevent_certificate_mutation_after_issue()
returns trigger
language plpgsql
as $$
begin
  -- Allow inserts
  if tg_op = 'INSERT' then
    return new;
  end if;

  -- Allow updates while certificate is incomplete
  if old.certificate_hash is null
     or old.certificate_hash = ''
     or old.certificate_snapshot is null
  then
    return new;
  end if;

  -- Block mutation once fully issued
  if to_jsonb(old) is distinct from to_jsonb(new) then
    raise exception 'Certificates are immutable once issued.';
  end if;

  return new;
end;
$$;

create trigger lock_certificates
before update on public.certificates
for each row
execute function public.prevent_certificate_mutation_after_issue();
