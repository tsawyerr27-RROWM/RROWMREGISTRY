/**
 * Slow, GPU-friendly pigment field for landing / about continuity.
 * Motion is CSS-only; disabled under prefers-reduced-motion via globals.css.
 */
export function HeroPigmentField({
  variant = "landing",
  bold = false,
  chromatic = false,
  className = "",
}: {
  variant?: "landing" | "about";
  /** Stronger saturation / blur — landing hero. */
  bold?: boolean;
  /** Extra amber / rose blobs + saturation — narrative “living record”. */
  chromatic?: boolean;
  className?: string;
}) {
  const fade =
    variant === "about" ? (bold ? "opacity-[0.72]" : "opacity-[0.55]") : "";

  const rootClass = [
    "hero-pigment-root",
    bold ? "hero-pigment-root--bold" : "",
    chromatic ? "hero-pigment-root--chromatic" : "",
    fade,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass.trim()} aria-hidden>
      <div className="hero-pigment-blob hero-pigment-blob--a" />
      <div className="hero-pigment-blob hero-pigment-blob--b" />
      <div className="hero-pigment-blob hero-pigment-blob--c" />
      {chromatic ? (
        <>
          <div className="hero-pigment-blob hero-pigment-blob--d" />
          <div className="hero-pigment-blob hero-pigment-blob--e" />
        </>
      ) : null}
      <div className="hero-pigment-grain" />
    </div>
  );
}
