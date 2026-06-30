/**
 * The Field — public discovery v2.
 * Cultural infrastructure × editorial archive × institutional luxury.
 */

import { registryV2 } from "./registry-v2";
import { rrowmV2Scope } from "./rrowm-v2";

export const fieldV2Scope = `${rrowmV2Scope} ${registryV2.scope} rrowm-field-v2` as const;

export const fieldV2 = {
  scope: fieldV2Scope,
  container:
    "field-v2-container mx-auto w-full min-w-0 max-w-[min(100%,88rem)] px-4 pb-20 sm:px-6 lg:px-8",
  surface: {
    ...registryV2.surface,
    indexCard: "field-v2-index-card registry-filing-sheet v2-surface-paper v2-radius-card v2-shadow-paper",
    filters: "field-v2-filters v2-surface-paper v2-radius-card",
    empty: "field-v2-empty registry-filing-sheet v2-surface-paper v2-radius-card",
  },
  form: {
    label: "field-v2-form-label text-sm font-medium text-[var(--v2-ink-soft)]",
    field:
      "field-v2-form-field mt-2 w-full rounded-xl border border-[var(--v2-border)] bg-white/95 px-4 py-3.5 text-sm text-[var(--v2-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-[var(--v2-cool-grey)] transition focus:outline-none focus:ring-2 focus:ring-[var(--v2-cobalt-signal-dim)] focus:border-[var(--v2-cobalt-signal-dim)]",
  },
  type: registryV2.type,
  motion: registryV2.motion,
} as const;
