"use client";

import Link from "next/link";

import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  fieldExplorerCreativesHref,
  fieldExplorerHref,
  fieldExplorerOrganisationsHref,
  fieldExplorerRecordsHref,
  fieldOpportunitiesHref,
  fieldVerifyHref,
} from "@/lib/field-nav";
import { fieldV2 } from "@/styles/field-v2";

export function FieldHomeContent() {
  const { t } = useLocalePreferences();

  const portals = [
    {
      href: fieldExplorerRecordsHref(),
      label: t("field.explorer.tab.records"),
      body: t("field.explorer.records.orientation"),
      signal: "registration" as const,
    },
    {
      href: fieldExplorerCreativesHref(),
      label: t("field.explorer.tab.creatives"),
      body: t("field.explorer.creatives.orientation"),
      signal: "valuation" as const,
    },
    {
      href: fieldExplorerOrganisationsHref(),
      label: t("field.explorer.tab.organisations"),
      body: t("field.explorer.organisations.orientation"),
      signal: "transfer" as const,
    },
    {
      href: fieldOpportunitiesHref(),
      label: t("field.explorer.tab.opportunities"),
      body: t("field.opportunities.orientation"),
      signal: "sale" as const,
    },
  ];

  return (
    <FieldV2Container className="pt-4 md:pt-6">
      <header className={`relative ${fieldV2.surface.filingMajor} p-8 lg:p-12 xl:p-14`}>
        <p className={fieldV2.type.metaLabel}>{t("nav.fieldCommand")}</p>
        <h1 className={`${fieldV2.type.recordTitle} mt-4 max-w-3xl`}>
          {t("field.home.title")}
        </h1>
        <p className={`${fieldV2.type.metaValue} mt-6 max-w-2xl text-base`}>
          {t("field.home.lede")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={fieldExplorerHref()}
            className="v2-cta-primary inline-flex !min-h-0 px-5 py-2.5 text-xs"
          >
            {t("field.explorer.hub.title")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="v2-cta-secondary inline-flex !min-h-0 px-5 py-2.5 text-xs"
          >
            {t("field.home.verifyLink")}
          </Link>
        </div>
      </header>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {portals.map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className={`${fieldV2.surface.indexCard} group block p-7 md:p-8 ${fieldV2.motion.hover}`}
          >
            <p className={fieldV2.type.metaLabel}>{portal.label}</p>
            <p
              className={`${fieldV2.type.sectionTitle} mt-3 text-xl md:text-2xl`}
            >
              {portal.label}
            </p>
            <p className={`${fieldV2.type.metaValue} mt-3`}>{portal.body}</p>
          </Link>
        ))}
      </div>

      <p className={`${fieldV2.type.metaValue} mt-14 max-w-2xl text-sm`}>
        {t("field.home.registryNote")}
      </p>
    </FieldV2Container>
  );
}
