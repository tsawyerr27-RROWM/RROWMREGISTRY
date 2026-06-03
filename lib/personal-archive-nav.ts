import type { MessageKey } from "@/lib/locale-messages";
import type { WorkspaceNavItem } from "@/components/Studio/WorkspaceShell";
import { PERSONAL_ARCHIVE_NAV_ID } from "@/lib/personal-archive";

type Translate = (key: MessageKey) => string;

/** Appends Personal Archive link nav item (route, not in-page section). */
export function appendPersonalArchiveNavItem(
  items: WorkspaceNavItem[],
  t: Translate
): WorkspaceNavItem[] {
  return [
    ...items,
    {
      id: PERSONAL_ARCHIVE_NAV_ID,
      label: t("archive.nav.personalArchive"),
      href: "/personal-archive",
    },
  ];
}
