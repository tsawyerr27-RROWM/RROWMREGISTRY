"use client";

import Link from "next/link";

import { RecordExplorerCard } from "@/components/Field/RecordExplorerCard";
import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { RecordExplorerFilters } from "@/components/Field/RecordExplorerFilters";
import { RecordExplorerPagination } from "@/components/Field/RecordExplorerPagination";
import type { RecordExplorerRow } from "@/lib/fetch-record-explorer-list";
import {
  recordExplorerQueryString,
  type RecordExplorerCertificateFilter,
  type RecordExplorerSort,
  type RecordExplorerVerifiedFilter,
} from "@/lib/field-record-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  basePath: string;
  rows: RecordExplorerRow[];
  total: number;
  q: string;
  sort: RecordExplorerSort;
  page: number;
  creative: string;
  organisation: string;
  practice: string;
  verified: RecordExplorerVerifiedFilter;
  certificate: RecordExplorerCertificateFilter;
  formKey: string;
};

export function RecordExplorerContent({
  basePath,
  rows,
  total,
  q,
  sort,
  page,
  creative,
  organisation,
  practice,
  verified,
  certificate,
  formKey,
}: Props) {
  const { t } = useLocalePreferences();
  const hasActiveFilters =
    Boolean(q.trim()) ||
    Boolean(creative) ||
    Boolean(organisation) ||
    Boolean(practice) ||
    verified === "all" ||
    certificate === "present";

  const browseAllHref = (() => {
    const qs = recordExplorerQueryString({
      q,
      sort,
      page: 1,
      creative,
      organisation,
      practice,
      verified: "all",
      certificate,
    });
    return qs ? `${basePath}?${qs}` : `${basePath}?verified=0`;
  })();

  return (
    <div className="mt-10">
      <RecordExplorerFilters
        action={basePath}
        q={q}
        sort={sort}
        creative={creative}
        organisation={organisation}
        practice={practice}
        verified={verified}
        certificate={certificate}
        formKey={formKey}
      />

      {total === 0 ? (
        <div className="mt-14 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm md:px-12">
          <p className="text-sm leading-relaxed text-neutral-600">
            {hasActiveFilters
              ? t("field.explorer.records.empty.filtered")
              : t("field.explorer.records.empty.none")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {hasActiveFilters ? (
              <>
                <Link
                  href={basePath}
                  className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  {t("field.explorer.records.empty.clearFilters")}
                </Link>
                <Link
                  href={browseAllHref}
                  className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  {t("field.explorer.records.empty.browseAll")}
                </Link>
              </>
            ) : (
              <Link
                href="/get-started"
                className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                {t("nav.takePart")}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <RecordExplorerCard key={row.id} row={row} />
            ))}
          </div>

          <RecordExplorerPagination
            basePath={basePath}
            page={page}
            total={total}
            q={q}
            sort={sort}
            creative={creative}
            organisation={organisation}
            practice={practice}
            verified={verified}
            certificate={certificate}
          />
        </>
      )}

      <FieldExplorerDiscoveryStrip activeTab="records" />
    </div>
  );
}
