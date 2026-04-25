"use client";

import { motion, useReducedMotion, useScroll } from "framer-motion";

/** Thin scroll-linked line — maps page scroll directly (no spring = less main-thread work). */
export function JourneyProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ layoutEffect: false });

  if (reduce) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left transform-gpu bg-gradient-to-r from-violet-500/55 via-sky-500/45 to-amber-500/45 [backface-visibility:hidden]"
      style={{
        scaleX: scrollYProgress,
        willChange: "transform",
      }}
      aria-hidden
    />
  );
}
