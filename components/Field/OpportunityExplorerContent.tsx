"use client";

import Link from "next/link";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { OpportunityExplorerCard } from "@/components/Field/OpportunityExplorerCard";
import { OpportunityExplorerFilters } from "@/components/Field/OpportunityExplorerFilters";
import { OpportunityExplorerPagination } from "@/components/Field/OpportunityExplorerPagination";
import type { FieldOpportunityCard } from "@/lib/fetch-field-opportunities-list";
import type { FieldOpportunityListParams } from "@/lib/field-opportunity-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

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
  const hasActiveFilters =
    Boolean(params.q.trim()) ||
    Boolean(params.sector) ||
    Boolean(params.practice) ||
    Boolean(params.briefType) ||
    params.window !== "all";

  return (
    <div className="mt-10">
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
        <div className="mt-14 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm md:px-12">
          <p className="text-sm leading-relaxed text-neutral-600">
            {hasActiveFilters
              ? t("field.opportunities.empty.filtered")
              : t("field.opportunities.empty.none")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {hasActiveFilters ? (
              <>
                <Link
                  href={basePath}
                  className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  {t("field.opportunities.empty.clearFilters")}
                </Link>
                <Link
                  href={basePath}
                  className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  {t("field.opportunities.empty.browseAll")}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <OpportunityExplorerCard key={row.id} row={row} />
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
