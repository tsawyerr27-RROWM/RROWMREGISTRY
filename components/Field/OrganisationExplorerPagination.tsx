"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  FIELD_PROFILE_PAGE_SIZE,
  organisationExplorerQueryString,
  type OrganisationExplorerRepresentedFilter,
  type OrganisationExplorerSort,
  type OrganisationExplorerVerifiedFilter,
} from "@/lib/field-organisation-explorer-params";
import { fillMessage } from "@/lib/locale-messages";

type Props = {
  basePath: string;
  page: number;
  total: number;
  q: string;
  sort: OrganisationExplorerSort;
  location: string;
  verified: OrganisationExplorerVerifiedFilter;
  represented: OrganisationExplorerRepresentedFilter;
};

export function OrganisationExplorerPagination({
  basePath,
  page,
  total,
  q,
  sort,
  location,
  verified,
  represented,
}: Props) {
  const { t } = useLocalePreferences();
  const totalPages = Math.max(1, Math.ceil(total / FIELD_PROFILE_PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * FIELD_PROFILE_PAGE_SIZE + 1;
  const end = Math.min(page * FIELD_PROFILE_PAGE_SIZE, total);

  function hrefForPage(p: number) {
    const qs = organisationExplorerQueryString({
      q,
      sort,
      page: p,
      location,
      verified,
      represented,
    });
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (total === 0) return null;

  return (
    <div className="mt-14 flex flex-col items-center gap-5 border-t border-neutral-900/[0.05] pt-12 sm:flex-row sm:justify-between">
      <p className="text-sm text-neutral-600">
        {fillMessage(t("registry.pagination.showing"), { start, end, total })}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={hrefForPage(page - 1)}
          aria-disabled={!hasPrev}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            hasPrev
              ? "rounded-xl border border-neutral-900/[0.08] bg-white/85 text-neutral-900 shadow-sm hover:border-neutral-900/12 hover:bg-white"
              : "pointer-events-none cursor-not-allowed rounded-xl border border-transparent bg-neutral-100/80 text-neutral-400"
          }`}
        >
          {t("registry.pagination.previous")}
        </Link>
        <span className="px-2 text-sm tabular-nums text-neutral-500">
          {fillMessage(t("registry.pagination.pageOf"), { page, totalPages })}
        </span>
        <Link
          href={hrefForPage(page + 1)}
          aria-disabled={!hasNext}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            hasNext
              ? "rounded-xl border border-neutral-900/[0.08] bg-white/85 text-neutral-900 shadow-sm hover:border-neutral-900/12 hover:bg-white"
              : "pointer-events-none cursor-not-allowed rounded-xl border border-transparent bg-neutral-100/80 text-neutral-400"
          }`}
        >
          {t("registry.pagination.next")}
        </Link>
      </div>
    </div>
  );
}
