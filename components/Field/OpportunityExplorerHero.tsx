"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  searchQuery: string;
  total: number;
  sector: string;
  practice: string;
  briefType: string;
  window: string;
};

export function OpportunityExplorerHero({
  searchQuery,
  total,
  sector,
  practice,
  briefType,
  window,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQ) ||
    Boolean(sector) ||
    Boolean(practice) ||
    Boolean(briefType) ||
    window !== "all";

  const metaParts: string[] = [];
  if (total > 0) {
    metaParts.push(
      `${total} ${
        total === 1
          ? t("field.opportunities.countSingular")
          : t("field.opportunities.countPlural")
      }`
    );
  }
  if (trimmedQ) {
    metaParts.push(`${t("field.opportunities.searching")} “${trimmedQ}”`);
  }
  if (hasFilters) {
    metaParts.push(t("field.opportunities.filtered"));
  }

  return (
    <section className="relative overflow-hidden pb-4 pt-2 md:pb-8 md:pt-4">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#e8e4df]/40 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full bg-[#dfe8e3]/35 blur-[90px]"
        aria-hidden
      />

      <div className="relative max-w-4xl">
        <h1 className="font-serif text-[2.5rem] font-normal leading-[1.04] tracking-tight text-neutral-950 md:text-6xl md:leading-[1.02]">
          {t("field.opportunities.headline")}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-[1.75] text-neutral-600 md:text-xl md:leading-[1.7]">
          {t("field.opportunities.lede")}
        </p>
        {metaParts.length > 0 ? (
          <p className="mt-10 text-sm text-neutral-500">{metaParts.join(" · ")}</p>
        ) : null}
      </div>
    </section>
  );
}
