"use client";

import { useMemo, useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { useMaxWidth767 } from "@/hooks/useMaxWidth767";

/** Stable scroll offsets — avoids new array identity in useScroll deps each render */
const OFFSET_START_END = ["start end", "end start"] as [
  "start end",
  "end start",
];

type Props = {
  children: ReactNode;
  /** Vertical parallax in px at section edges (0 = off). */
  parallax?: number;
  /** Subtle opacity dip at enter/exit while scrolling (cross-fade feel). */
  edgeSoftening?: boolean;
  className?: string;
};

/**
 * Scroll-linked parallax + soft opacity so sections don’t feel like hard cuts.
 * Uses a static wrapper when reduced motion or no scroll-driven styles — avoids extra useScroll work.
 */
export function ScrollAtmosphere({
  children,
  parallax = 14,
  edgeSoftening = true,
  className = "",
}: Props) {
  const reduce = useReducedMotion();

  if (reduce || (parallax === 0 && !edgeSoftening)) {
    return (
      <div className={`relative ${className}`}>{children}</div>
    );
  }

  return (
    <ScrollAtmosphereMotion
      parallax={parallax}
      edgeSoftening={edgeSoftening}
      className={className}
    >
      {children}
    </ScrollAtmosphereMotion>
  );
}

function ScrollAtmosphereMotion({
  children,
  parallax = 14,
  edgeSoftening = true,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const narrow = useMaxWidth767();

  const effectiveParallax = useMemo(() => {
    if (parallax === 0) return 0;
    const scaled = narrow ? Math.round(parallax * 0.34) : parallax;
    return scaled < 1 && parallax > 0 ? 1 : scaled;
  }, [narrow, parallax]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: OFFSET_START_END,
    layoutEffect: false,
  });

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    effectiveParallax === 0
      ? [0, 0, 0]
      : [effectiveParallax, 0, -effectiveParallax]
  );

  /** Light dip at section edges — opacity only (no mask) so full-bleed ink never clips or stacks oddly */
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.22, 0.78, 0.9, 1],
    !edgeSoftening
      ? [1, 1, 1, 1, 1, 1]
      : narrow
        ? [0.98, 0.99, 1, 1, 0.99, 0.98]
        : [0.96, 0.98, 1, 1, 0.98, 0.96]
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        className="transform-gpu [backface-visibility:hidden]"
        style={{
          y,
          opacity,
          willChange: "transform, opacity",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
