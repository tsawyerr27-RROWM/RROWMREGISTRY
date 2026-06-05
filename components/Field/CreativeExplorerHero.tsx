"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  searchQuery: string;
  total: number;
  practice: string;
  verified: "all" | "verified";
};

export function CreativeExplorerHero({
  searchQuery,
  total,
  practice,
  verified,
}: Props) {
  const { t } = useLocalePreferences();
  const trimmedQ = searchQuery.trim();
  const hasFilters = Boolean(practice || verified === "verified");

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
          {t("field.explorer.creatives.headline")}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600">
          {t("field.explorer.creatives.lede")}
        </p>
        {total > 0 ? (
          <p className="mt-8 text-[12px] text-neutral-500">
            {total} {total === 1 ? "Creative" : "Creatives"}
            {trimmedQ ? (
              <>
                {" "}
                · {t("field.explorer.creatives.searching")} “{trimmedQ}”
              </>
            ) : null}
            {hasFilters ? ` · ${t("field.explorer.creatives.filtered")}` : null}
          </p>
        ) : null}
      </div>
    </section>
  );
}
