"use client";

import { useMemo } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { workspace } from "@/styles/workspace-design";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import {
  type StudioArtworksAccentId,
  studioArtworksAccentTheme,
} from "@/lib/studio-artworks-accent";
import { ArtworkDeclaredValueBlock } from "@/components/Studio/ArtworkDeclaredValueBlock";
import {
  canRecordValueEvent,
  resolveValuationDisabledReason,
  resolveValueChronologyPhase,
} from "@/lib/can-record-value-event";
import type { MessageKey } from "@/lib/locale-messages";
import { studioCatalogueSheetClass, studioV2 } from "@/styles/studio-v2";
import { semanticStampClass } from "@/lib/registry-semantic-signals";

export type ArtworksListFilter =
  | "all"
  | "verified"
  | "unverified"
  | "priced"
  | "unpriced";

type ArtworksSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  artworksFilter: ArtworksListFilter;
  onArtworksFilterChange: (value: ArtworksListFilter) => void;
  onRegisterClick: () => void;
  filteredArtworks: any[];
  /** Total artworks before search filter — drives true empty vs no matches */
  totalArtworkCount: number;
  onArtworkClick: (artwork: any) => void;
  onAddValueEventClick: (artwork: any) => void;
  /** Accent for left rail + hairline (from account → `artists.studio_artworks_accent`) */
  studioArtworksAccent?: StudioArtworksAccentId;
  /** Gallery name for represented works — shows info tooltip on price */
  representingInstitutionName?: string | null;
  viewerUserId?: string | null;
  canonicalHolders?: Record<string, { userId: string | null } | null | undefined>;
  completedSalesByArtworkId?: Record<string, boolean>;
};

function valuePhaseBadgeLabel(
  phase: "price_discovery" | "market_evidence",
  t: (key: MessageKey) => string
): string {
  return phase === "price_discovery"
    ? t("studio.artworks.phaseBadge.priceDiscovery")
    : t("studio.artworks.phaseBadge.marketEvidence");
}

function valuationDisabledMessageKey(args: {
  userId?: string | null;
  artistId?: string | null;
  hasCompletedSale?: boolean;
}): MessageKey {
  return resolveValuationDisabledReason(args) === "artist_primary_only"
    ? "studio.artworks.valuationArtistPrimaryOnly"
    : "studio.artworks.valuationMarketDriven";
}

function StudioWorkMark({
  className = "",
  markWrap,
  markIcon,
}: {
  className?: string;
  markWrap: string;
  markIcon: string;
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${markWrap} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ${className}`}
      aria-hidden
    >
      <svg
        className={`h-4 w-4 ${markIcon}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h8M8 16h5"
        />
      </svg>
    </div>
  );
}

