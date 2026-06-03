"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";

type Props = {
  /** Base path, e.g. `/registry` */
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  q: string;
  sort: string;
  /** Artist page: preserve verification filter in query string */
  status?: string;
};

export function RegistryListPagination({
  basePath,
  page,
  pageSize,
  total,
  q,
  sort,
  status,
}: Props) {
  const { t } = useLocalePreferences();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (status && status !== "all") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (total === 0) {
    return null;
  }

  return (
    <div className="mt-14 flex flex-col items-center gap-5 pt-12 sm:flex-row sm:justify-between">
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
