import type { AcquisitionFilingStepId } from "@/lib/acquisition-filing-timeline";
import {
  semanticStampClass,
  semanticTextClass,
  type RegistrySemanticEvent,
} from "@/lib/registry-semantic-signals";

/** Map acquisition timeline steps to registry semantic events. */
export function acquisitionStepSemanticEvent(
  stepId: AcquisitionFilingStepId
): RegistrySemanticEvent {
  switch (stepId) {
    case "terms_agreed":
      return "registration";
    case "seller_executed":
      return "sale";
    case "buyer_acceptance":
      return "transfer";
    case "ownership_recorded":
      return "certification";
  }
}

export type AcquisitionStepVisualStatus = "complete" | "current" | "upcoming";

function stepBorderClass(event: RegistrySemanticEvent): string {
  switch (event) {
    case "registration":
      return "border-[var(--v2-cobalt-signal-dim)]";
    case "sale":
      return "border-[var(--v2-ember-stamp-dim)]";
    case "transfer":
      return "border-[var(--v2-lime-pulse-dim)]";
    case "certification":
      return "border-[var(--v2-seal-border)]";
    case "correction":
      return "border-[var(--v2-amber-exception-dim)]";
    default:
      return "border-[var(--v2-border)]";
  }
}

function stepRingClass(event: RegistrySemanticEvent): string {
  switch (event) {
    case "registration":
      return "ring-[var(--v2-cobalt-signal-dim)]";
    case "sale":
      return "ring-[var(--v2-ember-stamp-dim)]";
    case "transfer":
      return "ring-[var(--v2-lime-pulse-dim)]";
    case "certification":
      return "ring-[var(--v2-lime-pulse-dim)]";
    case "correction":
      return "ring-[var(--v2-amber-exception-dim)]";
    default:
      return "ring-[var(--v2-border)]";
  }
}

/** Timeline step card surface */
export function acquisitionStepCardClass(
  stepId: AcquisitionFilingStepId,
  status: AcquisitionStepVisualStatus
): string {
  const base = "relative rounded-2xl border p-4 transition";
  if (status === "upcoming") {
    return `${base} border-[var(--v2-border)] bg-white/70`;
  }

  const event = acquisitionStepSemanticEvent(stepId);
  let card = `${base} ${stepBorderClass(event)} bg-white`;

  if (stepId === "ownership_recorded") {
    card += " border-l-[3px] border-l-[var(--v2-lime-pulse)]";
  }

  if (status === "current") {
    card += ` shadow-[0_12px_32px_-18px_rgba(15,23,42,0.1)] ring-2 ring-offset-1 ${stepRingClass(event)}`;
  }

  return card;
}

/** Timeline step index / check marker */
export function acquisitionStepMarkerClass(
  stepId: AcquisitionFilingStepId,
  status: AcquisitionStepVisualStatus
): string {
  const base =
    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold";

  if (status === "upcoming") {
    return `${base} bg-[var(--v2-border)] text-[var(--v2-ink-muted)]`;
  }

  if (stepId === "ownership_recorded") {
    return `${base} bg-[var(--v2-seal-ink)] text-white ring-2 ring-[var(--v2-lime-pulse-dim)]`;
  }

  const event = acquisitionStepSemanticEvent(stepId);
  switch (event) {
    case "registration":
      return `${base} bg-[var(--v2-cobalt-signal)] text-white`;
    case "sale":
      return `${base} bg-[var(--v2-ember-stamp)] text-white`;
    case "transfer":
      return `${base} bg-[var(--v2-lime-pulse)] text-[var(--v2-graphite)]`;
    default:
      return `${base} bg-[var(--v2-seal-ink)] text-white`;
  }
}

/** Timeline step title */
export function acquisitionStepTitleClass(
  stepId: AcquisitionFilingStepId,
  status: AcquisitionStepVisualStatus
): string {
  const base = "text-[13px] leading-snug";
  if (status === "upcoming") {
    return `${base} font-medium text-[var(--v2-ink-muted)]`;
  }
  const event = acquisitionStepSemanticEvent(stepId);
  const weight = status === "current" ? "font-semibold" : "font-medium";
  return `${base} ${weight} ${semanticTextClass(event)}`;
}

/** Blocked / unavailable / exception panels */
export function acquisitionExceptionPanelClass(): string {
  return "rounded-2xl border border-[var(--v2-amber-exception-dim)] bg-white p-4";
}

export function acquisitionExceptionTitleClass(): string {
  return `text-[13px] font-semibold ${semanticTextClass("correction")}`;
}

export function acquisitionExceptionBodyClass(): string {
  return "mt-1 text-[12px] leading-relaxed text-[var(--v2-ink-muted)]";
}

/** Action-required panels keyed by registry meaning */
export function acquisitionActionPanelClass(
  event: RegistrySemanticEvent
): string {
  return `rounded-2xl border ${stepBorderClass(event)} bg-white p-4`;
}

export function acquisitionActionTitleClass(
  event: RegistrySemanticEvent
): string {
  return `text-[13px] font-semibold ${semanticTextClass(event)}`;
}

export function acquisitionActionBodyClass(): string {
  return "mt-1 text-[12px] leading-relaxed text-[var(--v2-ink-muted)]";
}

/** Filing phase badge in hero header */
export function acquisitionPhaseStampClass(
  stepId: AcquisitionFilingStepId
): string {
  return semanticStampClass(acquisitionStepSemanticEvent(stepId));
}
