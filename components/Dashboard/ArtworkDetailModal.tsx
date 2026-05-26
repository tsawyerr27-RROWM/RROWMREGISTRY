import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatValueEventLabel } from "@/lib/format-registry-labels";

type ArtworkLike = {
  id?: string;
  title?: string;
  registry_id?: string | null;
  image_url?: string | null;
  year?: string | number | null;
  medium?: string | null;
  dimensions?: string | null;
  description?: string | null;
} | null;

type ValueEventLike = {
  id: string;
  value_type?: string | null;
  created_at: string;
  currency?: string | null;
  declared_value?: number | string | null;
  visibility_level?: string | null;
  note?: string | null;
};

type ArtworkDetailModalProps = {
  artwork: ArtworkLike;
  onClose: () => void;
  valueHistory: ValueEventLike[];
};

export function ArtworkDetailModal({
  artwork,
  onClose,
  valueHistory,
}: ArtworkDetailModalProps) {
  const hasScroll = valueHistory.length > 0;

  return (
    <ModalShell
      isOpen={!!artwork}
      onClose={onClose}
      tone="light"
      panelClassName="relative max-h-[90vh] w-full max-w-4xl overflow-hidden"
    >
      {artwork && (
        <div className="relative max-h-[90vh] overflow-y-auto overscroll-contain">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/14 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-400/12 blur-3xl" />
          <div className="relative p-8 md:p-10 lg:p-12">
            <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
              {artwork.image_url ? (
                <div className="liquid-glass-inset !rounded-2xl mx-auto w-full max-w-[280px] shrink-0 overflow-hidden bg-neutral-100/90 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] lg:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.image_url}
                    alt={artwork.title || ""}
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-3xl font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-4xl">
                  {artwork.registry_id ? (
                    <Link
                      href={`/artwork/${encodeURIComponent(artwork.registry_id)}`}
                      className="transition hover:text-neutral-600 hover:underline decoration-neutral-400 underline-offset-4"
                    >
                      {artwork.title}
                    </Link>
                  ) : (
                    artwork.title
                  )}
                </h2>
                <p className="mt-4 text-base text-neutral-600">
                  {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                    "–"}
                </p>
                {artwork.dimensions ? (
                  <p className="mt-2 text-sm text-neutral-500">
                    {artwork.dimensions}
                  </p>
                ) : null}
                {artwork.description ? (
                  <p className="mt-5 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                    {artwork.description}
                  </p>
                ) : null}
                {artwork.registry_id ? (
                  <div className="liquid-glass-inset !rounded-xl mt-6 inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs text-neutral-800 ring-1 ring-black/[0.04]">
                    {artwork.registry_id}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-neutral-50/95 via-white to-neutral-50/50 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] md:p-8">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-neutral-200/80 pb-5">
                <div>
                  <InfoTooltip text="Declared value events for this work." />
                  <p className="text-sm font-semibold text-neutral-500">
                    Value history
                  </p>
                </div>
              </div>

              {valueHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300/90 bg-white/60 px-5 py-8 text-center">
                  <InfoTooltip text="Record a value event to show how declared value changes over time." />
                  <p className="text-sm font-medium text-neutral-900">
                    No value history yet
                  </p>
                </div>
              ) : (
                <div className="relative min-h-0">
                  <div className="pointer-events-none absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-emerald-400/50 via-emerald-300/25 to-neutral-300/40" />
                  <div
                    className={
                      hasScroll
                        ? "max-h-[min(52vh,34rem)] space-y-4 overflow-y-auto overscroll-y-contain pl-8 pr-1 [scrollbar-color:rgba(16,185,129,0.35)_transparent] [scrollbar-width:thin]"
                        : "space-y-4 pl-8"
                    }
                  >
                    {valueHistory.map((event) => (
                      <div
                        key={event.id}
                        className="relative rounded-xl border border-neutral-200/90 bg-white p-4 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03] transition hover:border-emerald-200/80 hover:shadow-md"
                      >
                        <div className="absolute -left-[21px] top-5 z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                          <div className="min-w-0 shrink-0 sm:w-[7.5rem]">
                            <p className="text-sm font-semibold text-emerald-700/90">
                              {formatValueEventLabel(event.value_type ?? null)}
                            </p>
                            <p className="mt-1.5 text-xs text-neutral-500">
                              {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p className="text-xl font-semibold tabular-nums tracking-tight text-neutral-900">
                                {typeof event.declared_value === "number" &&
                                event.currency ? (
                                  formatCurrency(
                                    event.declared_value,
                                    String(event.currency).toUpperCase()
                                  )
                                ) : (
                                  "–"
                                )}
                              </p>
                              <span className="rounded-2xl bg-neutral-100 px-2.5 py-1 text-sm font-medium text-neutral-500">
                                {event.visibility_level || "–"}
                              </span>
                            </div>
                            {event.note ? (
                              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                                {event.note}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-2 shrink-0" aria-hidden />
          </div>
        </div>
      )}
    </ModalShell>
  );
}
