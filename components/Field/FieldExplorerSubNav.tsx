"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import {
  FIELD_EXPLORER,
  FIELD_EXPLORER_TABS,
  fieldExplorerTabFromPath,
  isFieldSubnavPath,
} from "@/lib/field-nav";
import { fieldV2 } from "@/styles/field-v2";

export function FieldExplorerSubNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();
  const activeTab = fieldExplorerTabFromPath(pathname);

  if (!activeTab && pathname !== FIELD_EXPLORER && !isFieldSubnavPath(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label={t("field.explorer.subNavLabel")}
      className="field-v2-subnav border-b border-[var(--v2-border)] bg-[var(--v2-white)]/88 backdrop-blur-md"
    >
      <div className={`${fieldV2.container} !pb-0 !pt-0`}>
        <div className="flex gap-0 overflow-x-auto">
          {FIELD_EXPLORER_TABS.map((tab) => {
            const active = activeTab === tab.id;
            const href = fieldExplorerTabHref(tab.id, searchParams);
            return (
              <Link
                key={tab.id}
                href={href}
                className={`field-v2-subnav__tab shrink-0 px-4 py-3.5 md:px-5 md:py-4 ${
                  active ? "field-v2-subnav__tab--active" : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                {t(tab.labelKey)}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
