"use client";

import Link from "next/link";

import { FieldExplorerHeroShell } from "@/components/Field/FieldExplorerHeroShell";
import { FieldExplorerInfoTooltip } from "@/components/Field/FieldExplorerInfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldVerifyHref } from "@/lib/field-nav";

type Props = {
  searchQuery: string;
  total: number;
  practice: string;
  verified: "all" | "verified";
};

export function CreativeExplorerHero({
  searchQuery,
  total,
  practice,
  verified,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQ) || Boolean(practice) || verified === "verified";

  const metaParts: string[] = [];
  if (total > 0) {
    metaParts.push(`${total} ${total === 1 ? "Creative" : "Creatives"}`);
  }
  if (trimmedQ) {
    metaParts.push(`${t("field.explorer.creatives.searching")} “${trimmedQ}”`);
  }
  if (hasFilters) {
    metaParts.push(t("field.explorer.creatives.filtered"));
  }

  return (
    <FieldExplorerHeroShell
      title={t("field.explorer.creatives.headline")}
      infoTooltip={<FieldExplorerInfoTooltip text={t("field.explorer.creatives.lede")} />}
      meta={metaParts.length > 0 ? metaParts.join(" · ") : undefined}
      actions={
        <Link
          href={fieldVerifyHref()}
          className="v2-cta-secondary inline-flex min-h-[44px] items-center px-4 py-2.5 text-xs"
        >
          {t("field.explorer.link.verifyHub")}
        </Link>
      }
    />
  );
}
