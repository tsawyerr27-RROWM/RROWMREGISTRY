import { Suspense, type ReactNode } from "react";

import { StudioRouteGuard } from "@/components/Studio/StudioRouteGuard";

function StudioLayoutFallback() {
  return (
    <div className="ds-page-environment flex min-h-screen items-center justify-center pt-20">
      <p className="text-sm text-neutral-500">Loading…</p>
    </div>
  );
}

/**
 * Central auth guard for canonical Studio routes (Phase 1 PR5 — AG-1–3).
 * Excludes `/studio/account/restore` (token recovery without session).
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<StudioLayoutFallback />}>
      <StudioRouteGuard>{children}</StudioRouteGuard>
    </Suspense>
  );
}
