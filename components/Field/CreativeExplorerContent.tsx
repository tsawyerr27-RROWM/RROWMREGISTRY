"use client";

import Link from "next/link";

import { CreativeExplorerFilters } from "@/components/Field/CreativeExplorerFilters";
import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { CreativePresenceCard } from "@/components/Field/CreativePresenceCard";
import { FieldExplorerPagination } from "@/components/Field/FieldExplorerPagination";
import type { CreativeExplorerRow } from "@/lib/fetch-creative-explorer-list";
import type {
  CreativeExplorerSort,
  CreativeExplorerVerifiedFilter,
} from "@/lib/field-creative-explorer-params";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

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
  const hasActiveFilters =
    Boolean(q.trim()) || Boolean(practice) || verified === "verified";

  return (
    <div className="mt-10">
      <CreativeExplorerFilters
        action={basePath}
        q={q}
        sort={sort}
        practice={practice}
        verified={verified}
        formKey={formKey}
      />

      {total === 0 ? (
        <div className="mt-14 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm md:px-12">
          <p className="text-sm leading-relaxed text-neutral-600">
            {hasActiveFilters
              ? t("field.explorer.creatives.empty.filtered")
              : t("field.explorer.creatives.empty.none")}
          </p>
          {hasActiveFilters ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={basePath}
                className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                {t("field.explorer.creatives.empty.clearFilters")}
              </Link>
              <Link
                href={basePath}
                className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                {t("field.explorer.creatives.empty.browseAll")}
              </Link>
            </div>
          ) : (
            <Link
              href="/get-started"
              className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("nav.takePart")}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
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
