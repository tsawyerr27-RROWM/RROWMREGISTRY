"use client";

import Link from "next/link";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldExplorerResultsToolbar } from "@/components/Field/FieldExplorerResultsToolbar";
import { RecordExplorerCard } from "@/components/Field/RecordExplorerCard";
import { RecordExplorerFilters } from "@/components/Field/RecordExplorerFilters";
import { RecordExplorerPagination } from "@/components/Field/RecordExplorerPagination";
import { FieldV2EmptyState } from "@/components/Field/FieldV2EmptyState";
import { useFieldExplorerDensity } from "@/hooks/useFieldExplorerDensity";
import type { RecordExplorerRow } from "@/lib/fetch-record-explorer-list";
import {
  recordExplorerQueryString,
  type RecordExplorerCertificateFilter,
  type RecordExplorerSort,
  type RecordExplorerVerifiedFilter,
} from "@/lib/field-record-explorer-params";
import { fieldExplorerDensityGridClass } from "@/lib/field-explorer-density";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

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
  const { density, setDensity } = useFieldExplorerDensity("records");
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
        <FieldV2EmptyState
          message={
            hasActiveFilters
              ? t("field.explorer.records.empty.filtered")
              : t("field.explorer.records.empty.none")
          }
          actions={
            hasActiveFilters ? (
              <>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.explorer.records.empty.clearFilters")}
                </Link>
                <Link href={browseAllHref} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.explorer.records.empty.browseAll")}
                </Link>
              </>
            ) : (
              <Link href="/get-started" className="v2-cta-primary !min-h-0 px-5 py-2.5 text-xs">
                {t("nav.takePart")}
              </Link>
            )
          }
        />
      ) : (
        <>
          <FieldExplorerResultsToolbar
            density={density}
            onDensityChange={setDensity}
            leading={
              <p className={registryV2.type.monoId}>
                {total} {total === 1 ? "record" : "records"}
              </p>
            }
          />

          <div
            className={fieldExplorerDensityGridClass(density, "records")}
            data-density={density}
          >
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
