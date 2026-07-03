"use client";

import { useSyncExternalStore } from "react";

/**
 * True when viewport is below desktop command bar (tablet + mobile).
 * SSR snapshot is `false` (desktop-first paint).
 */
export function useMaxWidth1023(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 1023px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches,
    () => false
  );
}
