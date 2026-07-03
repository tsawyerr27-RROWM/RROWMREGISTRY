"use client";

import Link from "next/link";

import { CreativeExplorerFilters } from "@/components/Field/CreativeExplorerFilters";
import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldExplorerResultsToolbar } from "@/components/Field/FieldExplorerResultsToolbar";
import { FieldV2EmptyState } from "@/components/Field/FieldV2EmptyState";
import { CreativePresenceCard } from "@/components/Field/CreativePresenceCard";
import { FieldExplorerPagination } from "@/components/Field/FieldExplorerPagination";
import { useFieldExplorerDensity } from "@/hooks/useFieldExplorerDensity";
import type { CreativeExplorerRow } from "@/lib/fetch-creative-explorer-list";
import type {
  CreativeExplorerSort,
  CreativeExplorerVerifiedFilter,
} from "@/lib/field-creative-explorer-params";
import { fieldExplorerDensityGridClass } from "@/lib/field-explorer-density";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  basePath: string;
  rows: CreativeExplorerRow[];
  total: number;
  q: string;
  sort: CreativeExplorerSort;
  page: number;
  practice: string;
  verified: CreativeExplorerVerifiedFilter;
  formKey: string;
};

export function CreativeExplorerContent({
  basePath,
  rows,
  total,
  q,
  sort,
  page,
  practice,
  verified,
  formKey,
}: Props) {
  const { t } = useLocalePreferences();
  const { density, setDensity } = useFieldExplorerDensity("creatives");
  const hasActiveFilters =
    Boolean(q.trim()) || Boolean(practice) || verified === "verified";

  return (
    <div className="mt-6">
      <CreativeExplorerFilters
        action={basePath}
        q={q}
        sort={sort}
        practice={practice}
        verified={verified}
        formKey={formKey}
      />

      {total === 0 ? (
        <FieldV2EmptyState
          message={
            hasActiveFilters
              ? t("field.explorer.creatives.empty.filtered")
              : t("field.explorer.creatives.empty.none")
          }
          actions={
            hasActiveFilters ? (
              <>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.explorer.creatives.empty.clearFilters")}
                </Link>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.explorer.creatives.empty.browseAll")}
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
                {total} {total === 1 ? "Creative" : "Creatives"}
              </p>
            }
          />
          <div
            className={fieldExplorerDensityGridClass(density, "creatives")}
            data-density={density}
          >
            {rows.map((row) => (
              <CreativePresenceCard key={row.id} row={row} />
            ))}
          </div>

          <FieldExplorerPagination
            basePath={basePath}
            page={page}
            total={total}
            q={q}
            sort={sort}
            practice={practice}
            verified={verified}
          />
        </>
      )}

      <FieldExplorerDiscoveryStrip activeTab="creatives" />
    </div>
  );
}
