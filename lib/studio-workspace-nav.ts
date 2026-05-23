import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { deferredRouterPush } from "@/lib/deferred-app-router";

export const STUDIO_SECTION_IDS = [
  "Studio",
  "Records",
  "Artworks",
  "Certificates",
  "Ownership",
] as const;

export type StudioSectionId = (typeof STUDIO_SECTION_IDS)[number];

const STUDIO_SECTION_STORAGE_KEY = "rrowm:studioSection:v1";

export function isStudioSectionId(id: string): id is StudioSectionId {
  return (STUDIO_SECTION_IDS as readonly string[]).includes(id);
}

export function navigateToStudioSection(
  router: AppRouterInstance,
  sectionId: StudioSectionId
) {
  try {
    sessionStorage.setItem(STUDIO_SECTION_STORAGE_KEY, sectionId);
  } catch {
    // ignore
  }
  deferredRouterPush(router, "/studio");
}

export function consumePendingStudioSection(): StudioSectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STUDIO_SECTION_STORAGE_KEY);
    sessionStorage.removeItem(STUDIO_SECTION_STORAGE_KEY);
    if (raw && isStudioSectionId(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}
