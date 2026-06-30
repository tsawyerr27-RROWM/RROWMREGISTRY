import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { WorkspaceNavItem } from "@/components/Studio/WorkspaceShell";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import { CREATIVE_SECTION_LABEL_KEYS } from "@/lib/studio-nav/labels";
import { appendPersonalArchiveNavItem } from "@/lib/studio-nav/personal-archive";
import { insertCreativeUtilityNavItems } from "@/lib/studio-nav/studio-utility-nav";
import type { StudioNavTranslate } from "@/lib/studio-nav/types";

export const CREATIVE_NAV_SECTIONS = [
  "Studio",
  "Artworks",
  "Records",
  "Certificates",
  "Ownership",
] as const;

export type CreativeSectionId = (typeof CREATIVE_NAV_SECTIONS)[number];

/** @deprecated Use CREATIVE_NAV_SECTIONS */
export const STUDIO_SECTION_IDS = CREATIVE_NAV_SECTIONS;

/** @deprecated Use CreativeSectionId */
export type StudioSectionId = CreativeSectionId;

const CREATIVE_SECTION_STORAGE_KEY = "rrowm:studioSection:v1";

export function isCreativeSectionId(id: string): id is CreativeSectionId {
  return (CREATIVE_NAV_SECTIONS as readonly string[]).includes(id);
}

/** @deprecated Use isCreativeSectionId */
export const isStudioSectionId = isCreativeSectionId;

export type CreativeNavFlags = {
  governanceAttention?: boolean;
  ownershipSaleSignalCount?: number;
};

export function buildCreativeNavItems(
  t: StudioNavTranslate,
  flags: CreativeNavFlags = {}
): WorkspaceNavItem[] {
  const { governanceAttention = false, ownershipSaleSignalCount = 0 } = flags;

  const sectionItems = CREATIVE_NAV_SECTIONS.map((id) => ({
    id,
    label: t(CREATIVE_SECTION_LABEL_KEYS[id]),
    showDot:
      (id === "Records" && governanceAttention) ||
      (id === "Ownership" && ownershipSaleSignalCount > 0),
  }));

  return appendPersonalArchiveNavItem(
    insertCreativeUtilityNavItems(sectionItems, t),
    t
  );
}

export function navigateToCreativeSection(
  router: AppRouterInstance,
  sectionId: CreativeSectionId
) {
  try {
    sessionStorage.setItem(CREATIVE_SECTION_STORAGE_KEY, sectionId);
  } catch {
    // ignore
  }
  deferredRouterPush(router, "/studio/creative");
}

/** @deprecated Use navigateToCreativeSection */
export const navigateToStudioSection = navigateToCreativeSection;

export function consumePendingCreativeSection(): CreativeSectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CREATIVE_SECTION_STORAGE_KEY);
    sessionStorage.removeItem(CREATIVE_SECTION_STORAGE_KEY);
    if (raw && isCreativeSectionId(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}

/** @deprecated Use consumePendingCreativeSection */
export const consumePendingStudioSection = consumePendingCreativeSection;

/** Studio verification entry for a linked artwork, with catalogue fallback. */
export function buildArtworkVerificationHref(artworkId: string | null): string {
  const id = String(artworkId ?? "").trim();
  if (id) {
    return `/authenticate-record?artwork_id=${encodeURIComponent(id)}`;
  }
  return "/studio/creative?section=artworks";
}

export function primeCreativeSectionFromUrlQuery(): void {
  if (typeof window === "undefined") return;
  try {
    const section = new URLSearchParams(window.location.search).get("section");
    if (!section) return;
    const normalized =
      section.toLowerCase() === "artworks"
        ? "Artworks"
        : section.charAt(0).toUpperCase() + section.slice(1);
    if (isCreativeSectionId(normalized)) {
      sessionStorage.setItem(CREATIVE_SECTION_STORAGE_KEY, normalized);
    }
  } catch {
    // ignore
  }
}
