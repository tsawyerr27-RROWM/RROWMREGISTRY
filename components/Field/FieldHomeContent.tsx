"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  fieldExplorerCreativesHref,
  fieldExplorerOrganisationsHref,
  fieldExplorerRecordsHref,
  fieldVerifyHref,
} from "@/lib/field-nav";
import { narrativeLayout } from "@/styles/narrative-layout";

const gutter = narrativeLayout.gutter;

export function FieldHomeContent() {
  const { t } = useLocalePreferences();

  return (
    <div className={`${gutter} pb-20 pt-8 md:pb-28 md:pt-12`}>
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          {t("ecosystem.surface.field")}
        </p>
        <h1 className="mt-4 font-serif text-[2.125rem] font-normal leading-[1.06] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
          {t("field.home.title")}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600">
          {t("field.home.lede")}
        </p>
      </header>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:mt-20 lg:gap-10">
        <section className="rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/60 p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
            {t("field.home.explorerHeading")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {t("field.home.explorerBody")}
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm font-medium">
            <li>
              <Link
                href={fieldExplorerCreativesHref()}
                className="text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
              >
                {t("field.explorer.tab.creatives")}
              </Link>
            </li>
            <li>
              <Link
                href={fieldExplorerOrganisationsHref()}
                className="text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
              >
                {t("field.explorer.tab.organisations")}
              </Link>
            </li>
            <li>
              <Link
                href={fieldExplorerRecordsHref()}
                className="text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
              >
                {t("field.explorer.tab.records")}
              </Link>
            </li>
          </ul>
        </section>

        <section className="rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/60 p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
            {t("field.home.verifyHeading")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {t("field.home.verifyBody")}
          </p>
          <Link
            href={fieldVerifyHref()}
            className="mt-6 inline-flex text-sm font-medium text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
          >
            {t("field.home.verifyLink")}
          </Link>
        </section>
      </div>

      <p className="mt-16 max-w-3xl text-sm leading-relaxed text-neutral-500">
        {t("field.home.registryNote")}
      </p>
    </div>
  );
}
