"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import {
  fieldOpportunitiesHref,
  fieldVerifyHref,
  type FieldExplorerTabId,
} from "@/lib/field-nav";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { fieldSignature } from "@/styles/field-signature";

const NAV_TABS: FieldExplorerTabId[] = ["records", "creatives", "organisations"];

const TAB_LABEL: Record<FieldExplorerTabId, "field.explorer.tab.records" | "field.explorer.tab.creatives" | "field.explorer.tab.organisations" | "field.explorer.tab.opportunities"> = {
  records: "field.explorer.tab.records",
  creatives: "field.explorer.tab.creatives",
  organisations: "field.explorer.tab.organisations",
  opportunities: "field.explorer.tab.opportunities",
};

export function FieldSignatureArchiveNav() {
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();
  const { activeCluster } = useFieldIntelligence();

  const items = [
    ...NAV_TABS.map((tab) => ({
      key: tab,
      href: fieldExplorerTabHref(tab, searchParams),
      label: t(TAB_LABEL[tab]),
    })),
    {
      key: "opportunities",
      href: fieldOpportunitiesHref(),
      label: t("field.explorer.tab.opportunities"),
    },
    {
      key: "verify",
      href: fieldVerifyHref(),
      label: t("field.explorer.link.verifyHub"),
    },
  ];

  return (
    <nav
      className={fieldSignature.surfaces.archiveNav}
      aria-label={t("field.signature.archive.navAria")}
    >
      <ul className="field-signature-archive-nav__list">
        {items.map((item, index) => (
          <li key={item.key} className="field-signature-archive-nav__item">
            {index > 0 ? (
              <span className="field-signature-archive-nav__sep" aria-hidden>
                /
              </span>
            ) : null}
            <Link
              href={item.href}
              className={`${fieldSignature.type.archiveNavLink}${activeCluster === item.key ? " field-signature-archive-nav__link--intel" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
