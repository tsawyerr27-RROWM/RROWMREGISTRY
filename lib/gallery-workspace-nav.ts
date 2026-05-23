import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { deferredRouterPush } from "@/lib/deferred-app-router";

export const GALLERY_SECTION_IDS = [
  "studio",
  "record-depth",
  "roster",
  "catalogue",
  "verification",
  "invitations",
] as const;

export type GallerySectionId = (typeof GALLERY_SECTION_IDS)[number];

const GALLERY_SECTION_STORAGE_KEY = "rrowm:galleryStudioSection:v1";

export function isGallerySectionId(id: string): id is GallerySectionId {
  return (GALLERY_SECTION_IDS as readonly string[]).includes(id);
}

export function navigateToGallerySection(
  router: AppRouterInstance,
  sectionId: GallerySectionId
) {
  try {
    sessionStorage.setItem(GALLERY_SECTION_STORAGE_KEY, sectionId);
  } catch {
    // ignore
  }
  deferredRouterPush(router, "/institutional-studio-dashboard");
}

export function consumePendingGallerySection(): GallerySectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GALLERY_SECTION_STORAGE_KEY);
    sessionStorage.removeItem(GALLERY_SECTION_STORAGE_KEY);
    if (raw && isGallerySectionId(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}
