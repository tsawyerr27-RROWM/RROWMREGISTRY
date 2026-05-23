/**
 * Soft gradient hairline between narrative blocks — avoids a hard horizontal cut.
 */
export function SectionFadeDivider() {
  return (
    <div
      className="pointer-events-none relative z-[2] mx-auto max-w-5xl px-6 py-3 md:py-4"
      aria-hidden
    >
      <div className="h-px rrowm-atmo-divider__line" />
    </div>
  );
}
