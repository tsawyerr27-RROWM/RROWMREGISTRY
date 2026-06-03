"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GALLERY_MONTHLY_GBP,
  REGION_STORAGE_KEY,
  type Region,
  type RegionId,
  formatGalleryMonthlyFromGbp,
  getRegion,
  inferRegionId,
  parseRegionId,
  writeRegionCookie,
} from "@/lib/regions";
import { formatCurrency } from "@/lib/formatCurrency";
import { translate, type MessageKey } from "@/lib/locale-messages";

type LocalePreferencesContextValue = {
  regionId: RegionId;
  region: Region;
  setRegionId: (id: RegionId) => void;
  formatGalleryMonthlyPrice: () => string;
  formatMoney: (amount: number, currency: string) => string;
  t: (key: MessageKey) => string;
  hydrated: boolean;
};

const LocalePreferencesContext =
  createContext<LocalePreferencesContextValue | null>(null);

function readStoredRegionId(): RegionId | null {
  if (typeof window === "undefined") return null;
  try {
    return parseRegionId(window.localStorage.getItem(REGION_STORAGE_KEY));
  } catch {
    /* ignore */
  }
  return null;
}

export function LocalePreferencesProvider({
  children,
  initialRegionId = "gb",
}: {
  children: React.ReactNode;
  /** From `rrowm_region` cookie — keeps SSR and first client paint aligned. */
  initialRegionId?: RegionId;
}) {
  const [regionId, setRegionIdState] = useState<RegionId>(initialRegionId);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredRegionId();
    const resolved = stored ?? inferRegionId();
    if (resolved !== initialRegionId) {
      setRegionIdState(resolved);
    }
    writeRegionCookie(resolved);
    if (!stored) {
      try {
        window.localStorage.setItem(REGION_STORAGE_KEY, resolved);
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);
  }, [initialRegionId]);

  const setRegionId = useCallback((id: RegionId) => {
    setRegionIdState(id);
    writeRegionCookie(id);
    try {
      window.localStorage.setItem(REGION_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const region = useMemo(() => getRegion(regionId), [regionId]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = region.locale;
  }, [region.locale, hydrated]);

  const formatGalleryMonthlyPrice = useCallback(
    () => formatGalleryMonthlyFromGbp(GALLERY_MONTHLY_GBP, region),
    [region]
  );

  const formatMoney = useCallback(
    (amount: number, currency: string) =>
      formatCurrency(amount, currency, region.locale),
    [region.locale]
  );

  const t = useCallback(
    (key: MessageKey) => translate(key, region.lang),
    [region.lang]
  );

  const value = useMemo(
    () => ({
      regionId,
      region,
      setRegionId,
      formatGalleryMonthlyPrice,
      formatMoney,
      t,
      hydrated,
    }),
    [
      regionId,
      region,
      setRegionId,
      formatGalleryMonthlyPrice,
      formatMoney,
      t,
      hydrated,
    ]
  );

  return (
    <LocalePreferencesContext.Provider value={value}>
      {children}
    </LocalePreferencesContext.Provider>
  );
}

export function useLocalePreferences(): LocalePreferencesContextValue {
  const ctx = useContext(LocalePreferencesContext);
  if (!ctx) {
    throw new Error(
      "useLocalePreferences must be used within LocalePreferencesProvider"
    );
  }
  return ctx;
}

/** Safe for components that may render outside provider (e.g. tests). */
export function useLocalePreferencesOptional(): LocalePreferencesContextValue | null {
  return useContext(LocalePreferencesContext);
}
