"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  fieldExplorerCreativesHref,
  fieldExplorerOrganisationsHref,
  fieldExplorerRecordsHref,
} from "@/lib/field-nav";
import { narrativeLayout } from "@/styles/narrative-layout";

const gutter = narrativeLayout.gutter;

export function FieldExplorerHubContent() {
  const { t } = useLocalePreferences();

  return (
    <div className={`${gutter} pb-20 pt-4 md:pb-28`}>
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          {t("field.explorer.subNavLabel")}
        </p>
        <h1 className="mt-4 font-serif text-[2.125rem] font-normal leading-[1.06] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
          {t("field.explorer.hub.title")}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600">
          {t("field.explorer.hub.lede")}
        </p>
      </header>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <Link
          href={fieldExplorerCreativesHref()}
          className="group rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-8 shadow-sm transition hover:border-neutral-900/10 hover:bg-white hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            {t("field.explorer.tab.creatives")}
          </p>
          <p className="mt-3 font-serif text-2xl text-neutral-950 transition group-hover:text-neutral-700">
            {t("field.explorer.creatives.headline")}
          </p>
        </Link>

        <Link
          href={fieldExplorerOrganisationsHref()}
          className="group rounded-[1.25rem] border border-emerald-900/10 bg-emerald-50/30 p-8 shadow-sm transition hover:border-emerald-900/15 hover:bg-emerald-50/50 hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-900/70">
            {t("field.explorer.tab.organisations")}
          </p>
          <p className="mt-3 font-serif text-2xl text-neutral-950 transition group-hover:text-neutral-700">
            {t("field.explorer.organisations.headline")}
          </p>
        </Link>

        <Link
          href={fieldExplorerRecordsHref()}
          className="group rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-8 shadow-sm transition hover:border-neutral-900/10 hover:bg-white hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            {t("field.explorer.tab.records")}
          </p>
          <p className="mt-3 font-serif text-2xl text-neutral-950 transition group-hover:text-neutral-700">
            {t("field.explorer.hub.recordsCard")}
          </p>
        </Link>
      </div>
    </div>
  );
}
