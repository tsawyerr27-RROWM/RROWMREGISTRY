/**
 * Enterprise marketing typography — restrained labels and measure.
 * Editorial hierarchy: serif headings + sentence-case subcopy (no eyebrow kickers).
 */

/** Section lead — sentence subcopy below a heading */
export const editorialSectionLeadOnLight =
  "text-sm leading-relaxed text-neutral-600";

/** Softer lead on tinted / secondary bands */
export const editorialSectionLeadMuted =
  "text-sm leading-relaxed text-neutral-500";

/** Lead on dark / ink chapters */
export const editorialSectionLeadOnInk =
  "text-sm leading-relaxed text-violet-100/80";

/** Accent lead on light marketing panels */
export const editorialSectionLeadAccentCyan =
  "text-sm leading-relaxed text-cyan-900/70";

/** Zone / chapter label — sentence case, not uppercase micro-type */
export const editorialOverlineOnLight =
  "text-sm font-medium text-neutral-500";

/** @deprecated Use editorialOverlineOnLight */
export const editorialEyebrowOnLight = editorialOverlineOnLight;

/** @deprecated Use editorialSectionLeadMuted */
export const editorialEyebrowOnLightMuted = editorialSectionLeadMuted;

/** @deprecated Use editorialSectionLeadOnInk */
export const editorialEyebrowOnInk = editorialSectionLeadOnInk;

/** @deprecated Use editorialSectionLeadAccentCyan */
export const editorialEyebrowAccentCyan = editorialSectionLeadAccentCyan;

/** Comfortable reading width for body columns */
export const editorialMeasure = "max-w-[min(100%,42rem)]";
