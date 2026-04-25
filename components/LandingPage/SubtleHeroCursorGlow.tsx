"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

/**
 * Very subtle radial highlight inside the hero artwork panel, in local coords.
 * Mouse position updates are rAF-batched so move events don't overwhelm the main thread.
 */
export function SubtleHeroCursorGlow() {
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<{ cx: number; cy: number } | null>(null);
  const rafRef = useRef<number>(0);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 160, damping: 34, mass: 0.32 });
  const y = useSpring(rawY, { stiffness: 160, damping: 34, mass: 0.32 });

  const background = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgba(124, 58, 237, 0.11), rgba(34, 197, 94, 0.04) 42%, transparent 62%)`;

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    rawX.set(r.width / 2);
    rawY.set(r.height / 2);
  }, [rawX, rawY]);

  useEffect(() => {
    if (reduceMotion || !finePointer) return;
    const el = containerRef.current;
    if (!el) return;

    const flush = () => {
      rafRef.current = 0;
      const p = pendingRef.current;
      pendingRef.current = null;
      if (!p) return;
      const r = el.getBoundingClientRect();
      rawX.set(p.cx - r.left);
      rawY.set(p.cy - r.top);
    };

    const onMove = (e: MouseEvent) => {
      pendingRef.current = { cx: e.clientX, cy: e.clientY };
      if (rafRef.current !== 0) return;
      rafRef.current = requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion, finePointer, rawX, rawY]);

  if (reduceMotion || !finePointer) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <motion.div className="absolute inset-0" style={{ background }} />
    </div>
  );
}
