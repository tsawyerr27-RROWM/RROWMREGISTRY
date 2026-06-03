import type { WorkspaceNavItem } from "@/components/Studio/WorkspaceShell";
import { PERSONAL_ARCHIVE_NAV_ID } from "@/lib/personal-archive";

import type { StudioNavTranslate } from "@/lib/studio-nav/types";

export const PERSONAL_ARCHIVE_NAV_ITEM = {
  id: PERSONAL_ARCHIVE_NAV_ID,
  labelKey: "archive.nav.personalArchive" as const,
  href: "/personal-archive",
};

/** Appends Personal Archive link nav item (route, not in-page section). */
export function appendPersonalArchiveNavItem(
  items: WorkspaceNavItem[],
  t: StudioNavTranslate
): WorkspaceNavItem[] {
  return [
    ...items,
    {
      id: PERSONAL_ARCHIVE_NAV_ID,
      label: t(PERSONAL_ARCHIVE_NAV_ITEM.labelKey),
      href: PERSONAL_ARCHIVE_NAV_ITEM.href,
    },
  ];
}
