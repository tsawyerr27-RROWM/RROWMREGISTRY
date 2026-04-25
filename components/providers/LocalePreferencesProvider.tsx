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
} from "@/lib/regions";
import { translate, type MessageKey } from "@/lib/locale-messages";

type LocalePreferencesContextValue = {
  regionId: RegionId;
  region: Region;
  setRegionId: (id: RegionId) => void;
  formatGalleryMonthlyPrice: () => string;
  t: (key: MessageKey) => string;
  hydrated: boolean;
};

const LocalePreferencesContext =
  createContext<LocalePreferencesContextValue | null>(null);

function readStoredRegionId(): RegionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REGION_STORAGE_KEY);
    if (raw && ["gb", "us", "de", "fr", "jp", "au"].includes(raw)) {
      return raw as RegionId;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function LocalePreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [regionId, setRegionIdState] = useState<RegionId>("gb");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredRegionId();
    setRegionIdState(stored ?? inferRegionId());
    setHydrated(true);
  }, []);

  const setRegionId = useCallback((id: RegionId) => {
    setRegionIdState(id);
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
      t,
      hydrated,
    }),
    [regionId, region, setRegionId, formatGalleryMonthlyPrice, t, hydrated]
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
