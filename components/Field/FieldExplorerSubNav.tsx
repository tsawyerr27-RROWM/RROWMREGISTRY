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
      className="border-b border-neutral-900/[0.06] bg-white/40 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-[min(100%,88rem)] gap-1 overflow-x-auto px-6 md:gap-2 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]">
        {FIELD_EXPLORER_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const href = fieldExplorerTabHref(tab.id, searchParams);
          return (
            <Link
              key={tab.id}
              href={href}
              className={`relative shrink-0 px-3 py-3.5 text-sm font-medium transition-colors md:px-4 md:py-4 ${
                active
                  ? "text-neutral-950 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-neutral-900 md:after:inset-x-4"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
