"use client";

import Link from "next/link";
import type { CSSProperties, RefObject } from "react";

import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { OrganisationVerificationSlab } from "@/components/Studio/OrganisationVerificationSlab";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldOrganisationHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { studioV2 } from "@/styles/studio-v2";

export type OrganisationVerificationArtwork = {
  id: string;
  title: string | null;
  registry_id: string | null;
  artist_id: string | null;
  catalogue_artist_name?: string | null;
  verification_status: string | null;
  created_at: string | null;
};

type Props = {
  galleryVerified: boolean;
  verifyQueue: OrganisationVerificationArtwork[];
  verifyBusy: string | null;
  artistNameById: Map<string, string>;
  hasLiveCertificateByArtworkId: Record<string, boolean>;
  hasRevokedCertificateByArtworkId: Record<string, boolean>;
  onReview: (artworkId: string) => void;
  onVerify: (artworkId: string) => void;
  onRequestAmendment: () => void;
  sectionRef?: RefObject<HTMLElement | null>;
  id?: string;
  onViewAll?: () => void;
  maxVisible?: number;
};

export function OrganisationVerificationCommand({
  galleryVerified,
  verifyQueue,
  verifyBusy,
  artistNameById,
  hasLiveCertificateByArtworkId,
  hasRevokedCertificateByArtworkId,
  onReview,
  onVerify,
  onRequestAmendment,
  sectionRef,
  id = "gallery-verification-queue",
  onViewAll,
  maxVisible,
}: Props) {
  const { t } = useLocalePreferences();
  const visibleQueue =
    typeof maxVisible === "number" ? verifyQueue.slice(0, maxVisible) : verifyQueue;
  const hiddenCount = verifyQueue.length - visibleQueue.length;

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`studio-reveal scroll-mt-24 ${studioV2.scope}`}
    >
      <div className={`${studioV2.surface.filingSheetMajor} px-5 py-6 sm:px-7 sm:py-8`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <InfoTooltip text={t("gallery.verification.tooltip")} theme="light" />
            <h2 className="mt-2 font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-[var(--v2-ink)] md:text-[1.65rem]">
              {t("gallery.organisation.verificationCommand")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--v2-ink-muted)]">
              {t("gallery.organisation.verificationCommandBody")}
            </p>
          </div>
          {verifyQueue.length > 0 ? (
            <span className="studio-execution-stamp studio-execution-stamp--active">
              {fillMessage(t("gallery.organisation.queueCount"), {
                count: String(verifyQueue.length),
              })}
            </span>
          ) : null}
        </div>

        {!galleryVerified ? (
          <p className="mt-6 text-[13px] leading-relaxed text-[var(--v2-ink-muted)]">
            {t("gallery.verification.notVerifiedInstitution")}
          </p>
        ) : verifyQueue.length === 0 ? (
          <p className="mt-6 text-[13px] text-[var(--v2-cool-grey)]">
            {t("gallery.verification.nothingAwaiting")}
          </p>
        ) : (
          <ul className="studio-reveal-stagger mt-6 space-y-3">
            {visibleQueue.map((w, index) => {
              const artist =
                w.catalogue_artist_name?.trim() ||
                (w.artist_id ? artistNameById.get(w.artist_id) : null) ||
                t("gallery.fallback.artist");

              return (
                <li key={w.id} style={{ "--reveal-index": index } as CSSProperties}>
                  <OrganisationVerificationSlab
                    title={(w.title || "").trim() || t("gallery.fallback.untitled")}
                    artist={artist}
                    registryId={w.registry_id?.trim() || "-"}
                    verificationStatus={w.verification_status}
                    certificateOnFile={Boolean(hasLiveCertificateByArtworkId[w.id])}
                    certificateRevoked={Boolean(hasRevokedCertificateByArtworkId[w.id])}
                    submittedAt={w.created_at}
                    verifyBusy={verifyBusy === w.id}
                    onReview={() => onReview(w.id)}
                    onVerify={() => onVerify(w.id)}
                    onRequestAmendment={onRequestAmendment}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {hiddenCount > 0 && typeof onViewAll === "function" ? (
          <div className="mt-5 border-t border-[var(--v2-border)] pt-5">
            <button type="button" onClick={onViewAll} className="v2-cta-secondary px-4 py-2.5 text-[11px]">
              {fillMessage(t("gallery.organisation.viewFullQueue"), {
                count: String(verifyQueue.length),
              })}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
