"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldVerifyHref } from "@/lib/field-nav";
import type {
  RecordExplorerCertificateFilter,
  RecordExplorerVerifiedFilter,
} from "@/lib/field-record-explorer-params";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  searchQuery: string;
  total: number;
  creative: string;
  organisation: string;
  practice: string;
  verified: RecordExplorerVerifiedFilter;
  certificate: RecordExplorerCertificateFilter;
};

export function RecordExplorerHero({
  searchQuery,
  total,
  creative,
  organisation,
  practice,
  verified,
  certificate,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQ) ||
    Boolean(creative) ||
    Boolean(organisation) ||
    Boolean(practice) ||
    verified === "all" ||
    certificate === "present";

  return (
    <section
      className={`relative mt-2 overflow-hidden ${registryV2.surface.filingMajor} p-8 lg:p-12 xl:p-14 ${registryV2.motion.reveal}`}
    >
      <p className={registryV2.type.metaLabel}>{t("registry.explorer.indexLabel")}</p>
      <h1 className={`${registryV2.type.recordTitle} mt-4 max-w-3xl`}>
        {t("field.explorer.records.headline")}
      </h1>
      <p className={`${registryV2.type.metaValue} mt-6 max-w-2xl text-base`}>
        {t("field.explorer.records.lede")}
      </p>
      {total > 0 || hasFilters || trimmedQ ? (
        <p className={`${registryV2.type.monoId} mt-8`}>
          {total > 0 ? (
            <>
              {total} {total === 1 ? "record" : "records"}
              {" · "}
            </>
          ) : null}
          {verified === "all"
            ? t("field.explorer.records.verifiedScopeAll")
            : t("field.explorer.records.verifiedScopeDefault")}
          {trimmedQ ? (
            <>
              {" "}
              · {t("field.explorer.records.searching")} “{trimmedQ}”
            </>
          ) : null}
          {hasFilters ? ` · ${t("field.explorer.records.filtered")}` : null}
        </p>
      ) : null}
      <div className="mt-6">
        <Link
          href={fieldVerifyHref()}
          className="v2-cta-secondary inline-flex !min-h-0 px-5 py-2.5 text-xs"
        >
          {t("field.explorer.link.verifyHub")}
        </Link>
      </div>
    </section>
  );
}
