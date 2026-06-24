import type { WorkspaceNavItem } from "@/components/Studio/WorkspaceShell";

import type { StudioNavTranslate } from "@/lib/studio-nav/types";

export const STUDIO_DEALS_NAV_ID = "studio-deals";
export const STUDIO_INBOX_NAV_ID = "studio-inbox";
export const STUDIO_RIGHTS_NAV_ID = "studio-rights";

export const STUDIO_DEALS_HREF = "/studio/deals";
export const STUDIO_INBOX_HREF = "/studio/inbox";
export const STUDIO_RIGHTS_HREF = "/studio/rights";

export function studioDealsNavItem(t: StudioNavTranslate): WorkspaceNavItem {
  return {
    id: STUDIO_DEALS_NAV_ID,
    label: t("studio.nav.deals"),
    href: STUDIO_DEALS_HREF,
  };
}

export function studioInboxNavItem(t: StudioNavTranslate): WorkspaceNavItem {
  return {
    id: STUDIO_INBOX_NAV_ID,
    label: t("studio.nav.inbox"),
    href: STUDIO_INBOX_HREF,
  };
}

export function studioRightsNavItem(t: StudioNavTranslate): WorkspaceNavItem {
  return {
    id: STUDIO_RIGHTS_NAV_ID,
    label: t("studio.nav.rights"),
    href: STUDIO_RIGHTS_HREF,
  };
}

/** Creative: after Records, before Certificates. */
export function insertCreativeUtilityNavItems(
  items: WorkspaceNavItem[],
  t: StudioNavTranslate
): WorkspaceNavItem[] {
  const next = [...items];
  const recordsIdx = next.findIndex((item) => item.id === "Records");
  const insertAt = recordsIdx >= 0 ? recordsIdx + 1 : next.length;
  next.splice(insertAt, 0, studioDealsNavItem(t), studioRightsNavItem(t), studioInboxNavItem(t));
  return next;
}

/** Organisation: after Opportunities. */
export function appendOrganisationUtilityNavItems(
  items: WorkspaceNavItem[],
  t: StudioNavTranslate
): WorkspaceNavItem[] {
  return [...items, studioDealsNavItem(t), studioRightsNavItem(t), studioInboxNavItem(t)];
}

/** Collector: after Works, before Attention. */
export function insertCollectorUtilityNavItems(
  items: WorkspaceNavItem[],
  t: StudioNavTranslate
): WorkspaceNavItem[] {
  const next = [...items];
  const worksIdx = next.findIndex((item) => item.id === "works");
  const insertAt = worksIdx >= 0 ? worksIdx + 1 : next.length;
  next.splice(insertAt, 0, studioDealsNavItem(t), studioRightsNavItem(t), studioInboxNavItem(t));
  return next;
}
