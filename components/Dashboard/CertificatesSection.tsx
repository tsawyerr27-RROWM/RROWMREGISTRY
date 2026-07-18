"use client";

import { useMemo, type CSSProperties } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import { ArchiveGalleryGrid } from "@/components/Studio/ArchiveGalleryGrid";
import {
  StudioViewToggle,
  useStudioViewMode,
} from "@/components/Studio/StudioViewToggle";
import { CreativeArtworkSlab } from "@/components/Studio/CreativeArtworkSlab";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { semanticStampClass } from "@/lib/registry-semantic-signals";
import { studioV2 } from "@/styles/studio-v2";

export type CertificatesListFilter = "all" | "with_image" | "without_image";

type CertificatesSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  certificatesFilter: CertificatesListFilter;
  onCertificatesFilterChange: (value: CertificatesListFilter) => void;
  filteredCertificates: any[];
  totalCertificateCount: number;
  filedArtworkCount: number;
  onArtworkClick: (artwork: any) => void;
  onOpenCertificateOverview: (registryId: string) => void;
  onRegisterClick: () => void;
  onAttestClick: () => void;
};

export function CertificatesSection({
  searchQuery,
  onSearchChange,
  certificatesFilter,
  onCertificatesFilterChange,
  filteredCertificates,
  totalCertificateCount,
  filedArtworkCount,
  onArtworkClick,
  onOpenCertificateOverview: _onOpenCertificateOverview,
  onRegisterClick,
  onAttestClick,
}: CertificatesSectionProps) {
  const { t } = useLocalePreferences();
  const [certificatesView, setCertificatesView, certificatesViewReady] = useStudioViewMode(
    "creative.certificatesView"
  );
  const isTrulyEmpty = totalCertificateCount === 0;
  const emptyAwaitingVerification = isTrulyEmpty && filedArtworkCount > 0;
  const noMatches =
    totalCertificateCount > 0 && filteredCertificates.length === 0;

  const header = useMemo(
    () => (
      <div className="border-b border-[var(--v2-border)] pb-5">
        <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
          {t("studio.shell.onFile")}
        </p>
        <h2 className="v2-type-display mt-2 text-[1.5rem] leading-none text-[var(--v2-ink)] md:text-[1.75rem]">
          {t("studio.nav.certificates")}
        </h2>
      </div>
    ),
    [t]
  );

  return (
    <div className={`${studioV2.scope} studio-reveal space-y-8`}>
      {header}

      {!isTrulyEmpty ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <StudioSearchRow
            tone="light"
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder={t("studio.search.certificates")}
            aside={
              <>
                <label className="sr-only" htmlFor="certificates-filter">
                  {t("studio.filter.certificates")}
                </label>
                <select
                  id="certificates-filter"
                  value={certificatesFilter}
                  onChange={(e) =>
                    onCertificatesFilterChange(
                      e.target.value as CertificatesListFilter
                    )
                  }
                  className={studioFilterSelectClass("light")}
                >
                  <option value="all">{t("studio.certificates.all")}</option>
                  <option value="with_image">
                    {t("studio.certificates.withImage")}
                  </option>
                  <option value="without_image">
                    {t("studio.certificates.withoutImage")}
                  </option>
                </select>
              </>
            }
          />
          {certificatesViewReady ? (
            <StudioViewToggle
              mode={certificatesView}
              onChange={setCertificatesView}
              label={t("studio.archive.viewLabel")}
              ledgerLabel={t("studio.archive.viewLedger")}
              archiveLabel={t("studio.archive.viewArchive")}
            />
          ) : (
            <div
              className="h-9 w-36 rounded-lg border border-[var(--v2-border)] bg-white/70"
              aria-hidden
            />
          )}
        </div>
      ) : null}

      {noMatches ? (
        <div className="rounded-lg border border-[var(--v2-border)] bg-white/85 px-6 py-10 text-center text-[15px] text-[var(--v2-ink-muted)]">
          {t("studio.certificates.noMatches")}
        </div>
      ) : null}

      {!noMatches &&
      filteredCertificates.length > 0 &&
      certificatesViewReady &&
      certificatesView === "archive" ? (
        <ArchiveGalleryGrid
          items={filteredCertificates.map((artwork) => ({
            id: String(artwork.id),
            title: artwork.title || t("collector.fallback.untitled"),
            subtitle: [artwork.year, artwork.medium].filter(Boolean).join(" · ") || undefined,
            meta: artwork.registry_id || undefined,
            imageUrl: artwork.image_url,
            onClick: () => onArtworkClick(artwork),
            badge: (
              <span
                className={`${semanticStampClass("certification")} rounded-full px-2 py-0.5 v2-type-mono text-[8px] uppercase tracking-[0.14em]`}
              >
                {t("studio.artworks.verified")}
              </span>
            ),
          }))}
        />
      ) : null}

      {!noMatches &&
      filteredCertificates.length > 0 &&
      certificatesViewReady &&
      certificatesView === "ledger" ? (
        <ul className="studio-reveal-stagger space-y-3 sm:space-y-4">
          {filteredCertificates.map((artwork, index) => (
            <li key={artwork.id} style={{ "--reveal-index": index } as CSSProperties}>
              <CreativeArtworkSlab
                title={artwork.title || t("collector.fallback.untitled")}
                medium={artwork.medium}
                year={artwork.year}
                registryId={artwork.registry_id || t("studio.artworks.noRecordId")}
                imageUrl={artwork.image_url}
                verificationStatus={artwork.verification_status ?? "verified"}
                priced={Boolean(artwork.latest_value)}
                hasCompletedSale={false}
                artistPrimaryOnly={false}
                canRecordValue={false}
                valuationDisabledKey="studio.artworks.valuationMarketDriven"
                onOpen={() => onArtworkClick(artwork)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {isTrulyEmpty ? (
        <div className="rounded-lg border border-[var(--v2-border)] bg-white/90 px-8 py-12 text-center md:px-12 md:py-14">
          <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
            {t("studio.certificates.emptyLabel")}
          </p>
          <InfoTooltip text="When a work is verified, its certificate appears here as a permanent record you can open and share." />
          <h3 className="mt-3 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-[var(--v2-ink)] md:text-[1.85rem]">
            {t("studio.certificates.emptyTitle")}
          </h3>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--v2-ink-muted)]">
            {emptyAwaitingVerification
              ? t("studio.certificates.emptyBodyAwaitingVerify")
              : t("studio.certificates.emptyBody")}
          </p>
          <div className="mt-10 flex justify-center">
            <ExperienceEmptyStateButton
              label={
                emptyAwaitingVerification
                  ? t("studio.certificates.emptyCtaAttest")
                  : t("studio.registerArtwork")
              }
              onClick={emptyAwaitingVerification ? onAttestClick : onRegisterClick}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
