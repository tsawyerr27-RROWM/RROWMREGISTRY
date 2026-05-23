"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export type NarrativeCheckpoint = {
  id: string;
  color: string;
  /** Omit to hide the rail caption when this checkpoint is active */
  label?: string;
};

/** Default rail — home / landing (`app/page.tsx`) */
export const LANDING_NARRATIVE_CHECKPOINTS: NarrativeCheckpoint[] = [
  { id: "net-hero", color: "#7c3aed", label: "Record initiates" },
  { id: "net-system", color: "#2563eb", label: "Identity linked" },
  { id: "net-trust", color: "#475569", label: "Policy read" },
  { id: "net-portfolio", color: "#0ea5e9", label: "Portfolio mapped" },
  { id: "net-personas", color: "#9333ea", label: "Constituencies" },
  { id: "net-cta", color: "#111827", label: "Network ready" },
];

/** About overview — IDs must match `MotionReveal` wrappers on `app/about/page.tsx` */
export const ABOUT_NARRATIVE_CHECKPOINTS: NarrativeCheckpoint[] = [
  { id: "about-net-intro", color: "#7c3aed" },
  { id: "about-net-trust", color: "#64748b", label: "Principles" },
  { id: "about-net-what", color: "#2563eb", label: "Record framed" },
  { id: "about-net-how", color: "#0ea5e9", label: "Path mapped" },
  { id: "about-net-visibility", color: "#f59e0b", label: "Visibility set" },
  { id: "about-net-properties", color: "#10b981", label: "Properties read" },
  { id: "about-net-audience", color: "#d946ef", label: "Constituencies" },
  { id: "about-net-cta", color: "#111827", label: "Continue" },
];

/** Distance from viewport edge — mirrors max content width (~75rem) */
const RAIL_RIGHT = "max(0.9rem, calc(50% - 37.5rem))";
const SPINE_W = 4;
const TICK_H = 4;

type PositionMap = Record<string, number>;
type ActiveMap = Record<string, boolean>;

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Branch bundle strength follows active discovery + scroll-driven flow */
function NarrativeBranchRails({
  color,
  y,
  isActive,
  isHero,
  reduceMotion,
  flowPulse,
}: {
  color: string;
  y: number;
  isActive: boolean;
  isHero: boolean;
  reduceMotion: boolean | null | undefined;
  flowPulse: number;
}) {
  const peak = reduceMotion ? 0.36 : 0.54;
  const mid = reduceMotion ? 0.12 : 0.22;
  const flowBoost = 0.35 + flowPulse * 0.45;
  const baseOpacity = (isActive ? 1 : 0.42) * flowBoost;
  const grad = (strong: number, weak: number) =>
    `linear-gradient(to left, ${hexToRgba(color, strong * baseOpacity)}, ${hexToRgba(color, weak * baseOpacity)}, transparent)`;

  const anchorRight = `calc(${RAIL_RIGHT} + ${SPINE_W}px)`;
  const top = y + TICK_H / 2;

  const branches: { w: string; h: number; rotate: number; g0: number; g1: number }[] = [
    { w: "min(640px, 62vw)", h: 3, rotate: 0, g0: peak, g1: mid },
    { w: "min(380px, 42vw)", h: 2, rotate: -16, g0: peak * 0.85, g1: mid * 0.9 },
    { w: "min(320px, 36vw)", h: 2, rotate: 20, g0: peak * 0.8, g1: mid * 0.85 },
  ];

  if (isHero) {
    branches.push({
      w: "min(480px, 52vh)",
      h: 2,
      rotate: -72,
      g0: peak * 0.75,
      g1: mid * 0.8,
    });
  }

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        right: anchorRight,
        top,
        transform: "translateY(-50%)",
        width: 0,
        height: 0,
      }}
      aria-hidden
    >
      {branches.map((b, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full"
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0.5 + flowPulse * 0.35,
            scale: isActive ? 1 : 0.98,
          }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            right: 0,
            top: "50%",
            width: b.w,
            height: b.h,
            transform: `translateY(-50%) rotate(${b.rotate}deg)`,
            transformOrigin: "100% 50%",
            backgroundImage: grad(b.g0, b.g1),
          }}
        />
      ))}
    </div>
  );
}

