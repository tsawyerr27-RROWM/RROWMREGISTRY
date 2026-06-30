/**
 * Registry Explorer v2 — ceremonial record surfaces.
 * Sotheby's provenance × museum archive × blockchain explorer × luxury editorial.
 *
 * Compose from `styles/rrowm-v2.ts` primitives — 70% paper, 20% glass, 10% signal.
 */

import { rrowmV2Scope, v2Motion, v2Radius, v2Shadow, v2Surface } from "./rrowm-v2";
import { semanticMotionClassForEvent } from "./semantic-motion";

export const registryV2Scope = `${rrowmV2Scope} rrowm-registry-v2` as const;

export const registryV2Surface = {
  page: "rrowm-registry-page",
  heroArtwork: "v2-surface-paper v2-radius-card v2-shadow-paper overflow-hidden",
  metadataStack: "v2-surface-archive-sheet pl-6 md:pl-8",
  metadataField: "v2-surface-paper v2-radius-card px-4 py-3.5 md:px-5 md:py-4",
  filing: "registry-filing-sheet v2-surface-paper v2-radius-card",
  filingMajor: "registry-filing-sheet registry-filing-sheet--major v2-surface-paper v2-radius-card v2-shadow-paper",
  lineageNode: "registry-lineage-node v2-surface-paper v2-radius-card",
  explorerIndex: "registry-explorer-index v2-surface-archive-sheet",
  certificateSheet: "registry-certificate-sheet v2-surface-paper",
  glassQuiet: `${v2Surface.glassLight} v2-radius-card`,
} as const;

export const registryV2Type = {
  recordTitle:
    "v2-type-display text-[2.35rem] font-normal leading-[1.06] tracking-[-0.03em] text-[var(--v2-ink)] md:text-[2.85rem]",
  sectionTitle:
    "v2-type-display text-[1.65rem] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--v2-ink)] md:text-[1.85rem]",
  metaLabel: "v2-type-label text-[10px] tracking-[0.24em]",
  metaValue: "text-[15px] leading-relaxed text-[var(--v2-ink-soft)]",
  monoId: "v2-type-mono text-[11px] tracking-[0.14em]",
  stamp: "registry-event-stamp v2-type-mono",
} as const;

export const registryV2Motion = {
  reveal: v2Motion.className.revealSlow,
  hover: v2Motion.className.hoverSubtle,
  /** @deprecated Prefer `forEvent` for chronology append surfaces */
  append: v2Motion.className.ledgerAppend,
  forEvent: semanticMotionClassForEvent,
} as const;

export function registryV2Card(): string {
  return `${v2Surface.paper} ${v2Radius.className.card} ${v2Shadow.className.paper}`;
}

export const registryV2 = {
  scope: registryV2Scope,
  surface: registryV2Surface,
  type: registryV2Type,
  motion: registryV2Motion,
  card: registryV2Card,
} as const;
