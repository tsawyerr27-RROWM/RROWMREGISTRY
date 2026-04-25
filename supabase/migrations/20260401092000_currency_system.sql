-- Global currency system (value_events)
-- - Canonical supported currency codes (UI enforced, DB enforced)
-- - Uppercase normalization + constraint

do $$
begin
  -- Normalize existing rows to uppercase codes (safe, idempotent).
  begin
    update public.value_events
    set currency = upper(trim(currency))
    where currency is not null and currency <> upper(trim(currency));
  exception when undefined_table then
    return;
  end;

  -- Hard stop if unsupported or missing currencies exist.
  if exists (
    select 1
    from public.value_events ve
    where ve.currency is null
      or trim(ve.currency) = ''
      or upper(trim(ve.currency)) not in (
        'USD','EUR','GBP','JPY','CNY','HKD','AED','SAR','INR','KRW','CHF','AUD','CAD','SGD','ZAR','BRL','MXN','NGN'
      )
  ) then
    raise exception 'value_events.currency contains unsupported or blank codes — clean data before enforcing constraint';
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'value_events_currency_supported_check'
  ) then
    alter table public.value_events
      add constraint value_events_currency_supported_check
      check (
        currency = upper(currency)
        and currency = any (
          array[
            'USD','EUR','GBP','JPY','CNY','HKD','AED','SAR','INR','KRW','CHF','AUD','CAD','SGD','ZAR','BRL','MXN','NGN'
          ]::text[]
        )
      );
  end if;
exception
  when duplicate_object then null;
end $$;

