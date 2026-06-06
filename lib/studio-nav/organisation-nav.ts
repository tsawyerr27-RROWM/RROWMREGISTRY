import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { WorkspaceNavItem } from "@/components/Studio/WorkspaceShell";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import { ORGANISATION_SECTION_LABEL_KEYS } from "@/lib/studio-nav/labels";
import { appendPersonalArchiveNavItem } from "@/lib/studio-nav/personal-archive";
import type { StudioNavTranslate } from "@/lib/studio-nav/types";

export const ORGANISATION_NAV_SECTIONS = [
  "studio",
  "record-depth",
  "roster",
  "catalogue",
  "verification",
  "invitations",
  "opportunities",
] as const;

export type OrganisationSectionId = (typeof ORGANISATION_NAV_SECTIONS)[number];

/** @deprecated Use ORGANISATION_NAV_SECTIONS */
export const GALLERY_SECTION_IDS = ORGANISATION_NAV_SECTIONS;

/** @deprecated Use OrganisationSectionId */
export type GallerySectionId = OrganisationSectionId;

const ORGANISATION_SECTION_STORAGE_KEY = "rrowm:galleryStudioSection:v1";

export function isOrganisationSectionId(
  id: string
): id is OrganisationSectionId {
  return (ORGANISATION_NAV_SECTIONS as readonly string[]).includes(id);
}

/** @deprecated Use isOrganisationSectionId */
export const isGallerySectionId = isOrganisationSectionId;

export type OrganisationNavFlags = {
  participationAttention?: boolean;
  verificationQueueActive?: boolean;
  pendingInviteCount?: number;
};

export function buildOrganisationNavItems(
  t: StudioNavTranslate,
  flags: OrganisationNavFlags = {}
): WorkspaceNavItem[] {
  const {
    participationAttention = false,
    verificationQueueActive = false,
    pendingInviteCount = 0,
  } = flags;

  return appendPersonalArchiveNavItem(
    ORGANISATION_NAV_SECTIONS.map((id) => ({
      id,
      label: t(ORGANISATION_SECTION_LABEL_KEYS[id]),
      showDot:
        (id === "record-depth" && participationAttention) ||
        (id === "verification" && verificationQueueActive) ||
        (id === "invitations" && pendingInviteCount > 0),
    })),
    t
  );
}

export function navigateToOrganisationSection(
  router: AppRouterInstance,
  sectionId: OrganisationSectionId
) {
  try {
    sessionStorage.setItem(ORGANISATION_SECTION_STORAGE_KEY, sectionId);
  } catch {
    // ignore
  }
  deferredRouterPush(router, "/studio/organisation");
}

/** @deprecated Use navigateToOrganisationSection */
export const navigateToGallerySection = navigateToOrganisationSection;

export function consumePendingOrganisationSection(): OrganisationSectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORGANISATION_SECTION_STORAGE_KEY);
    sessionStorage.removeItem(ORGANISATION_SECTION_STORAGE_KEY);
    if (raw && isOrganisationSectionId(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}

/** @deprecated Use consumePendingOrganisationSection */
export const consumePendingGallerySection = consumePendingOrganisationSection;
