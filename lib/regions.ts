/**
 * Regional pricing display: base amount is GBP. Rates are indicative for UI only;
 * actual billing may use live rates at checkout.
 */
export const GALLERY_MONTHLY_GBP = 29.99;

export type RegionId = "gb" | "us" | "de" | "fr" | "jp" | "au";

export type Region = {
  id: RegionId;
  /** Country / market label for the selector */
  label: string;
  /** Stripe-style trigger: "English (United Kingdom)" */
  localeDisplayLabel: string;
  currency: string;
  /** BCP 47 locale for Intl formatting */
  locale: string;
  /** Short language code for bundled UI strings */
  lang: "en" | "de" | "fr" | "ja";
  /** Multiply GBP list price to approximate local currency (display only). */
  rateFromGbp: number;
};

export const REGIONS: readonly Region[] = [
  {
    id: "gb",
    label: "United Kingdom",
    localeDisplayLabel: "English (United Kingdom)",
    currency: "GBP",
    locale: "en-GB",
    lang: "en",
    rateFromGbp: 1,
  },
  {
    id: "us",
    label: "United States",
    localeDisplayLabel: "English (United States)",
    currency: "USD",
    locale: "en-US",
    lang: "en",
    rateFromGbp: 1.27,
  },
  {
    id: "de",
    label: "Germany",
    localeDisplayLabel: "Deutsch (Deutschland)",
    currency: "EUR",
    locale: "de-DE",
    lang: "de",
    rateFromGbp: 1.17,
  },
  {
    id: "fr",
    label: "France",
    localeDisplayLabel: "Français (France)",
    currency: "EUR",
    locale: "fr-FR",
    lang: "fr",
    rateFromGbp: 1.17,
  },
  {
    id: "jp",
    label: "Japan",
    localeDisplayLabel: "日本語 (日本)",
    currency: "JPY",
    locale: "ja-JP",
    lang: "ja",
    rateFromGbp: 192,
  },
  {
    id: "au",
    label: "Australia",
    localeDisplayLabel: "English (Australia)",
    currency: "AUD",
    locale: "en-AU",
    lang: "en",
    rateFromGbp: 1.93,
  },
] as const;

export const REGION_STORAGE_KEY = "rrowm_region";

export function getRegion(id: RegionId): Region {
  const r = REGIONS.find((x) => x.id === id);
  return r ?? REGIONS[0];
}

/** Format gallery monthly price from GBP base for a region (indicative conversion). */
export function formatGalleryMonthlyFromGbp(gbp: number, region: Region): string {
  const raw = gbp * region.rateFromGbp;
  const amount =
    region.currency === "JPY" ? Math.round(raw) : Math.round(raw * 100) / 100;
  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: region.currency === "JPY" ? 0 : 2,
    minimumFractionDigits: region.currency === "JPY" ? 0 : 2,
  }).format(amount);
}

export function inferRegionId(): RegionId {
  if (typeof navigator === "undefined") return "gb";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("ja")) return "jp";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("en-au")) return "au";
  if (lang.startsWith("en-us")) return "us";
  if (lang.startsWith("en-gb")) return "gb";
  if (lang.startsWith("en")) return "gb";
  return "gb";
}
