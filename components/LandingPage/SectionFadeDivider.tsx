/**
 * Soft gradient hairline between narrative blocks — avoids a hard horizontal cut.
 */
export function SectionFadeDivider() {
  return (
    <div
      className="pointer-events-none relative z-[2] mx-auto max-w-5xl px-6 py-5 md:py-7"
      aria-hidden
    >
      <div className="h-px bg-gradient-to-r from-transparent via-neutral-500/[0.06] to-transparent" />
    </div>
  );
}
