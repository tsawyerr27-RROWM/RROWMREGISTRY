export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
] as const satisfies readonly Currency[];

/** @deprecated Prefer SUPPORTED_CURRENCIES */
export const CURRENCIES: Currency[] = [...SUPPORTED_CURRENCIES];

export const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code);

/** @deprecated Prefer SUPPORTED_CURRENCY_CODES */
export const CURRENCY_CODES = SUPPORTED_CURRENCY_CODES;

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW"]);

export function normalizeCurrencyCode(
  code: string | null | undefined
): string | null {
  const normalized = String(code ?? "").trim().toUpperCase();
  if (!normalized || !isSupportedCurrency(normalized)) return null;
  return normalized;
}

export function isSupportedCurrency(code: string): boolean {
  const normalized = String(code ?? "").trim().toUpperCase();
  return SUPPORTED_CURRENCIES.some((c) => c.code === normalized);
}

export function getCurrency(code: string): Currency | undefined {
  const normalized = String(code ?? "").trim().toUpperCase();
  return SUPPORTED_CURRENCIES.find((c) => c.code === normalized);
}

export function currencyLabel(code: string): string {
  const c = getCurrency(code);
  if (!c) return String(code ?? "").trim().toUpperCase() || code;
  return `${c.symbol} ${c.code} · ${c.name}`;
}

export function currencyShortLabel(code: string): string {
  const c = getCurrency(code);
  return c?.code ?? String(code ?? "").trim().toUpperCase();
}

export function currencySelectOptions(): { value: string; label: string }[] {
  return [...SUPPORTED_CURRENCIES]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((c) => ({
      value: c.code,
      label: currencyLabel(c.code),
    }));
}

export function currencyFractionDigits(code: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(String(code ?? "").trim().toUpperCase())
    ? 0
    : 2;
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-GB"
): string {
  const code = String(currency ?? "").trim().toUpperCase();
  if (!code) return amount.toLocaleString(locale);

  const fractionDigits = currencyFractionDigits(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${code}`;
  }
}
