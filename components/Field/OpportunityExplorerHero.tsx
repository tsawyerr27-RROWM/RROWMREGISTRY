"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldOpportunitiesHref, fieldVerifyHref } from "@/lib/field-nav";

type Props = {
  searchQuery: string;
  total: number;
  sector: string;
  practice: string;
  briefType: string;
  window: string;
};

export function OpportunityExplorerHero({
  searchQuery,
  total,
  sector,
  practice,
  briefType,
  window,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQ) ||
    Boolean(sector) ||
    Boolean(practice) ||
    Boolean(briefType) ||
    window !== "all";

  return (
    <section className="relative mt-2 overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.05] bg-gradient-to-br from-[#f8faf9] via-white to-emerald-50/35 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-emerald-400/12 blur-[90px]"
        aria-hidden
      />
      <div className="relative max-w-3xl p-8 lg:p-12 xl:p-14">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          {t("field.explorer.subNavLabel")}
        </p>
        <h1 className="mt-3 font-serif text-[2.125rem] font-normal leading-[1.06] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
          {t("field.opportunities.headline")}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600">
          {t("field.opportunities.lede")}
        </p>
        {total > 0 || hasFilters || trimmedQ ? (
          <p className="mt-8 text-[12px] text-neutral-500">
            {total > 0 ? (
              <>
                {total}{" "}
                {total === 1
                  ? t("field.opportunities.countSingular")
                  : t("field.opportunities.countPlural")}
              </>
            ) : null}
            {trimmedQ ? (
              <>
                {total > 0 ? " · " : null}
                {t("field.opportunities.searching")} “{trimmedQ}”
              </>
            ) : null}
            {hasFilters ? ` · ${t("field.opportunities.filtered")}` : null}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={fieldOpportunitiesHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.opportunities.browseAll")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.explorer.link.verifyHub")}
          </Link>
        </div>
      </div>
    </section>
  );
}
