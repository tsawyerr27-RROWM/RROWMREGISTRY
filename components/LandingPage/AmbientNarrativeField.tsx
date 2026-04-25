"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Page-scale ambient: institutional ledger + tonal light.
 * Intentionally NO network/traffic lines — keeps the page calm and editorial.
 */
export function AmbientNarrativeField() {
  const reduce = useReducedMotion();

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden ${reduce ? "opacity-[0.55]" : "opacity-100"}`}
      aria-hidden
    >
      <div className="ds-narrative-track absolute inset-0" />
      <div className="ds-narrative-depth absolute inset-0" />
      <div
        className={`ds-institutional-aurora absolute inset-0 ${reduce ? "opacity-[0.55]" : "opacity-100"}`}
        aria-hidden
      />
    </div>
  );
}
