"use client";

import { useRouter } from "next/navigation";
import {
  deferredRouterBack,
  deferredRouterPush,
} from "@/lib/deferred-app-router";
import { useCallback, useMemo } from "react";
import { readNavigationTrail } from "@/components/navigation/NavigationHistory";

type HistoryBackButtonProps = {
  fallbackHref?: string;
  className?: string;
};

export function HistoryBackButton({
  fallbackHref,
  className = "",
}: HistoryBackButtonProps) {
  const router = useRouter();

  const previousHref = useMemo(() => {
    const trail = readNavigationTrail();
    if (trail.length < 2) return null;
    const prev = trail[trail.length - 2]?.href || null;
    return prev;
  }, []);

  const onClick = useCallback(() => {
    // Prefer explicit previous route in this tab session (works even if
    // user opened this page in a new tab, where router.back() would be wrong).
    if (previousHref) {
      deferredRouterPush(router, previousHref);
      return;
    }

    // If we have browser history, use it.
    if (typeof window !== "undefined" && window.history.length > 1) {
      deferredRouterBack(router);
      return;
    }

    // Final fallback.
    deferredRouterPush(router, fallbackHref || "/");
  }, [fallbackHref, previousHref, router]);

  return (
    <button type="button" onClick={onClick} className={className}>
      <span aria-hidden>←</span>
      Back
    </button>
  );
}

