"use client";

import Link from "next/link";

import { OrganisationExplorerFilters } from "@/components/Field/OrganisationExplorerFilters";
import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { OrganisationExplorerPagination } from "@/components/Field/OrganisationExplorerPagination";
import { OrganisationPresenceCard } from "@/components/Field/OrganisationPresenceCard";
import type { OrganisationExplorerRow } from "@/lib/fetch-organisation-explorer-list";
import type {
  OrganisationExplorerRepresentedFilter,
  OrganisationExplorerSort,
  OrganisationExplorerVerifiedFilter,
} from "@/lib/field-organisation-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

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
        <div className="mt-14 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm md:px-12">
          <p className="text-sm leading-relaxed text-neutral-600">
            {hasActiveFilters
              ? t("field.explorer.organisations.empty.filtered")
              : t("field.explorer.organisations.empty.none")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {hasActiveFilters ? (
              <>
                <Link
                  href={basePath}
                  className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  {t("field.explorer.organisations.empty.clearFilters")}
                </Link>
                <Link
                  href={basePath}
                  className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  {t("field.explorer.organisations.empty.browseAll")}
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
