"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FieldExplorerDiscoveryStripFallback } from "@/components/Field/FieldExplorerSuspenseFallbacks";

import { FieldExplorerInfoTooltip } from "@/components/Field/FieldExplorerInfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import {
  FIELD_ROOT,
  fieldOpportunitiesHref,
  fieldVerifyHref,
  type FieldExplorerTabId,
} from "@/lib/field-nav";

type Props = {
  activeTab: FieldExplorerTabId | "hub" | "opportunities";
};

const EXPLORER_TABS: FieldExplorerTabId[] = ["records", "creatives", "organisations"];

function FieldExplorerDiscoveryStripInner({ activeTab }: Props) {
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();

  return (
    <section className="mt-8 rounded-[1rem] border border-neutral-900/[0.06] bg-white/70 p-4 shadow-sm md:mt-10 md:p-5">
      <div className="flex items-start gap-2">
        <h2 className="min-w-0 flex-1 font-serif text-lg font-normal tracking-tight text-neutral-950 md:text-xl">
          {t("field.explorer.wayfinding.heading")}
        </h2>
        <FieldExplorerInfoTooltip text={t("field.explorer.wayfinding.lede")} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {activeTab !== "hub" ? (
          <Link
            href={FIELD_ROOT}
            className="inline-flex min-h-[44px] items-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.explorer.wayfinding.hub")}
          </Link>
        ) : null}
        {EXPLORER_TABS.map((tab) => {
          if (tab === activeTab) return null;
          return (
            <Link
              key={tab}
              href={fieldExplorerTabHref(tab, searchParams)}
              className="inline-flex min-h-[44px] items-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t(
                tab === "records"
                  ? "field.explorer.tab.records"
                  : tab === "creatives"
                    ? "field.explorer.tab.creatives"
                    : "field.explorer.tab.organisations"
              )}
            </Link>
          );
        })}
        {activeTab !== "opportunities" ? (
          <Link
            href={fieldOpportunitiesHref()}
            className="inline-flex min-h-[44px] items-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.explorer.tab.opportunities")}
          </Link>
        ) : null}
        <Link
          href={fieldVerifyHref()}
          className="inline-flex min-h-[44px] items-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.explorer.link.verifyHub")}
        </Link>
      </div>
    </section>
  );
}

export function FieldExplorerDiscoveryStrip(props: Props) {
  return (
    <Suspense fallback={<FieldExplorerDiscoveryStripFallback />}>
      <FieldExplorerDiscoveryStripInner {...props} />
    </Suspense>
  );
}
