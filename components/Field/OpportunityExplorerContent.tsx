"use client";

import Link from "next/link";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldExplorerResultsToolbar } from "@/components/Field/FieldExplorerResultsToolbar";
import { FieldV2EmptyState } from "@/components/Field/FieldV2EmptyState";
import { OpportunityExplorerCard } from "@/components/Field/OpportunityExplorerCard";
import { OpportunityExplorerFilters } from "@/components/Field/OpportunityExplorerFilters";
import { OpportunityExplorerPagination } from "@/components/Field/OpportunityExplorerPagination";
import { useFieldExplorerDensity } from "@/hooks/useFieldExplorerDensity";
import type { FieldOpportunityCard } from "@/lib/fetch-field-opportunities-list";
import type { FieldOpportunityListParams } from "@/lib/field-opportunity-params";
import { fieldExplorerDensityGridClass } from "@/lib/field-explorer-density";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  basePath: string;
  rows: FieldOpportunityCard[];
  total: number;
  params: FieldOpportunityListParams;
  formKey: string;
};

export function OpportunityExplorerContent({
  basePath,
  rows,
  total,
  params,
  formKey,
}: Props) {
  const { t } = useLocalePreferences();
  const { density, setDensity } = useFieldExplorerDensity("opportunities");
  const hasActiveFilters =
    Boolean(params.q.trim()) ||
    Boolean(params.sector) ||
    Boolean(params.practice) ||
    Boolean(params.briefType) ||
    params.window !== "all";

  return (
    <div className="mt-6">
      <OpportunityExplorerFilters
        action={basePath}
        q={params.q}
        sector={params.sector}
        practice={params.practice}
        briefType={params.briefType}
        window={params.window}
        sort={params.sort}
        formKey={formKey}
      />

      {total === 0 ? (
        <FieldV2EmptyState
          message={
            hasActiveFilters
              ? t("field.opportunities.empty.filtered")
              : t("field.opportunities.empty.none")
          }
          actions={
            hasActiveFilters ? (
              <>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.opportunities.empty.clearFilters")}
                </Link>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.opportunities.empty.browseAll")}
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
                {total}{" "}
                {total === 1
                  ? t("field.opportunities.countSingular")
                  : t("field.opportunities.countPlural")}
              </p>
            }
          />
          <div
            className={fieldExplorerDensityGridClass(density, "opportunities")}
            data-density={density}
          >
            {rows.map((row, index) => (
              <OpportunityExplorerCard
                key={row.id}
                row={row}
                variant={index === 0 && density === "editorial" ? "featured" : "standard"}
                accentIndex={index}
              />
            ))}
          </div>
          <OpportunityExplorerPagination
            basePath={basePath}
            page={params.page}
            total={total}
            params={params}
          />
        </>
      )}

      <FieldExplorerDiscoveryStrip activeTab="opportunities" />
    </div>
  );
}
