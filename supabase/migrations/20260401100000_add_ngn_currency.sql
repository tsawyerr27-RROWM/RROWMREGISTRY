-- Add NGN (Nigerian Naira) to supported currency set.
-- Safe to run whether the original constraint exists or not.

do $$
begin
  begin
    update public.value_events
    set currency = upper(trim(currency))
    where currency is not null and currency <> upper(trim(currency));
  exception when undefined_table then
    return;
  end;

  -- Drop and recreate constraint with NGN included.
  if exists (select 1 from pg_constraint where conname = 'value_events_currency_supported_check') then
    alter table public.value_events
      drop constraint value_events_currency_supported_check;
  end if;

  -- Re-check for unsupported currencies (now including NGN).
  if exists (
    select 1
    from public.value_events ve
    where ve.currency is null
      or trim(ve.currency) = ''
      or upper(trim(ve.currency)) not in (
        'USD','EUR','GBP','JPY','CNY','HKD','AED','SAR','INR','KRW','CHF','AUD','CAD','SGD','ZAR','NGN','BRL','MXN'
      )
  ) then
    raise exception 'value_events.currency contains unsupported or blank codes — clean data before enforcing constraint';
  end if;

  alter table public.value_events
    add constraint value_events_currency_supported_check
    check (
      currency = upper(currency)
      and currency = any (
        array[
          'USD','EUR','GBP','JPY','CNY','HKD','AED','SAR','INR','KRW','CHF','AUD','CAD','SGD','ZAR','NGN','BRL','MXN'
        ]::text[]
      )
    );
exception
  when duplicate_object then null;
end $$;

