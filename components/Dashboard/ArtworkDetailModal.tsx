"use client";

import Link from "next/link";
import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatValueEventLabel } from "@/lib/format-registry-labels";
import { ValueEventImmutableBadge } from "@/components/Studio/ValueEventImmutableBadge";
import {
  resolveValuationDisabledReason,
  resolveValueChronologyPhase,
} from "@/lib/can-record-value-event";
import { semanticDotClass } from "@/lib/registry-semantic-signals";
import { studioV2 } from "@/styles/studio-v2";

type ArtworkLike = {
  id?: string;
  artist_id?: string | null;
  title?: string;
  registry_id?: string | null;
  verification_status?: string | null;
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
  references_event_id?: string | null;
};

type ArtworkDetailModalProps = {
  artwork: ArtworkLike;
  onClose: () => void;
  valueHistory: ValueEventLike[];
  viewerUserId?: string | null;
  hasCompletedSale?: boolean;
  canRecordValue?: boolean;
};

export function ArtworkDetailModal({
  artwork,
  onClose,
  valueHistory,
  viewerUserId,
  hasCompletedSale = false,
  canRecordValue = true,
}: ArtworkDetailModalProps) {
  const { t } = useLocalePreferences();

  if (!artwork) {
    return null;
  }

  const hasScroll = valueHistory.length > 0;
  const valuePhase = resolveValueChronologyPhase({ hasCompletedSale });
  const valuationDisabledKey =
    resolveValuationDisabledReason({
      userId: viewerUserId,
      artistId: artwork.artist_id,
      hasCompletedSale,
    }) === "artist_primary_only"
      ? "studio.artworks.valuationArtistPrimaryOnly"
      : "studio.artworks.valuationMarketDriven";

  return (
    <ModalShell
      isOpen
      onClose={onClose}
      tone="light"
      panelClassName={`${studioV2.scope} relative max-h-[90vh] w-full max-w-4xl overflow-hidden`}
    >
      <div className="relative max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="relative p-8 md:p-10 lg:p-12">
          <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            {artwork.image_url ? (
              <div className="mx-auto w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl border border-[var(--v2-border)] bg-[var(--v2-paper-sunk,#efe9df)] lg:mx-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artwork.image_url}
                  alt={artwork.title || ""}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("studio.shell.onFile")}
              </p>
              <h2 className="v2-type-display mt-2 text-[1.75rem] leading-[1.08] text-[var(--v2-ink)] md:text-[2rem]">
                {artwork.registry_id ? (
                  <Link
                    href={`/artwork/${encodeURIComponent(artwork.registry_id)}`}
                    className="transition hover:text-[var(--v2-ink-muted)] hover:underline decoration-[var(--v2-border-strong)] underline-offset-4"
                  >
                    {artwork.title}
                  </Link>
                ) : (
                  artwork.title
                )}
              </h2>
              <p className="mt-4 text-[15px] text-[var(--v2-ink-muted)]">
                {[artwork.year, artwork.medium].filter(Boolean).join(" · ") || "–"}
              </p>
              {artwork.verification_status ? (
                <div className="mt-4">
                  <ArtworkTrustBadge verificationStatus={artwork.verification_status} />
                </div>
              ) : null}
              <p className="mt-3">
                <span className="v2-type-mono inline-flex rounded-md border border-[var(--v2-border)] bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--v2-violet-signal,#6d28d9)]">
                  {valuePhase === "price_discovery"
                    ? t("studio.artworks.phaseBadge.priceDiscovery")
                    : t("studio.artworks.phaseBadge.marketEvidence")}
                </span>
              </p>
              {artwork.dimensions ? (
                <p className="mt-2 text-[14px] text-[var(--v2-ink-muted)]">
                  {artwork.dimensions}
                </p>
              ) : null}
              {artwork.description ? (
                <p className="mt-5 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--v2-ink-muted)]">
                  {artwork.description}
                </p>
              ) : null}
              {artwork.registry_id ? (
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--v2-border)] bg-white/85 px-4 py-2.5 font-mono text-xs text-[var(--v2-ink)]">
                  {artwork.registry_id}
                </div>
              ) : null}
            </div>
          </div>

          <div className={`${studioV2.surface.filingSheet} p-6 md:p-8`}>
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--v2-border)] pb-5">
              <div>
                <InfoTooltip text="Declared value events for this work." />
                <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                  {t("studio.artworkDetail.valueHistory")}
                </p>
              </div>
            </div>

            {!canRecordValue ? (
              <p className="mb-4 text-[13px] leading-relaxed text-[var(--v2-ink-muted)]">
                {t(valuationDisabledKey)}
              </p>
            ) : null}

            {valueHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--v2-border)] bg-white/70 px-5 py-8 text-center">
                <InfoTooltip text="Record a value event to show how declared value changes over time." />
                <p className="text-[15px] font-medium text-[var(--v2-ink)]">
                  {t("studio.artworkDetail.noValueHistory")}
                </p>
              </div>
            ) : (
              <div className="relative min-h-0">
                <div className="pointer-events-none absolute bottom-2 left-[11px] top-2 w-px bg-[var(--v2-border-strong)]" />
                <div
                  className={
                    hasScroll
                      ? "max-h-[min(52vh,34rem)] space-y-4 overflow-y-auto overscroll-y-contain pl-8 pr-1 [scrollbar-color:rgba(15,23,42,0.12)_transparent] [scrollbar-width:thin]"
                      : "space-y-4 pl-8"
                  }
                >
                  {valueHistory.map((event) => (
                    <div
                      key={event.id}
                      className={`${studioV2.motion.hover} relative rounded-xl border border-[var(--v2-border)] bg-white/90 p-4`}
                    >
                      <div
                        className={`absolute -left-[21px] top-5 z-10 h-2.5 w-2.5 rounded-full border-2 border-white ${semanticDotClass("valuation")}`}
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0 shrink-0 sm:w-[7.5rem]">
                          <p className="v2-type-mono text-[10px] uppercase tracking-[0.12em] text-[var(--v2-violet-signal,#6d28d9)]">
                            {formatValueEventLabel(event.value_type ?? null)}
                          </p>
                          <div className="mt-1.5">
                            <ValueEventImmutableBadge />
                          </div>
                          <p className="mt-1.5 text-xs text-[var(--v2-ink-muted)]">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-xl font-semibold tabular-nums tracking-tight text-[var(--v2-ink)]">
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
                            <span className="v2-type-mono rounded-md border border-[var(--v2-border)] bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--v2-ink-muted)]">
                              {event.visibility_level || "–"}
                            </span>
                          </div>
                          {event.note ? (
                            <p className="mt-3 text-[15px] leading-relaxed text-[var(--v2-ink-muted)]">
                              {event.note}
                            </p>
                          ) : null}
                          {event.references_event_id ? (
                            <p className="mt-2 text-[12px] text-[var(--v2-ink-muted)]">
                              Corrects filing {event.references_event_id.slice(0, 8)}…
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
    </ModalShell>
  );
}
