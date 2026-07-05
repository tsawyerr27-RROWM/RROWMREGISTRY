import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { WorkspaceNavItem } from "@/components/Studio/WorkspaceShell";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import { COLLECTOR_SECTION_LABEL_KEYS } from "@/lib/studio-nav/labels";
import { appendPersonalArchiveNavItem } from "@/lib/studio-nav/personal-archive";
import { insertCollectorUtilityNavItems } from "@/lib/studio-nav/studio-utility-nav";
import type { StudioNavTranslate } from "@/lib/studio-nav/types";

export const COLLECTOR_NAV_SECTIONS = [
  "workspace",
  "works",
  "attention",
] as const;

export type CollectorSectionId = (typeof COLLECTOR_NAV_SECTIONS)[number];

/** @deprecated Use COLLECTOR_NAV_SECTIONS */
export const COLLECTOR_SECTION_IDS = COLLECTOR_NAV_SECTIONS;

const COLLECTOR_SECTION_STORAGE_KEY = "rrowm:collectorStudioSection:v1";

export function isCollectorSectionId(id: string): id is CollectorSectionId {
  return (COLLECTOR_NAV_SECTIONS as readonly string[]).includes(id);
}

export type CollectorNavFlags = {
  attentionItemCount?: number;
};

export function buildCollectorNavItems(
  t: StudioNavTranslate,
  flags: CollectorNavFlags = {}
): WorkspaceNavItem[] {
  const { attentionItemCount = 0 } = flags;

  const sectionItems = COLLECTOR_NAV_SECTIONS.map((id) => ({
    id,
    label: t(COLLECTOR_SECTION_LABEL_KEYS[id]),
    showDot: id === "attention" && attentionItemCount > 0,
  }));

  return appendPersonalArchiveNavItem(
    insertCollectorUtilityNavItems(sectionItems, t),
    t
  );
}

export function navigateToCollectorSection(
  router: AppRouterInstance,
  sectionId: CollectorSectionId
) {
  try {
    sessionStorage.setItem(COLLECTOR_SECTION_STORAGE_KEY, sectionId);
  } catch {
    // ignore
  }
  deferredRouterPush(router, "/studio/collector");
}

/** Canonical Studio holding detail — `/studio/artwork/:id` redirects to legacy handler. */
export function studioCollectorArtworkHref(registryId: string): string {
  const clean = registryId.trim();
  return `/studio/artwork/${encodeURIComponent(clean)}`;
}

export function consumePendingCollectorSection(): CollectorSectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(COLLECTOR_SECTION_STORAGE_KEY);
    sessionStorage.removeItem(COLLECTOR_SECTION_STORAGE_KEY);
    if (raw && isCollectorSectionId(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}
