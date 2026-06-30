"use client";

import Link from "next/link";

import { OrganisationExplorerFilters } from "@/components/Field/OrganisationExplorerFilters";
import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldExplorerResultsToolbar } from "@/components/Field/FieldExplorerResultsToolbar";
import { FieldV2EmptyState } from "@/components/Field/FieldV2EmptyState";
import { OrganisationExplorerPagination } from "@/components/Field/OrganisationExplorerPagination";
import { OrganisationPresenceCard } from "@/components/Field/OrganisationPresenceCard";
import { useFieldExplorerDensity } from "@/hooks/useFieldExplorerDensity";
import type { OrganisationExplorerRow } from "@/lib/fetch-organisation-explorer-list";
import type {
  OrganisationExplorerRepresentedFilter,
  OrganisationExplorerSort,
  OrganisationExplorerVerifiedFilter,
} from "@/lib/field-organisation-explorer-params";
import { fieldExplorerDensityGridClass } from "@/lib/field-explorer-density";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  basePath: string;
  rows: OrganisationExplorerRow[];
  total: number;
  q: string;
  sort: OrganisationExplorerSort;
  page: number;
  location: string;
  verified: OrganisationExplorerVerifiedFilter;
  represented: OrganisationExplorerRepresentedFilter;
  formKey: string;
};

export function OrganisationExplorerContent({
  basePath,
  rows,
  total,
  q,
  sort,
  page,
  location,
  verified,
  represented,
  formKey,
}: Props) {
  const { t } = useLocalePreferences();
  const { density, setDensity } = useFieldExplorerDensity("organisations");
  const hasActiveFilters =
    Boolean(q.trim()) ||
    Boolean(location.trim()) ||
    verified === "verified" ||
    represented === "represented";

  return (
    <div className="mt-10">
      <OrganisationExplorerFilters
        action={basePath}
        q={q}
        sort={sort}
        location={location}
        verified={verified}
        represented={represented}
        formKey={formKey}
      />

      {total === 0 ? (
        <FieldV2EmptyState
          message={
            hasActiveFilters
              ? t("field.explorer.organisations.empty.filtered")
              : t("field.explorer.organisations.empty.none")
          }
          actions={
            hasActiveFilters ? (
              <>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.explorer.organisations.empty.clearFilters")}
                </Link>
                <Link href={basePath} className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs">
                  {t("field.explorer.organisations.empty.browseAll")}
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
                {total} {total === 1 ? "Organisation" : "Organisations"}
              </p>
            }
          />
          <div
            className={fieldExplorerDensityGridClass(density, "organisations")}
            data-density={density}
          >
            {rows.map((row) => (
              <OrganisationPresenceCard key={row.id} row={row} />
            ))}
          </div>

          <OrganisationExplorerPagination
            basePath={basePath}
            page={page}
            total={total}
            q={q}
            sort={sort}
            location={location}
            verified={verified}
            represented={represented}
          />
        </>
      )}

      <FieldExplorerDiscoveryStrip activeTab="organisations" />
    </div>
  );
}
