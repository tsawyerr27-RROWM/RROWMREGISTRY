"use client";

import Link from "next/link";

import { FieldPageHero } from "@/components/Field/FieldPageHero";
import { FieldExplorerInfoTooltip } from "@/components/Field/FieldExplorerInfoTooltip";
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
    { href: fieldExplorerRecordsHref(), label: t("field.explorer.tab.records") },
    { href: fieldExplorerCreativesHref(), label: t("field.explorer.tab.creatives") },
    {
      href: fieldExplorerOrganisationsHref(),
      label: t("field.explorer.tab.organisations"),
    },
    { href: fieldOpportunitiesHref(), label: t("field.explorer.tab.opportunities") },
  ];

  return (
    <FieldV2Container className="pt-2 md:pt-3">
      <FieldPageHero
        title={t("field.home.title")}
        infoTooltip={
          <FieldExplorerInfoTooltip
            text={
              <>
                <span className="block">{t("field.home.lede")}</span>
                <span className="mt-2 block">{t("field.home.registryNote")}</span>
              </>
            }
          />
        }
        actions={
          <>
            <Link
              href={fieldExplorerHref()}
              className="v2-cta-primary inline-flex min-h-[44px] items-center px-4 py-2.5 text-xs"
            >
              {t("field.explorer.hub.title")}
            </Link>
            <Link
              href={fieldVerifyHref()}
              className="v2-cta-secondary inline-flex min-h-[44px] items-center px-4 py-2.5 text-xs"
            >
              {t("field.home.verifyLink")}
            </Link>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {portals.map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className={`${fieldV2.surface.indexCard} group flex min-h-[56px] items-center p-4 md:p-5 ${fieldV2.motion.hover}`}
          >
            <p className={`${fieldV2.type.sectionTitle} text-lg md:text-xl`}>
              {portal.label}
            </p>
          </Link>
        ))}
      </div>
    </FieldV2Container>
  );
}
