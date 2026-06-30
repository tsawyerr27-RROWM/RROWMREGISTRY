"use client";

import { FieldExplorerHeroShell } from "@/components/Field/FieldExplorerHeroShell";
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
    <FieldExplorerHeroShell
      indexLabel={t("field.explorer.tab.opportunities")}
      title={t("field.opportunities.headline")}
      lede={t("field.opportunities.lede")}
      meta={metaParts.length > 0 ? metaParts.join(" · ") : undefined}
    />
  );
}
