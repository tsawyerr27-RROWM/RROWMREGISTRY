export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-GB"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 0,
  }).format(amount);
}

