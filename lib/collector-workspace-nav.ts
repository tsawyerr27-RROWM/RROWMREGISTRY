import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { deferredRouterPush } from "@/lib/deferred-app-router";

export const COLLECTOR_SECTION_IDS = ["workspace", "works", "attention"] as const;

export type CollectorSectionId = (typeof COLLECTOR_SECTION_IDS)[number];

const COLLECTOR_SECTION_STORAGE_KEY = "rrowm:collectorStudioSection:v1";

export function isCollectorSectionId(id: string): id is CollectorSectionId {
  return (COLLECTOR_SECTION_IDS as readonly string[]).includes(id);
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
  deferredRouterPush(router, "/collector-studio");
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
