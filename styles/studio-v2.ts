/**
 * Studio workflow v2 — Bloomberg terminal × luxury advisory × execution room.
 * Compose from `rrowm-v2` + `registry-v2` primitives.
 */

import { registryV2 } from "./registry-v2";
import { rrowmV2Scope, v2Motion, v2Radius, v2Shadow, v2Surface } from "./rrowm-v2";
import { semanticMotionClassForEvent } from "./semantic-motion";

export const studioV2Scope = `${rrowmV2Scope} rrowm-studio-v2` as const;

export const studioV2Surface = {
  commandGrid: "studio-deal-command-grid",
  inboxRail: "studio-deal-inbox-rail v2-surface-paper v2-radius-card",
  commandCenter: "studio-deal-command-center",
  executionRail: "studio-deal-execution-rail",
  filingSheet: "studio-filing-sheet v2-surface-paper v2-radius-card",
  filingSheetMajor: "studio-filing-sheet studio-filing-sheet--major v2-surface-paper v2-radius-card v2-shadow-paper",
  catalogueSheetHoldings:
    "studio-catalogue-sheet studio-catalogue-sheet--holdings v2-surface-paper v2-radius-card",
  catalogueSheetOut: "studio-catalogue-sheet studio-catalogue-sheet--out v2-surface-paper v2-radius-card",
  catalogueSheetArtist: "studio-catalogue-sheet studio-catalogue-sheet--artist v2-surface-paper v2-radius-card",
  modalGlass: "v2-surface-glass-light v2-radius-modal v2-shadow-cinematic",
  modalPaper: "studio-modal-paper v2-surface-paper v2-radius-card",
  ledger: "studio-deal-ledger v2-surface-archive-sheet",
} as const;

export const studioV2Type = {
  ...registryV2.type,
  commandTitle:
    "v2-type-display text-[1.85rem] font-normal leading-[1.08] tracking-[-0.03em] text-[var(--v2-ink)] md:text-[2.1rem]",
  railLabel: "v2-type-label text-[10px] tracking-[0.24em]",
  executionStamp: "registry-event-stamp v2-type-mono",
  inboxItem: "v2-type-mono text-[10px] tracking-[0.12em]",
} as const;

export const studioV2Motion = {
  reveal: v2Motion.className.revealSlow,
  hover: v2Motion.className.hoverSubtle,
  append: v2Motion.className.ledgerAppend,
  modal: v2Motion.className.modalFloat,
  forEvent: semanticMotionClassForEvent,
} as const;

export const studioV2Modal = {
  overlay:
    "ds-z-modal-backdrop fixed inset-0 flex flex-col items-center overflow-y-auto overscroll-y-contain bg-[rgba(10,10,10,0.42)] px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(4.5rem+env(safe-area-inset-top,0px))] backdrop-blur-md sm:px-6 md:px-8",
  panel: `${studioV2Surface.modalGlass} relative mx-auto w-full shrink-0 overflow-hidden p-0`,
  inner: `${studioV2Surface.modalPaper} m-3 sm:m-4`,
  close:
    "absolute right-4 top-4 z-20 rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--v2-ink-muted)] transition hover:bg-black/[0.04] hover:text-[var(--v2-ink)] sm:right-5 sm:top-5",
} as const;

export const studioV2 = {
  scope: studioV2Scope,
  surface: studioV2Surface,
  type: studioV2Type,
  motion: studioV2Motion,
  modal: studioV2Modal,
} as const;

export function studioCatalogueSheetClass(args: {
  hasCompletedSale?: boolean;
  artistPrimaryOnly?: boolean;
}): string {
  if (args.hasCompletedSale) return studioV2Surface.catalogueSheetOut;
  if (args.artistPrimaryOnly) return studioV2Surface.catalogueSheetArtist;
  return studioV2Surface.catalogueSheetHoldings;
}
