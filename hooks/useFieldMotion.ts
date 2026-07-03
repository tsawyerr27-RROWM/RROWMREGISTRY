"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Field signature motion gate — respects reduced motion and SSR hydration.
 */
export function useFieldMotion() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const motionEnabled = mounted && prefersReduced === false;

  return {
    mounted,
    motionEnabled,
    prefersReduced: Boolean(mounted && prefersReduced),
  };
}
