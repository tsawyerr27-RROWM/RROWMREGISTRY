"use client";

import { useMemo, type CSSProperties } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import { CreativeArtworkSlab } from "@/components/Studio/CreativeArtworkSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import {
  type StudioArtworksAccentId,
  studioArtworksAccentTheme,
} from "@/lib/studio-artworks-accent";
import {
  canRecordValueEvent,
  resolveValuationDisabledReason,
} from "@/lib/can-record-value-event";
import type { MessageKey } from "@/lib/locale-messages";
import { studioV2 } from "@/styles/studio-v2";

export type ArtworksListFilter =
  | "all"
  | "filed"
  | "self_attested"
  | "verified"
  | "priced"
  | "unpriced";

type ArtworksSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  artworksFilter: ArtworksListFilter;
  onArtworksFilterChange: (value: ArtworksListFilter) => void;
  onRegisterClick: () => void;
  filteredArtworks: any[];
  totalArtworkCount: number;
  onArtworkClick: (artwork: any) => void;
  onAddValueEventClick: (artwork: any) => void;
  studioArtworksAccent?: StudioArtworksAccentId;
  representingInstitutionName?: string | null;
  viewerUserId?: string | null;
  canonicalHolders?: Record<string, { userId: string | null } | null | undefined>;
  onSelfAttest?: (artwork: { id: string; title?: string }) => void;
  completedSalesByArtworkId?: Record<string, boolean>;
};

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h5" />
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
  viewerUserId,
  completedSalesByArtworkId = {},
  onSelfAttest,
}: ArtworksSectionProps) {
  const { t } = useLocalePreferences();
  const accent = useMemo(
    () => studioArtworksAccentTheme(studioArtworksAccent),
    [studioArtworksAccent]
  );
  const isTrulyEmpty = totalArtworkCount === 0;
  const noSearchMatches = totalArtworkCount > 0 && filteredArtworks.length === 0;

  return (
    <div className={`${studioV2.scope} studio-reveal space-y-8`}>
      <div className="border-b border-[var(--v2-border)] pb-5">
        <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
          {t("studio.creative.rail")}
        </p>
        <h2 className="v2-type-display mt-2 text-[1.5rem] leading-none text-[var(--v2-ink)] md:text-[1.75rem]">
          {t("studio.creative.archiveTitle")}
        </h2>
      </div>

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
                <option value="filed">{t("trust.tier.filed.label")}</option>
                <option value="self_attested">{t("trust.tier.self_attested.label")}</option>
                <option value="verified">{t("trust.tier.verified.label")}</option>
                <option value="priced">{t("studio.filter.withDeclaredValue")}</option>
                <option value="unpriced">{t("studio.filter.noDeclaredValue")}</option>
              </select>
            </>
          }
        />
      ) : null}

      {noSearchMatches ? (
        <div className="rounded-lg border border-[var(--v2-border)] bg-white/85 px-6 py-10 text-center text-[15px] text-[var(--v2-ink-muted)]">
          {t("studio.artworks.noMatches")}
        </div>
      ) : null}

      {!noSearchMatches && filteredArtworks.length > 0 ? (
        <ul className="studio-reveal-stagger space-y-3 sm:space-y-4">
          {filteredArtworks.map((artwork, index) => {
            const artworkId = String(artwork.id ?? "");
            const hasCompletedSale = Boolean(completedSalesByArtworkId[artworkId]);
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
            const valuationKey = valuationDisabledMessageKey({
              userId: viewerUserId,
              artistId: artwork.artist_id,
              hasCompletedSale,
            });

            return (
              <li key={artwork.id} style={{ "--reveal-index": index } as CSSProperties}>
                <CreativeArtworkSlab
                  title={artwork.title || t("collector.fallback.untitled")}
                  medium={artwork.medium}
                  year={artwork.year}
                  registryId={artwork.registry_id || t("studio.artworks.noRecordId")}
                  imageUrl={artwork.image_url}
                  verificationStatus={artwork.verification_status}
                  priced={Boolean(artwork.latest_value)}
                  hasCompletedSale={hasCompletedSale}
                  artistPrimaryOnly={artistPrimaryOnly}
                  canRecordValue={canRecordValue}
                  valuationDisabledKey={valuationKey}
                  onOpen={() => onArtworkClick(artwork)}
                  onSelfAttest={
                    onSelfAttest ? () => onSelfAttest(artwork) : undefined
                  }
                  onRecordValue={() => onAddValueEventClick(artwork)}
                />
              </li>
            );
          })}
        </ul>
      ) : isTrulyEmpty ? (
        <div
          className={`relative overflow-hidden rounded-lg border border-[var(--v2-border)] bg-white/90 px-8 py-12 text-center md:px-12 md:py-14`}
        >
          <div className="mx-auto flex justify-center">
            <StudioWorkMark
              className="h-12 w-12 rounded-xl"
              markWrap={accent.markWrap}
              markIcon={accent.markIcon}
            />
          </div>
          <p className={`mt-8 text-sm font-semibold ${accent.emptyLabel}`}>
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
