/**
 * RROWM consequence feedback — consequential actions feel filed, not submitted.
 * Museum archive × Bloomberg terminal × Leica shutter × official stamp.
 */

import type { RegistrySemanticEvent } from "@/lib/registry-semantic-signals";

export type ConsequenceFeedbackType =
  | "softCommit"
  | "registryCommit"
  | "marketCommit"
  | "custodyCommit"
  | "sealCommit";

/** Milliseconds — mirrored in globals.css custom properties */
export const CONSEQUENCE_FEEDBACK_DURATION_MS: Record<
  ConsequenceFeedbackType,
  number
> = {
  softCommit: 420,
  registryCommit: 780,
  marketCommit: 850,
  custodyCommit: 1100,
  sealCommit: 620,
};

const OVERLAY_CLASS: Record<ConsequenceFeedbackType, string> = {
  softCommit: "v2-consequence-overlay--soft-commit",
  registryCommit: "v2-consequence-overlay--registry-commit",
  marketCommit: "v2-consequence-overlay--market-commit",
  custodyCommit: "v2-consequence-overlay--custody-commit",
  sealCommit: "v2-consequence-overlay--seal-commit",
};

const TARGET_CLASS: Record<ConsequenceFeedbackType, string> = {
  softCommit: "v2-consequence-target--soft-commit",
  registryCommit: "v2-consequence-target--registry-commit",
  marketCommit: "v2-consequence-target--market-commit",
  custodyCommit: "v2-consequence-target--custody-commit",
  sealCommit: "v2-consequence-target--seal-commit",
};

const SURFACE_CLASS: Record<ConsequenceFeedbackType, string> = {
  softCommit: "v2-consequence-surface--soft-commit",
  registryCommit: "v2-consequence-surface--registry-commit",
  marketCommit: "v2-consequence-surface--market-commit",
  custodyCommit: "v2-consequence-surface--custody-commit",
  sealCommit: "v2-consequence-surface--seal-commit",
};

export const consequenceFeedbackBase = {
  overlay: "v2-consequence-overlay",
  target: "v2-consequence-target",
  surface: "v2-consequence-surface",
  lock: "v2-consequence-lock",
} as const;

export function consequenceFeedbackOverlayClass(
  type: ConsequenceFeedbackType
): string {
  return `${consequenceFeedbackBase.overlay} ${OVERLAY_CLASS[type]}`;
}

export function consequenceFeedbackTargetClass(
  type: ConsequenceFeedbackType
): string {
  return `${consequenceFeedbackBase.target} ${TARGET_CLASS[type]}`;
}

export function consequenceFeedbackSurfaceClass(
  type: ConsequenceFeedbackType
): string {
  return `${consequenceFeedbackBase.surface} ${SURFACE_CLASS[type]}`;
}

/** Map registry semantics → consequence feedback for filings */
export function consequenceFeedbackForRegistryEvent(
  event: RegistrySemanticEvent
): ConsequenceFeedbackType {
  switch (event) {
    case "registration":
    case "valuation":
      return "registryCommit";
    case "sale":
      return "marketCommit";
    case "transfer":
      return "custodyCommit";
    case "certification":
      return "sealCommit";
    case "correction":
      return "softCommit";
    default:
      return "registryCommit";
  }
}

export const consequenceFeedback = {
  duration: CONSEQUENCE_FEEDBACK_DURATION_MS,
  overlayClass: consequenceFeedbackOverlayClass,
  targetClass: consequenceFeedbackTargetClass,
  surfaceClass: consequenceFeedbackSurfaceClass,
  forRegistryEvent: consequenceFeedbackForRegistryEvent,
} as const;
