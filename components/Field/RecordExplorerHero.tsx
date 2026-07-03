"use client";

import Link from "next/link";

import { FieldExplorerHeroShell } from "@/components/Field/FieldExplorerHeroShell";
import { FieldExplorerInfoTooltip } from "@/components/Field/FieldExplorerInfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldVerifyHref } from "@/lib/field-nav";
import type {
  RecordExplorerCertificateFilter,
  RecordExplorerTrustFilter,
} from "@/lib/field-record-explorer-params";

type Props = {
  searchQuery: string;
  total: number;
  creative: string;
  organisation: string;
  practice: string;
  trust: RecordExplorerTrustFilter;
  certificate: RecordExplorerCertificateFilter;
};

export function RecordExplorerHero({
  searchQuery,
  total,
  creative,
  organisation,
  practice,
  trust,
  certificate,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQ) ||
    Boolean(creative) ||
    Boolean(organisation) ||
    Boolean(practice) ||
    trust !== "all" ||
    certificate === "present";

  const metaParts: string[] = [];
  if (total > 0) {
    metaParts.push(`${total} ${total === 1 ? "record" : "records"}`);
  }
  if (trust !== "all") {
    metaParts.push(t(`field.explorer.records.trustScope.${trust}`));
  }
  if (trimmedQ) {
    metaParts.push(`${t("field.explorer.records.searching")} “${trimmedQ}”`);
  }
  if (hasFilters) {
    metaParts.push(t("field.explorer.records.filtered"));
  }

  return (
    <FieldExplorerHeroShell
      title={t("field.explorer.records.headline")}
      infoTooltip={<FieldExplorerInfoTooltip text={t("field.explorer.records.lede")} />}
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
