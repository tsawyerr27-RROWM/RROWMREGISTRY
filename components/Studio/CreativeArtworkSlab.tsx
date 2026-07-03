"use client";

import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  canParticipateInOwnershipFlow,
  canSelfAttestTrustTier,
  certificateClassForTrustTier,
  certificateClassTitleKey,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import type { MessageKey } from "@/lib/locale-messages";
import { semanticStampClass } from "@/lib/registry-semantic-signals";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  title: string;
  medium?: string | null;
  year?: string | number | null;
  registryId: string;
  imageUrl?: string | null;
  verificationStatus: string | null | undefined;
  priced: boolean;
  hasCompletedSale: boolean;
  artistPrimaryOnly: boolean;
  canRecordValue: boolean;
  valuationDisabledKey: MessageKey;
  onOpen: () => void;
  onSelfAttest?: () => void;
  onRecordValue?: () => void;
};

export function CreativeArtworkSlab({
  title,
  medium,
  year,
  registryId,
  imageUrl,
  verificationStatus,
  priced,
  hasCompletedSale,
  artistPrimaryOnly,
  canRecordValue,
  valuationDisabledKey,
  onOpen,
  onSelfAttest,
  onRecordValue,
}: Props) {
  const { t } = useLocalePreferences();
  const tier = parseArtworkTrustTier(verificationStatus);
  const certificateClass = certificateClassForTrustTier(tier);
  const canSelfAttest = canSelfAttestTrustTier(verificationStatus);
  const ownershipEligible = canParticipateInOwnershipFlow(verificationStatus);

  const metaLine = [year, medium].filter(Boolean).join(" · ") || "-";

  const eligibilityLabel = hasCompletedSale
    ? t("studio.artwork.eligibility.outOfHoldings")
    : artistPrimaryOnly
      ? t("studio.artwork.eligibility.artistPrimary")
      : ownershipEligible
        ? t("studio.artwork.eligibility.ownershipReady")
        : t("studio.artwork.eligibility.filingOnly");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={`${studioV2.surface.filingSheet} v2-motion-hover-subtle group relative cursor-pointer overflow-hidden px-4 py-5 transition-[border-color,box-shadow] duration-300 sm:px-5 sm:py-6`}
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[var(--v2-cobalt-signal)] opacity-80"
        aria-hidden
      />

      <div className="relative z-[1] flex gap-4 sm:gap-5">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="hidden h-[4.5rem] w-[4.5rem] shrink-0 rounded-md border border-[var(--v2-border)] object-cover sm:block"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <h3 className="v2-type-display text-[1.35rem] leading-[1.08] tracking-[-0.02em] text-[var(--v2-ink)] transition-colors duration-300 group-hover:text-[var(--v2-graphite)] sm:text-[1.45rem]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--v2-ink-muted)]">{metaLine}</p>
          <p className="mt-2 v2-type-mono text-[11px] tracking-[0.08em] text-[var(--v2-cool-grey)]">
            {registryId}
          </p>

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--v2-border)] pt-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("studio.artwork.trust")}
              </span>
              <ArtworkTrustBadge
                verificationStatus={verificationStatus}
                showTooltip={false}
                pulse={tier === "verified"}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("studio.artwork.certificate")}
              </span>
              <span className="v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-soft)]">
                {certificateClass ? t(certificateClassTitleKey(certificateClass)) : "-"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("studio.artwork.pricing")}
              </span>
              <span className="v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-soft)]">
                {priced ? t("studio.artwork.priced") : t("studio.artwork.unpriced")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--v2-border)] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={semanticStampClass(
                  hasCompletedSale ? "sale" : artistPrimaryOnly ? "registration" : "transfer"
                )}
              >
                {eligibilityLabel}
              </span>
              {canSelfAttest && onSelfAttest ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelfAttest();
                  }}
                  className="v2-cta-secondary min-h-[44px] px-3 py-2 text-[10px] md:min-h-0"
                >
                  {t("studio.artworks.selfAttestCta")}
                </button>
              ) : null}
            </div>

            {onRecordValue ? (
              <button
                type="button"
                disabled={!canRecordValue}
                title={canRecordValue ? undefined : t(valuationDisabledKey)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!canRecordValue) return;
                  onRecordValue();
                }}
                className="v2-cta-secondary shrink-0 !min-h-0 px-3 py-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {t("studio.artworks.recordValue")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
