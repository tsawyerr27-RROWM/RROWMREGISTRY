import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";

type Props = {
  layers: ParticipationLayer[];
  /** Light = public catalogue pages; dark = stewardship / dark heroes */
  variant?: "light" | "dark";
  className?: string;
  showFootnote?: boolean;
};

function chipClass(state: ParticipationLayer["state"], variant: "light" | "dark") {
  const base =
    "inline-flex max-w-full items-center rounded-md px-2.5 py-1 text-center text-[11px] font-medium leading-[1.2]";
  if (variant === "dark") {
    switch (state) {
      case "on_file":
        return `${base} bg-emerald-500/15 text-emerald-100/90 ring-1 ring-emerald-400/20`;
      case "pending":
        return `${base} bg-white/10 text-white/70 ring-1 ring-white/15`;
      case "neutral":
      default:
        return `${base} bg-white/8 text-white/65 ring-1 ring-white/12`;
    }
  }
  switch (state) {
    case "on_file":
      return `${base} border border-emerald-200/70 bg-emerald-50/80 text-emerald-950/90`;
    case "pending":
      return `${base} border border-neutral-200/80 bg-neutral-50/95 text-neutral-700`;
    case "neutral":
    default:
      return `${base} border border-neutral-200/80 bg-neutral-50/95 text-neutral-700`;
  }
}

export function ParticipationLayersStrip({
  layers,
  variant = "light",
  className = "",
  showFootnote = true,
}: Props) {
  if (layers.length === 0) return null;

  const underReview = layers.some((l) => l.id === "record_review");

  return (
    <div
      className={`rounded-2xl border p-4 md:p-5 ${
        variant === "dark"
          ? "border-white/10 bg-white/[0.04]"
          : "border-black/[0.06] bg-gradient-to-br from-neutral-50/95 to-white/90 shadow-sm"
      } ${className}`}
      aria-label="Documentary layers on file"
    >
      <p
        className={`text-[11px] font-medium uppercase tracking-[0.14em] ${
          variant === "dark" ? "text-white/45" : "text-neutral-500"
        }`}
      >
        {CANONICAL_RECORD_PHRASES.canonicalRecordOnFile}
      </p>
      <p
        className={`mt-1 text-[12px] leading-relaxed ${
          variant === "dark" ? "text-white/50" : "text-neutral-600"
        }`}
      >
        {CANONICAL_RECORD_PHRASES.recordDeepensOverTime}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {layers.map((layer) => (
          <li key={layer.id}>
            <span className={chipClass(layer.state, variant)} title={layer.label}>
              {layer.label}
            </span>
          </li>
        ))}
      </ul>
      {showFootnote ? (
        <p
          className={`mt-3 text-[11px] leading-relaxed ${
            variant === "dark" ? "text-white/40" : "text-neutral-500"
          }`}
        >
          {underReview
            ? CANONICAL_RECORD_PHRASES.priorContributionsRemainVisible
            : CANONICAL_RECORD_PHRASES.notApprovalWorkflow}
        </p>
      ) : null}
    </div>
  );
}
