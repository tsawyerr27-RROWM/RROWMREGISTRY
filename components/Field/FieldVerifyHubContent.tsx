"use client";

import Link from "next/link";

import { FieldVerifyLookupForm } from "@/components/Field/FieldVerifyLookupForm";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  fieldExplorerRecordsHref,
  fieldHomeHref,
} from "@/lib/field-nav";
import { narrativeLayout } from "@/styles/narrative-layout";

const gutter = narrativeLayout.gutter;

export function FieldVerifyHubContent() {
  const { t } = useLocalePreferences();

  const sections = [
    {
      title: t("field.verify.hub.section.verification.title"),
      body: t("field.verify.hub.section.verification.body"),
    },
    {
      title: t("field.verify.hub.section.provenance.title"),
      body: t("field.verify.hub.section.provenance.body"),
    },
    {
      title: t("field.verify.hub.section.registryRecord.title"),
      body: t("field.verify.hub.section.registryRecord.body"),
    },
    {
      title: t("field.verify.hub.section.howVerification.title"),
      body: t("field.verify.hub.section.howVerification.body"),
    },
    {
      title: t("field.verify.hub.section.certificates.title"),
      body: t("field.verify.hub.section.certificates.body"),
    },
  ] as const;

  return (
    <div className={`${gutter} pb-20 pt-8 md:pb-28 md:pt-12`}>
      <header className="max-w-3xl">
        <h1 className="font-serif text-[2.125rem] font-normal leading-[1.06] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
          {t("field.verify.hub.title")}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600">
          {t("field.verify.hub.lede")}
        </p>
      </header>

      <section className="mt-12 max-w-2xl rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-8 shadow-sm md:p-10">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
          {t("field.verify.hub.lookupHeading")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {t("field.verify.hub.lookupIntro")}
        </p>
        <FieldVerifyLookupForm />
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
          {t("field.verify.hub.hierarchyTitle")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          {t("field.verify.hub.hierarchyIntro")}
        </p>
        <ol className="mt-8 space-y-6">
          <li className="rounded-xl border border-neutral-900/[0.06] bg-white/50 px-5 py-4">
            <h3 className="font-serif text-base font-normal text-neutral-900">
              {t("field.verify.hub.tier1.label")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {t("field.verify.hub.tier1.body")}
            </p>
          </li>
          <li className="rounded-xl border border-neutral-900/[0.06] bg-white/50 px-5 py-4">
            <h3 className="font-serif text-base font-normal text-neutral-900">
              {t("field.verify.hub.tier2.label")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {t("field.verify.hub.tier2.body")}
            </p>
          </li>
          <li className="rounded-xl border border-neutral-900/[0.06] bg-white/50 px-5 py-4">
            <h3 className="font-serif text-base font-normal text-neutral-900">
              {t("field.verify.hub.tier3.label")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {t("field.verify.hub.tier3.body")}
            </p>
          </li>
        </ol>
      </section>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:max-w-5xl">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/55 p-7 shadow-sm"
          >
            <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              {section.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href={fieldExplorerRecordsHref()}
          className="text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
        >
          {t("field.verify.hub.linkRecords")}
        </Link>
        <Link
          href={fieldHomeHref()}
          className="text-neutral-600 underline decoration-neutral-300 underline-offset-[3px] hover:text-neutral-900"
        >
          {t("field.stub.backHome")}
        </Link>
      </div>
    </div>
  );
}