type NarrativeNetworkFlowProps = {
  checkpoints?: NarrativeCheckpoint[];
};

const MAIN_CURVE_D =
  "M 420 40 C 260 180 340 420 300 700 C 320 980 260 1180 340 1380 C 300 1650 380 1880 320 2140";

export function NarrativeNetworkFlow({
  checkpoints = LANDING_NARRATIVE_CHECKPOINTS,
}: NarrativeNetworkFlowProps) {
  const reduceMotion = useReducedMotion();
  const curveGradId = useId().replace(/:/g, "");
  const pulseGradId = useId().replace(/:/g, "");
  const [positions, setPositions] = useState<PositionMap>({});
  const [active, setActive] = useState<ActiveMap>({});

  const { scrollYProgress } = useScroll({ layoutEffect: false });

  const curvePathLength = useSpring(
    useTransform(
      scrollYProgress,
      [0, 0.08, 0.92, 1],
      reduceMotion ? [1, 1, 1, 1] : [0.06, 0.42, 0.88, 1]
    ),
    { stiffness: 38, damping: 26, mass: 0.9 }
  );

  const flowPulse = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.72, 0.55]),
    { stiffness: 48, damping: 22 }
  );

  const [flowPulseNum, setFlowPulseNum] = useState(0.5);
  useMotionValueEvent(flowPulse, "change", (v) => setFlowPulseNum(v));

  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.35, 0.55, 0.5, 0.45]);

  const activeIndex = useMemo(() => {
    let max = -1;
    checkpoints.forEach((c, i) => {
      if (active[c.id]) max = i;
    });
    return max;
  }, [active, checkpoints]);

  useEffect(() => {
    const next: ActiveMap = {};
    checkpoints.forEach((c) => {
      next[c.id] = false;
    });
    setActive(next);
  }, [checkpoints]);

  useEffect(() => {
    const measure = () => {
      const next: PositionMap = {};
      checkpoints.forEach((cp) => {
        const el = document.getElementById(cp.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        next[cp.id] = window.scrollY + rect.top + Math.min(rect.height * 0.25, 120);
      });
      setPositions(next);
    };

    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [checkpoints]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setActive((prev) => {
          const next = { ...prev };
          let dirty = false;
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute("id");
            if (!id || next[id]) return;
            next[id] = true;
            dirty = true;
          });
          return dirty ? next : prev;
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -20% 0px",
      }
    );

    checkpoints.forEach((cp) => {
      const el = document.getElementById(cp.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [checkpoints]);

  const firstY = positions[checkpoints[0].id] ?? 0;
  const lastY = positions[checkpoints[checkpoints.length - 1].id] ?? firstY;
  const activeY =
    activeIndex >= 0 ? positions[checkpoints[activeIndex].id] ?? firstY : firstY;

  if (!firstY || !lastY) return null;

  const nodeSize = 13;
  const nodeTranslateX = (SPINE_W - nodeSize) / 2;

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      className="absolute inset-0 z-[35] hidden min-h-full lg:block"
      aria-label="Page narrative and section jumps"
    >
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="absolute top-0 h-full w-[min(42vw,26rem)] max-w-none opacity-[0.38] md:opacity-[0.44]"
          style={{ right: `calc(${RAIL_RIGHT} - 2.25rem)` }}
          viewBox="0 0 440 2400"
          fill="none"
          preserveAspectRatio="xMaxYMin slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={`net-curve-${curveGradId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.55" />
              <stop offset="40%" stopColor="#2563eb" stopOpacity="0.42" />
              <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="0.48" />
            </linearGradient>
            <linearGradient id={`net-pulse-${pulseGradId}`} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={MAIN_CURVE_D}
            fill="none"
            stroke={`url(#net-curve-${curveGradId})`}
            strokeWidth={1.35}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: curvePathLength }}
          />
          {!reduceMotion ? (
            <motion.path
              d={MAIN_CURVE_D}
              fill="none"
              stroke={`url(#net-pulse-${pulseGradId})`}
              strokeWidth={2.2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                pathLength: curvePathLength,
                opacity: glowOpacity,
              }}
            />
          ) : null}
          <path
            d="M 380 320 L 300 400 M 360 920 L 240 1000 M 340 1520 L 220 1580"
            stroke="rgba(15,23,42,0.1)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>

        <motion.div
          className="absolute top-0 h-full rounded-full bg-gradient-to-b from-white/18 via-white/8 to-white/16 shadow-[0_0_20px_rgba(124,58,237,0.22)]"
          style={{ right: RAIL_RIGHT, width: SPINE_W }}
          animate={{
            filter: reduceMotion
              ? "brightness(1)"
              : [
                  "brightness(1) drop-shadow(0 0 6px rgba(124,58,237,0.35))",
                  "brightness(1.08) drop-shadow(0 0 14px rgba(14,165,233,0.4))",
                  "brightness(1) drop-shadow(0 0 6px rgba(124,58,237,0.35))",
                ],
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }
          aria-hidden
        />

        <div
          className="pointer-events-none absolute bg-gradient-to-b from-violet-400/70 via-sky-400/75 to-emerald-400/70"
          style={{
            right: RAIL_RIGHT,
            width: SPINE_W,
            top: firstY,
            height: Math.max(0, activeY - firstY),
            transition: reduceMotion ? "none" : "height 520ms ease",
          }}
          aria-hidden
        />
      </div>

      {checkpoints.map((cp, i) => {
        const y = positions[cp.id];
        if (!y) return null;
        const isActive = Boolean(active[cp.id]);
        const label = cp.label ?? `Section ${i + 1}`;

        return (
          <div key={cp.id}>
            <NarrativeBranchRails
              color={cp.color}
              y={y}
              isActive={isActive}
              isHero={i === 0}
              reduceMotion={reduceMotion}
              flowPulse={flowPulseNum}
            />
            <div
              className="pointer-events-none absolute"
              style={{
                right: RAIL_RIGHT,
                top: y,
                width: isActive ? 64 : 22,
                height: TICK_H,
                background: isActive ? cp.color : "rgba(0,0,0,0.18)",
                transition: reduceMotion ? "none" : "width 420ms ease",
              }}
              aria-hidden
            />
            <motion.button
              type="button"
              className="group absolute flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-violet-500/70"
              onClick={() => scrollToId(cp.id)}
              aria-label={`${label}. Go to this part of the page.`}
              style={{
                right: `calc(${RAIL_RIGHT} + ${nodeTranslateX}px - 22px)`,
                top: y - nodeSize / 2 + TICK_H / 2,
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.08 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {cp.label ? (
                <span
                  className={`pointer-events-none absolute right-[calc(100%+14px)] top-1/2 hidden max-w-[11rem] -translate-y-1/2 text-right text-sm font-medium leading-snug transition-opacity duration-300 md:block ${isActive ? "opacity-90" : "opacity-0 group-hover:opacity-95 group-focus-visible:opacity-95"}`}
                  style={{ color: cp.color }}
                >
                  {cp.label}
                </span>
              ) : null}
              <span className="relative inline-flex">
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: cp.color }}
                  animate={{
                    opacity: isActive ? 0.35 : 0.12,
                    scale: isActive ? 1.85 : 1.2,
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden
                />
                <span
                  className="relative z-[1] block h-[13px] w-[13px] rounded-full border-2 bg-white"
                  style={{
                    borderColor: isActive ? cp.color : "rgba(0,0,0,0.26)",
                    boxShadow: isActive ? `0 0 0 5px ${cp.color}2a` : "none",
                  }}
                  aria-hidden
                />
              </span>
            </motion.button>
            {i === 0 ? (
              <span className="sr-only">Narrative flow starts at the top of this page</span>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
