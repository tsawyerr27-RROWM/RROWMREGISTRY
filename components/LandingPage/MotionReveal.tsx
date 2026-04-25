"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, type ReactNode } from "react";

import {
  NARRATIVE_REVEAL_DURATION_S,
  NARRATIVE_REVEAL_Y,
  narrativeEase,
} from "@/styles/narrative-layout";

/** Stable reference — avoids re-subscribing in-view observers when parent re-renders */
const MOTION_REVEAL_VIEWPORT = {
  once: true,
  margin: "-14% 0px -12% 0px",
  amount: 0.1,
} as const;

/**
 * Soft entrance on scroll — narrative pacing without “feature grid” energy.
 */
export function MotionReveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const transition = useMemo(
    () =>
      ({
        duration: NARRATIVE_REVEAL_DURATION_S,
        delay,
        ease: narrativeEase,
      }) as const,
    [delay]
  );

  if (reduce) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      id={id}
      className={`transform-gpu [backface-visibility:hidden] ${className}`}
      initial={{ opacity: 0, y: NARRATIVE_REVEAL_Y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={MOTION_REVEAL_VIEWPORT}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
