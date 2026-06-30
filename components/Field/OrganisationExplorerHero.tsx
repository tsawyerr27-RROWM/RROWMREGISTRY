"use client";

import Link from "next/link";

import { FieldExplorerHeroShell } from "@/components/Field/FieldExplorerHeroShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldVerifyHref } from "@/lib/field-nav";

type Props = {
  searchQuery: string;
  total: number;
  location: string;
  verified: "all" | "verified";
  represented: "all" | "represented";
};

export function OrganisationExplorerHero({
  searchQuery,
  total,
  location,
  verified,
  represented,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQ) ||
    Boolean(location.trim()) ||
    verified === "verified" ||
    represented === "represented";

  const metaParts: string[] = [];
  if (total > 0) {
    metaParts.push(
      `${total} ${total === 1 ? "Organisation" : "Organisations"}`
    );
  }
  if (trimmedQ) {
    metaParts.push(
      `${t("field.explorer.organisations.searching")} “${trimmedQ}”`
    );
  }
  if (hasFilters) {
    metaParts.push(t("field.explorer.organisations.filtered"));
  }

  return (
    <FieldExplorerHeroShell
      indexLabel={t("field.explorer.tab.organisations")}
      title={t("field.explorer.organisations.headline")}
      lede={t("field.explorer.organisations.lede")}
      meta={metaParts.length > 0 ? metaParts.join(" · ") : undefined}
      actions={
        <Link
          href={fieldVerifyHref()}
          className="v2-cta-secondary inline-flex !min-h-0 px-5 py-2.5 text-xs"
        >
          {t("field.explorer.link.verifyHub")}
        </Link>
      }
    />
  );
}
