"use client";

import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  certificateClassForTrustTier,
  certificateClassTitleKey,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  title: string;
  artist: string;
  registryId: string;
  verificationStatus: string | null | undefined;
  certificateOnFile: boolean;
  certificateRevoked: boolean;
  submittedAt: string | null;
  verifyBusy: boolean;
  onReview: () => void;
  onVerify: () => void;
  onRequestAmendment: () => void;
};

function formatSubmittedAt(iso: string | null, locale: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrganisationVerificationSlab({
  title,
  artist,
  registryId,
  verificationStatus,
  certificateOnFile,
  certificateRevoked,
  submittedAt,
  verifyBusy,
  onReview,
  onVerify,
  onRequestAmendment,
}: Props) {
  const { t, region } = useLocalePreferences();
  const tier = parseArtworkTrustTier(verificationStatus);
  const certificateClass = certificateOnFile && !certificateRevoked
    ? certificateClassForTrustTier(tier)
    : null;

  return (
    <article
      className={`${studioV2.surface.filingSheetMajor} v2-motion-hover-subtle relative overflow-hidden px-4 py-5 transition-[border-color,box-shadow] duration-300 sm:px-5 sm:py-6`}
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[var(--v2-cobalt-signal)] opacity-80"
        aria-hidden
      />
      <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="v2-type-display text-[1.35rem] leading-[1.08] tracking-[-0.02em] text-[var(--v2-ink)] sm:text-[1.45rem]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--v2-ink-muted)]">{artist}</p>
          <p className="mt-2 v2-type-mono text-[11px] tracking-[0.08em] text-[var(--v2-cool-grey)]">
            {registryId}
          </p>

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--v2-border)] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("gallery.verificationSlab.trust")}
              </span>
              <ArtworkTrustBadge verificationStatus={verificationStatus} showTooltip={false} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("gallery.verificationSlab.certificate")}
              </span>
              <span className="v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-soft)]">
                {certificateClass
                  ? t(certificateClassTitleKey(certificateClass))
                  : certificateRevoked
                    ? t("gallery.verificationSlab.certificateRevoked")
                    : t("gallery.verificationSlab.certificatePending")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("gallery.verificationSlab.submitted")}
              </span>
              <span className="v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-soft)]">
                {formatSubmittedAt(submittedAt, region.locale)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
          <button
            type="button"
            onClick={onReview}
            className="v2-cta-secondary min-h-[44px] px-4 py-2.5 text-[11px] md:min-h-0"
          >
            {t("gallery.verificationSlab.review")}
          </button>
          <button
            type="button"
            disabled={verifyBusy}
            onClick={onVerify}
            className="v2-cta-primary min-h-[44px] px-4 py-2.5 text-[11px] disabled:opacity-50 md:min-h-0"
          >
            {verifyBusy ? "…" : t("gallery.verificationSlab.verify")}
          </button>
          <button
            type="button"
            onClick={onRequestAmendment}
            className="v2-cta-secondary min-h-[44px] px-4 py-2.5 text-[11px] md:min-h-0"
          >
            {t("gallery.verificationSlab.requestAmendment")}
          </button>
        </div>
      </div>
    </article>
  );
}
