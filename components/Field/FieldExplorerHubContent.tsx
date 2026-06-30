"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldExplorerHubSearch } from "@/components/Field/FieldExplorerHubSearch";
import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import { fieldOpportunitiesHref, fieldVerifyHref } from "@/lib/field-nav";
import { fieldV2 } from "@/styles/field-v2";

export function FieldExplorerHubContent() {
  const { t } = useLocalePreferences();
  const searchParams = useSearchParams();

  const cards = [
    {
      href: fieldExplorerTabHref("records", searchParams),
      label: t("field.explorer.tab.records"),
      title: t("field.explorer.records.headline"),
      body: t("field.explorer.records.orientation"),
    },
    {
      href: fieldExplorerTabHref("creatives", searchParams),
      label: t("field.explorer.tab.creatives"),
      title: t("field.explorer.creatives.headline"),
      body: t("field.explorer.creatives.orientation"),
    },
    {
      href: fieldExplorerTabHref("organisations", searchParams),
      label: t("field.explorer.tab.organisations"),
      title: t("field.explorer.organisations.headline"),
      body: t("field.explorer.organisations.orientation"),
    },
    {
      href: fieldOpportunitiesHref(),
      label: t("field.explorer.tab.opportunities"),
      title: t("field.opportunities.headline"),
      body: t("field.opportunities.orientation"),
    },
  ];

  return (
    <FieldV2Container className="pt-4 md:pt-6">
      <header className={`relative ${fieldV2.surface.filingMajor} p-8 lg:p-12 xl:p-14`}>
        <p className={fieldV2.type.metaLabel}>{t("field.explorer.hub.searchLabel")}</p>
        <h1 className={`${fieldV2.type.recordTitle} mt-4 max-w-3xl`}>
          {t("field.explorer.hub.title")}
        </h1>
        <p className={`${fieldV2.type.metaValue} mt-6 max-w-2xl text-base`}>
          {t("field.explorer.hub.lede")}
        </p>
        <div className="mt-8 max-w-xl">
          <FieldExplorerHubSearch />
        </div>
        <div className="mt-6">
          <Link
            href={fieldVerifyHref()}
            className="v2-cta-secondary inline-flex !min-h-0 px-5 py-2.5 text-xs"
          >
            {t("field.explorer.link.verifyHub")}
          </Link>
        </div>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${fieldV2.surface.indexCard} group block p-6 md:p-7 ${fieldV2.motion.hover}`}
          >
            <p className={fieldV2.type.metaLabel}>{card.label}</p>
            <p className={`${fieldV2.type.sectionTitle} mt-3 text-lg leading-snug`}>
              {card.title}
            </p>
            <p className={`${fieldV2.type.metaValue} mt-3 text-sm`}>{card.body}</p>
          </Link>
        ))}
      </div>

      <FieldExplorerDiscoveryStrip activeTab="hub" />
    </FieldV2Container>
  );
}