export function ArtworksSection({
  searchQuery,
  onSearchChange,
  artworksFilter,
  onArtworksFilterChange,
  onRegisterClick,
  filteredArtworks,
  totalArtworkCount,
  onArtworkClick,
  onAddValueEventClick,
  studioArtworksAccent = "violet",
  representingInstitutionName,
  viewerUserId,
  canonicalHolders = {},
  completedSalesByArtworkId = {},
}: ArtworksSectionProps) {
  const { t } = useLocalePreferences();
  const accent = useMemo(
    () => studioArtworksAccentTheme(studioArtworksAccent),
    [studioArtworksAccent]
  );
  const isTrulyEmpty = totalArtworkCount === 0;
  const noSearchMatches =
    totalArtworkCount > 0 && filteredArtworks.length === 0;

  return (
    <div className={`${studioV2.scope} space-y-12`}>
      {!isTrulyEmpty ? (
        <StudioSearchRow
          tone="light"
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={t("studio.search.artworks")}
          aside={
            <>
              <label className="sr-only" htmlFor="artworks-filter">
                {t("studio.filter.artworks")}
              </label>
              <select
                id="artworks-filter"
                value={artworksFilter}
                onChange={(e) =>
                  onArtworksFilterChange(e.target.value as ArtworksListFilter)
                }
                className={studioFilterSelectClass("light")}
              >
                <option value="all">{t("registry.filters.allWorks")}</option>
                <option value="verified">{t("studio.filter.verifiedOnly")}</option>
                <option value="unverified">{t("studio.filter.notVerified")}</option>
                <option value="priced">{t("studio.filter.withDeclaredValue")}</option>
                <option value="unpriced">{t("studio.filter.noDeclaredValue")}</option>
              </select>
            </>
          }
        />
      ) : null}

      {noSearchMatches ? (
        <div
          className={`rounded-2xl border border-neutral-300/90 bg-gradient-to-br from-white via-neutral-50/90 ${accent.noMatchTo} px-8 py-12 text-center text-[15px] text-neutral-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_24px_-12px_rgba(0,0,0,0.06)]`}
        >
          {t("studio.artworks.noMatches")}
        </div>
      ) : null}

      {!noSearchMatches && filteredArtworks.length > 0 ? (
        <div className={workspace.space.grid}>
          {filteredArtworks.map((artwork) => {
            const artworkId = String(artwork.id ?? "");
            const hasCompletedSale = Boolean(completedSalesByArtworkId[artworkId]);
            const valuePhase = resolveValueChronologyPhase({ hasCompletedSale });
            const phaseBadge = valuePhaseBadgeLabel(valuePhase, t);
            const canRecordValue = canRecordValueEvent({
              userId: viewerUserId,
              artworkId,
              artistId: artwork.artist_id,
              hasCompletedSale,
            });
            const artistPrimaryOnly =
              !hasCompletedSale &&
              resolveValuationDisabledReason({
                userId: viewerUserId,
                artistId: artwork.artist_id,
                hasCompletedSale,
              }) === "artist_primary_only";
            const sheetClass = studioCatalogueSheetClass({
              hasCompletedSale,
              artistPrimaryOnly,
            });

            return (
            <div
              key={artwork.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onArtworkClick(artwork);
                }
              }}
              className={`${sheetClass} ${workspace.card.link} v2-motion-hover-subtle`}
              onClick={() => onArtworkClick(artwork)}
            >
              <div className={workspace.card.media}>
                {artwork.image_url ? (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className={workspace.card.mediaImg}
                  />
                ) : (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center gap-2 ${accent.placeholderRadial}`}
                  >
                    <svg
                      className={`h-14 w-14 ${accent.placeholderIcon}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={0.75}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-neutral-500">
                      {t("registry.card.noImage")}
                    </span>
                  </div>
                )}
              </div>

              <div className={workspace.card.surface}>
                <p className={studioV2.type.monoId}>
                  {artwork.registry_id || t("studio.artworks.noRecordId")}
                </p>
                <h3 className={`${workspace.type.cardTitle} mt-2`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onArtworkClick(artwork);
                    }}
                    className={`text-left ${accent.titleHover}`}
                  >
                    {artwork.title}
                  </button>
                </h3>
                <p className={`mt-1 ${workspace.type.cardArtist}`}>
                  {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                    "–"}
                </p>
              </div>

              <div className={workspace.card.reveal}>
                <div className="flex flex-wrap items-center gap-2">
                  {hasCompletedSale ? (
                    <span className={semanticStampClass("sale")}>
                      Out of holdings
                    </span>
                  ) : artistPrimaryOnly ? (
                    <span className={semanticStampClass("registration")}>
                      Artist primary
                    </span>
                  ) : (
                    <span className={semanticStampClass("transfer")}>
                      In holdings
                    </span>
                  )}
                  {artwork.verification_status === "verified" ? (
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80"
                      title={t("studio.artworks.verifiedTooltip")}
                    >
                      <span aria-hidden>✓</span>
                      {t("studio.artworks.verified")}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/90">
                      {t("studio.artworks.notVerified")}
                    </span>
                  )}
                  <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-900 ring-1 ring-violet-200/90">
                    {phaseBadge}
                  </span>
                </div>

                <ArtworkDeclaredValueBlock
                  amount={artwork.latest_value}
                  currency={artwork.latest_currency}
                  shellClassName={accent.valueShell}
                  managedByInstitution={
                    artwork.filing_gallery_id && representingInstitutionName
                      ? representingInstitutionName
                      : null
                  }
                />

                <div className="mt-auto flex flex-shrink-0 items-center justify-between gap-3 border-t border-[var(--v2-border)] pt-4">
                  <div className="min-w-0">
                    {artwork.registry_id ? (
                      <span className={`${studioV2.type.monoId} inline-block max-w-full truncate`}>
                        {artwork.registry_id}
                      </span>
                    ) : (
                      <span className={studioV2.type.monoId}>
                        {t("studio.artworks.noRecordId")}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!canRecordValue}
                    title={
                      canRecordValue
                        ? undefined
                        : t(
                            valuationDisabledMessageKey({
                              userId: viewerUserId,
                              artistId: artwork.artist_id,
                              hasCompletedSale,
                            })
                          )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canRecordValue) return;
                      onAddValueEventClick(artwork);
                    }}
                    className="v2-cta-secondary shrink-0 !min-h-0 px-3 py-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {t("studio.artworks.recordValue")}
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : isTrulyEmpty ? (
        <div
          className={`relative overflow-hidden rounded-2xl border border-neutral-200/95 bg-gradient-to-b from-white ${accent.emptyVia} to-neutral-50/90 px-10 py-14 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)] md:px-16 md:py-16`}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${accent.emptyHairline} to-transparent`}
            aria-hidden
          />
          <div className="mx-auto flex justify-center">
            <StudioWorkMark
              className="h-12 w-12 rounded-xl"
              markWrap={accent.markWrap}
              markIcon={accent.markIcon}
            />
          </div>
          <p
            className={`mt-8 text-sm font-semibold ${accent.emptyLabel}`}
          >
            {t("studio.artworks.emptyLabel")}
          </p>
          <InfoTooltip text="Register a piece to open its catalogue record and chronology. Later filings you add stay on the same entry." />
          <h3 className="mt-3 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
            {t("studio.artworks.emptyTitle")}
          </h3>
          <div className="mt-10 flex justify-center">
            <ExperienceEmptyStateButton
              label={t("studio.registerArtwork")}
              onClick={onRegisterClick}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
