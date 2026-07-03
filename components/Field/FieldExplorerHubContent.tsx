"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldExplorerHubContentFallback } from "@/components/Field/FieldExplorerSuspenseFallbacks";
import { FieldExplorerHubSearch } from "@/components/Field/FieldExplorerHubSearch";
import { FieldPageHero } from "@/components/Field/FieldPageHero";
import { FieldExplorerInfoTooltip } from "@/components/Field/FieldExplorerInfoTooltip";
import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import { fieldOpportunitiesHref, fieldVerifyHref } from "@/lib/field-nav";
import { fieldV2 } from "@/styles/field-v2";

function FieldExplorerHubContentInner() {
  const { t } = useLocalePreferences();
  const searchParams = useSearchParams();

  const cards = [
    {
      href: fieldExplorerTabHref("records", searchParams),
      title: t("field.explorer.records.headline"),
    },
    {
      href: fieldExplorerTabHref("creatives", searchParams),
      title: t("field.explorer.creatives.headline"),
    },
    {
      href: fieldExplorerTabHref("organisations", searchParams),
      title: t("field.explorer.organisations.headline"),
    },
    {
      href: fieldOpportunitiesHref(),
      title: t("field.opportunities.headline"),
    },
  ];

  return (
    <FieldV2Container className="pt-2 md:pt-3">
      <FieldPageHero
        title={t("field.explorer.hub.title")}
        infoTooltip={
          <FieldExplorerInfoTooltip
            text={
              <>
                <span className="block">{t("field.explorer.hub.lede")}</span>
                <span className="mt-2 block">{t("field.explorer.hub.searchHint")}</span>
              </>
            }
          />
        }
        actions={
          <Link
            href={fieldVerifyHref()}
            className="v2-cta-secondary inline-flex min-h-[44px] items-center px-4 py-2.5 text-xs"
          >
            {t("field.explorer.link.verifyHub")}
          </Link>
        }
      >
        <div className="mt-4 max-w-xl">
          <FieldExplorerHubSearch />
        </div>
      </FieldPageHero>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${fieldV2.surface.indexCard} group flex min-h-[56px] items-center p-4 md:p-5 ${fieldV2.motion.hover}`}
          >
            <p className={`${fieldV2.type.sectionTitle} text-base leading-snug md:text-lg`}>
              {card.title}
            </p>
          </Link>
        ))}
      </div>

      <FieldExplorerDiscoveryStrip activeTab="hub" />
    </FieldV2Container>
  );
}

export function FieldExplorerHubContent() {
  return (
    <Suspense fallback={<FieldExplorerHubContentFallback />}>
      <FieldExplorerHubContentInner />
    </Suspense>
  );
}
