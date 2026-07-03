"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { FieldExplorerSubNavFallback } from "@/components/Field/FieldExplorerSuspenseFallbacks";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerTabHref } from "@/lib/field-search-contract";
import { FIELD_EXPLORER_TABS, fieldExplorerTabFromPath } from "@/lib/field-nav";
import { fieldV2 } from "@/styles/field-v2";

function FieldExplorerSubNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();
  const activeTab = fieldExplorerTabFromPath(pathname);

  if (!activeTab) {
    return null;
  }

  return (
    <nav
      aria-label={t("field.explorer.subNavLabel")}
      className="field-v2-subnav border-b border-[var(--v2-border)] bg-[var(--v2-white)]/88 backdrop-blur-md"
    >
      <div className={`${fieldV2.container} !pb-0 !pt-0`}>
        <div className="flex flex-wrap gap-x-1 gap-y-0 sm:flex-nowrap sm:overflow-x-auto sm:gap-0">
          {FIELD_EXPLORER_TABS.map((tab) => {
            const active = activeTab === tab.id;
            const href = fieldExplorerTabHref(tab.id, searchParams);
            return (
              <Link
                key={tab.id}
                href={href}
                className={`field-v2-subnav__tab inline-flex min-h-[44px] shrink-0 items-center px-4 py-3 md:min-h-0 md:px-5 md:py-4 ${
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

export function FieldExplorerSubNav() {
  return (
    <Suspense fallback={<FieldExplorerSubNavFallback />}>
      <FieldExplorerSubNavInner />
    </Suspense>
  );
}
