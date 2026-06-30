"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export function ValueEventImmutableBadge({ className = "" }: { className?: string }) {
  const { t } = useLocalePreferences();

  return (
    <span
      className={`inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-600 ring-1 ring-neutral-200/90 ${className}`}
    >
      {t("studio.valueEvent.immutableBadge")}
    </span>
  );
}
