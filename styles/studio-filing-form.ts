/**
 * Shared filing form primitives — registry language, mono labels, archive fields.
 */

import { studioV2 } from "./studio-v2";

export const studioFilingForm = {
  label: `${studioV2.type.metaLabel} mb-2.5 block`,
  field:
    "studio-filing-field w-full rounded-xl border border-[var(--v2-border)] bg-white/95 px-4 py-3.5 text-[15px] leading-snug text-[var(--v2-ink)] placeholder:text-[var(--v2-cool-grey)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition focus:outline-none focus:ring-2 focus:ring-[var(--v2-cobalt-signal-dim)] focus:border-[var(--v2-cobalt-signal-dim)]",
  select: "studio-filing-field appearance-none",
  textarea:
    "studio-filing-field min-h-[7rem] resize-none",
  sectionTitle: `${studioV2.type.sectionTitle} text-xl md:text-[1.45rem]`,
  lede: `${studioV2.type.metaValue} mt-3 max-w-2xl`,
  actions: "mt-10 flex flex-col gap-3 border-t border-[var(--v2-border)] pt-8 sm:flex-row",
  primary:
    "v2-cta-primary flex-1 !min-h-0 py-3.5 text-xs disabled:opacity-50",
  secondary:
    "v2-cta-secondary flex-1 !min-h-0 py-3.5 text-xs",
} as const;
