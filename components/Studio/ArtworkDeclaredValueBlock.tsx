import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
  amount: number | null | undefined;
  currency?: string | null;
  /** Studio artworks grid — accent-tinted panel */
  variant?: "featured" | "compact";
  /** Optional accent shell classes from `studioArtworksAccentTheme` */
  shellClassName?: string;
  className?: string;
};

/**
 * Latest declared value on artwork cards — archival emphasis, tabular amount.
 */
export function ArtworkDeclaredValueBlock({
  amount,
  currency = "USD",
  variant = "featured",
  shellClassName = "",
  className = "",
}: Props) {
  if (amount == null || Number.isNaN(Number(amount))) return null;

  const code = String(currency || "USD").toUpperCase();
  const formatted = formatCurrency(Number(amount), code);

  if (variant === "compact") {
    return (
      <div
        className={`mt-3 overflow-hidden rounded-xl border border-neutral-200/90 bg-gradient-to-br from-neutral-50/90 via-white to-white px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)] ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
            Declared
          </p>
          <span className="rounded-md bg-neutral-100/90 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide text-neutral-600 ring-1 ring-neutral-200/80">
            {code}
          </span>
        </div>
        <p className="mt-1.5 font-serif text-lg font-normal tabular-nums leading-none tracking-tight text-neutral-950">
          {formatted}
        </p>
      </div>
    );
  }

  const shell =
    shellClassName ||
    "border-neutral-200/90 bg-gradient-to-br from-neutral-50/80 via-white to-white ring-neutral-900/[0.04]";

  return (
    <div
      className={`relative mt-3 overflow-hidden rounded-xl border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),0_8px_24px_-16px_rgba(15,23,42,0.06)] ring-1 ${shell} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/[0.07] to-transparent"
        aria-hidden
      />
      <div className="relative px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Declared on file
          </p>
          <span className="shrink-0 rounded-md bg-white/80 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-neutral-600 ring-1 ring-neutral-200/90 backdrop-blur-sm">
            {code}
          </span>
        </div>
        <p
          className="mt-2 font-serif text-[1.65rem] font-normal leading-none tabular-nums tracking-tight text-neutral-950 md:text-[1.75rem]"
          title="Latest declared amount on file."
        >
          {formatted}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-neutral-500">
          Most recent value filing for this work.
        </p>
      </div>
    </div>
  );
}
