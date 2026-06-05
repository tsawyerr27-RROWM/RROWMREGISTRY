"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import {
  FIELD_EXPLORER,
  fieldVerifyHref,
  type FieldExplorerTabId,
} from "@/lib/field-nav";

type Props = {
  activeTab: FieldExplorerTabId | "hub";
};

const EXPLORER_TABS: FieldExplorerTabId[] = ["records", "creatives", "organisations"];

export function FieldExplorerDiscoveryStrip({ activeTab }: Props) {
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();

  return (
    <section className="mt-16 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-6 shadow-sm md:mt-20 md:p-8">
      <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
        {t("field.explorer.wayfinding.heading")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
        {t("field.explorer.wayfinding.lede")}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {activeTab !== "hub" ? (
          <Link
            href={FIELD_EXPLORER}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
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
              className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
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
        <Link
          href={fieldVerifyHref()}
          className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.explorer.link.verifyHub")}
        </Link>
      </div>
    </section>
  );
}
