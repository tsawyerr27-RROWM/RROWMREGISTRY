"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Framer Motion + SSR: `useReducedMotion()` is null on the server and may differ
 * on the first client paint. Gate entrance motion until after hydration.
 */
export function useLandingMotion() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const motionEnabled = mounted && !prefersReduced;

  return {
    mounted,
    motionEnabled,
    prefersReduced: Boolean(mounted && prefersReduced),
  };
}
