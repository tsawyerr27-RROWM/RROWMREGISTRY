"use client";

import { useSyncExternalStore } from "react";

/**
 * True when viewport is narrow (mobile / small tablet).
 * SSR snapshot is `false` so first paint matches server; client corrects immediately.
 */
export function useMaxWidth767(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
    () => false
  );
}
