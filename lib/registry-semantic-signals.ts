/**
 * Canonical RROWM semantic signal mappings.
 * Color communicates registry event meaning — not arbitrary UI state.
 *
 * See `.cursor/rules/rrowm-semantic-signals.mdc`
 */

import type { NotificationType } from "@/lib/notifications";

export type RegistrySemanticEvent =
  | "registration"
  | "valuation"
  | "sale"
  | "transfer"
  | "certification"
  | "correction";

/** Bar accent utilities (chronology spine, archive sheet rail) */
export function semanticSignalBarClass(event: RegistrySemanticEvent): string {
  switch (event) {
    case "registration":
      return "v2-signal-bar v2-signal-bar--cobalt";
    case "valuation":
      return "v2-signal-bar v2-signal-bar--violet";
    case "sale":
      return "v2-signal-bar v2-signal-bar--ember";
    case "transfer":
      return "v2-signal-bar v2-signal-bar--lime";
    case "certification":
      return "v2-signal-bar v2-signal-bar--seal";
    case "correction":
      return "v2-signal-bar v2-signal-bar--amber";
    default:
      return "v2-signal-bar v2-signal-bar--cobalt";
  }
}

/** Event stamp markers (chronology, ledger, badges) */
export function semanticStampClass(event: RegistrySemanticEvent): string {
  return `registry-event-stamp registry-event-stamp--${event}`;
}

/** Text accent utilities */
export function semanticTextClass(event: RegistrySemanticEvent): string {
  switch (event) {
    case "registration":
      return "v2-signal-cobalt";
    case "valuation":
      return "v2-signal-violet";
    case "sale":
      return "v2-signal-ember";
    case "transfer":
      return "v2-signal-lime";
    case "certification":
      return "v2-signal-seal";
    case "correction":
      return "v2-signal-amber";
    default:
      return "v2-signal-cobalt";
  }
}

/** Left-rail accent on cards and ledger rows */
export function semanticAccentBorderClass(event: RegistrySemanticEvent): string {
  switch (event) {
    case "registration":
      return "border-l-[var(--v2-cobalt-signal)]";
    case "valuation":
      return "border-l-[var(--v2-violet-signal)]";
    case "sale":
      return "border-l-[var(--v2-ember-stamp)]";
    case "transfer":
      return "border-l-[var(--v2-lime-pulse)]";
    case "certification":
      return "border-l-[var(--v2-seal-ink)]";
    case "correction":
      return "border-l-[var(--v2-amber-exception)]";
    default:
      return "border-l-[var(--v2-cobalt-signal)]";
  }
}

/** Compact dot markers (notifications, list items) */
export function semanticDotClass(event: RegistrySemanticEvent | null): string {
  if (!event) return "v2-signal-dot v2-signal-dot--neutral";
  return `v2-signal-dot v2-signal-dot--${event}`;
}

/** Map inbox notification types to registry semantics; null = neutral chrome only */
export function notificationSemanticEvent(
  type: NotificationType
): RegistrySemanticEvent | null {
  switch (type) {
    case "registry_verification_approved":
    case "registry_certificate_issued":
      return "certification";
    case "registry_amendment_requested":
      return "correction";
    case "registry_transfer_recorded":
    case "ownership_transfer_completed":
    case "registry_custody_invite_received":
    case "ownership_claim_required":
    case "ownership_confirmation_required":
      return "transfer";
    case "registry_authorship_invite_received":
      return "registration";
    case "deal_execution_recorded":
      return "sale";
    case "representation_relationship_activated":
      return "certification";
    case "provenance_exhibition_recorded":
      return "registration";
    default:
      return null;
  }
}

export const REGISTRY_SEMANTIC_EVENTS: readonly RegistrySemanticEvent[] = [
  "registration",
  "valuation",
  "sale",
  "transfer",
  "certification",
  "correction",
] as const;
