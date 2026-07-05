"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { RightsLedgerSection } from "@/components/Rights/RightsLedgerSection";
import { ArchivalProvenanceTimeline } from "@/components/provenance/ArchivalProvenanceTimeline";
import { VerificationShareControl } from "@/components/Registry/VerificationShareControl";
import { RegistryTrustPanel } from "@/components/Registry/RegistryTrustPanel";
import { RegistryTrustTierStrip } from "@/components/Registry/RegistryTrustTierStrip";
import { RegistryRecordCertificateActions } from "@/components/Registry/RegistryRecordCertificateActions";
import { RegistryIntelligencePanel } from "@/components/Registry/RegistryIntelligencePanel";
import { InviteRecordStewardControl } from "@/components/Registry/InviteRecordStewardControl";
import { PublicClaimOwnership } from "@/components/Registry/PublicClaimOwnership";
import { RegistryTechnicalDetails } from "@/components/Registry/RegistryTechnicalDetails";
import { ShareRecordButton } from "@/components/Registry/ShareRecordButton";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useRegistryCatalogueShell } from "@/components/Registry/RegistryCatalogueShellContext";
import { buildStudioNewDealHref } from "@/lib/deal-create-nav";
import {
  acquisitionDealWorkLabel,
  resolveAcquisitionDealCounterparty,
  shouldShowAcquisitionDealCta,
} from "@/lib/acquisition-deal-counterparty";
import type { OwnershipClaimPath } from "@/lib/ownership-claim-eligibility";
import { fillMessage } from "@/lib/locale-messages";
import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import type { ProvenanceInsight } from "@/lib/provenance-insights";
import type { RightsLedgerGrouped } from "@/lib/rights-ledger";
import {
  ownershipStatusBadge,
  type OwnershipSystemStatus,
} from "@/lib/ownership-ledger";
import { translateProvenanceInsight } from "@/lib/archival-provenance-i18n";
import { buildCertificateShareContext } from "@/lib/certificate-share";
import { buildVerificationShareContext } from "@/lib/verification-share";
import { fieldCollectorHref, fieldCreativeHref, fieldRecordHref } from "@/lib/field-nav";
import {
  certificateClassForTrustTier,
  certificateClassTitleKey,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import {
  computeRegistryTrustPresentation,
  isRecordVerified,
} from "@/lib/registry-trust-model";
import { OwnershipEventsChronology } from "@/components/Registry/OwnershipEventsChronology";
import type { OwnershipTimelineEntry } from "@/lib/canonical-ownership-engine";
import { computeRegistryIntelligence } from "@/lib/registry-intelligence";
import { RegistryRecordHero } from "@/components/Registry/RegistryRecordHero";
import { registryV2 } from "@/styles/registry-v2";

export type PublicRegistryRecordProps = {
  artwork: {
    id: string;
    title: string | null;
    registry_id: string;
    year: string | number | null;
    medium: string | null;
    dimensions: string | null;
    description: string | null;
    image_url: string | null;
    verification_status: string | null;
    verification_hash: string | null;
    timeline_hash: string | null;
    is_locked: boolean | null;
    created_at?: string | null;
  };
  artistName: string;
  artistUserId: string | null;
  artistSlug: string | null;
  verificationGalleryName: string | null;
  edition: {
    is_unique: boolean | null;
    edition_number: number | null;
    edition_total: number | null;
  } | null;
  hasCertificate: boolean;
  certRevoked: boolean;
  revokedReason: string | null;
  ownershipStatus: OwnershipSystemStatus;
  currentOwner: {
    slug: string | null;
    display_name: string | null;
    user_id: string | null;
    verification_status: string | null;
  };
  sessionUserId: string | null;
  provenanceBundle: ArchivalProvenanceBundle;
  provenanceInsights: ProvenanceInsight[];
  rightsLedger: RightsLedgerGrouped;
  shareUrl: string;
  claimReturnPath: string;
  ownershipClaimPath?: OwnershipClaimPath | null;
  pendingAcquisitionOnArtwork?: boolean;
  ownershipTimeline?: OwnershipTimelineEntry[];
};

function ownershipLabel(
  status: OwnershipSystemStatus,
  t: ReturnType<typeof useLocalePreferences>["t"]
) {
  switch (status) {
    case "verified":
      return t("registry.record.ownership.verified");
    case "claimed":
      return t("registry.record.ownership.claimed");
    case "unassigned":
      return t("registry.record.ownership.unassigned");
    default:
      return t("registry.record.ownership.recorded");
  }
}

export function PublicRegistryRecordView({
  artwork,
  artistName,
  artistUserId,
  artistSlug,
  verificationGalleryName,
  edition,
  hasCertificate,
  certRevoked,
  revokedReason,
  ownershipStatus,
  currentOwner,
  sessionUserId,
  provenanceBundle,
  provenanceInsights,
  rightsLedger,
  shareUrl,
  claimReturnPath,
  ownershipClaimPath = null,
  pendingAcquisitionOnArtwork = false,
  ownershipTimeline = [],
}: PublicRegistryRecordProps) {
  const { t } = useLocalePreferences();
  const { track } = useTelemetry();
  const inCatalogueShell = useRegistryCatalogueShell();

  useEffect(() => {
    track({
      eventName: "ledger_opened",
      surface: "registry",
      metadata: { registry_id: artwork.registry_id ?? null },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork.registry_id]);

  const dealCounterparty = useMemo(
    () =>
      resolveAcquisitionDealCounterparty({
        artistUserId,
        artistName,
        currentOwnerUserId: currentOwner.user_id,
        currentOwnerDisplayName: currentOwner.display_name,
      }),
    [artistName, artistUserId, currentOwner.display_name, currentOwner.user_id]
  );

  const showExpressInterestCta = shouldShowAcquisitionDealCta({
    sessionUserId,
    counterpartyUserId: dealCounterparty?.userId ?? null,
    currentOwnerUserId: currentOwner.user_id,
    pendingAcquisitionOnArtwork,
  });

  const acquisitionWorkLabel = acquisitionDealWorkLabel({
    title: artwork.title,
    registryId: artwork.registry_id,
  });

  const editionLine = (() => {
    if (!edition) return null;
    if (edition.is_unique === true) return t("registry.record.edition.unique");
    const n = edition.edition_number;
    const total = edition.edition_total;
    if (n != null && total != null) {
      return fillMessage(t("registry.record.edition.nOfT"), { n, total });
    }
    if (n != null) return fillMessage(t("registry.record.edition.n"), { n });
    if (total != null) {
      return fillMessage(t("registry.record.edition.of"), { total });
    }
    return null;
  })();

  const ownBadge = ownershipStatusBadge(ownershipStatus, "light");
  ownBadge.label = ownershipLabel(ownershipStatus, t);

  const heldByContent = (() => {
    if (
      currentOwner.user_id &&
      sessionUserId &&
      currentOwner.user_id === sessionUserId
    ) {
      return t("registry.record.heldByYou");
    }
    if (!currentOwner.user_id) return t("registry.record.ownership.unassigned");
    if (currentOwner.verification_status !== "verified") {
      return currentOwner.verification_status === "claimed"
        ? t("registry.record.ownershipClaimed")
        : t("registry.record.ownershipRecorded");
    }
    if (currentOwner.slug && currentOwner.display_name) {
      return (
        <>
          {t("registry.record.heldBy")}{" "}
          <Link
            href={fieldCollectorHref(currentOwner.slug)}
            className="underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
          >
            {currentOwner.display_name}
          </Link>
        </>
      );
    }
    return t("registry.record.privateCollection");
  })();

  const artistConfirmationOnFile = provenanceBundle.events.some(
    (event) => event.narrativeKind === "artist_confirmation"
  );
  const organisationVerified =
    Boolean(verificationGalleryName?.trim()) ||
    provenanceBundle.events.some(
      (event) => event.narrativeKind === "institutional_confirmation"
    );
  const continuityEstablished =
    provenanceBundle.recordCompleteness === "high" ||
    provenanceBundle.continuityIndicators.length >= 2;

  const trustPresentation = computeRegistryTrustPresentation({
    verificationStatus: artwork.verification_status,
    hasCertificate,
    certRevoked,
    completenessLevel: provenanceBundle.recordCompleteness,
    verifierName: verificationGalleryName,
    artistConfirmationOnFile,
    organisationVerified,
    continuityEstablished,
  });

  const intelligenceAssessment = computeRegistryIntelligence({
    provenanceBundle,
    recordVerified: isRecordVerified(artwork.verification_status),
    hasCertificate,
    certRevoked,
    provenanceInsights,
  });

  const certificateShareContext = buildCertificateShareContext({
    registryId: artwork.registry_id,
    artworkTitle: artwork.title || "Work on file",
    artistName,
    verificationStatus: artwork.verification_status,
    hasCertificate,
    revoked: certRevoked,
  });

  const recordVerified = isRecordVerified(artwork.verification_status);
  const trustTier = parseArtworkTrustTier(artwork.verification_status);
  const certificateClass =
    hasCertificate && !certRevoked ? certificateClassForTrustTier(trustTier) : null;
  const certificateTierLabel = certRevoked
    ? t("registry.record.trust.revokedHeadline")
    : certificateClass
      ? t(certificateClassTitleKey(certificateClass))
      : hasCertificate
        ? t("registry.record.certRecorded")
        : t("registry.record.badge.noCertificate");

  const verificationShareContext = buildVerificationShareContext({
    registryId: artwork.registry_id,
    artworkTitle: artwork.title || "Work on file",
    verifierName: verificationGalleryName,
    trustLevel: trustPresentation.level,
    verifiedAt: null,
    isVerified: recordVerified,
  });

  const creationDate = (() => {
    const d = artwork.created_at ?? "";
    if (!d) return "-";
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  return (
    <div
      className={`${registryV2.scope} rrowm-zone-registry text-[var(--v2-ink)]${
        inCatalogueShell ? "" : " pt-16 md:pt-20"
      }`}
    >
      <main
        className={`${registryV2.surface.page} relative mx-auto max-w-6xl ${
          inCatalogueShell
            ? "px-0 py-6 md:py-8 lg:px-8"
            : "px-4 py-6 sm:px-6 md:py-10 lg:px-8"
        }`}
      >
        <div
          className={`mb-8 flex flex-wrap items-center justify-between gap-3 ${registryV2.surface.filing} px-4 py-3 md:px-5`}
        >
          <p className={`${registryV2.type.metaValue} max-w-2xl text-sm`}>
            {t("registry.record.ledgerDiscoveryNote")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {showExpressInterestCta && sessionUserId && dealCounterparty ? (
              <Link
                href={buildStudioNewDealHref({
                  counterpartyUserId: dealCounterparty.userId,
                  counterpartyLabel: dealCounterparty.label,
                  artworkId: artwork.id,
                  artworkTitle: acquisitionWorkLabel,
                  initialIntentId: "acquisition_interest",
                })}
                className="v2-cta-secondary !min-h-0 !px-4 !py-2.5 !text-xs"
              >
                Start acquisition deal
              </Link>
            ) : null}
            <Link
              href={fieldRecordHref(artwork.registry_id)}
              className="v2-cta-secondary !min-h-0 !px-4 !py-2.5 !text-xs"
            >
              {t("registry.record.openFieldRecord")}
            </Link>
          </div>
        </div>

        <RegistryRecordHero
          imageUrl={artwork.image_url}
          title={artwork.title || t("field.record.title")}
          artistName={artistName}
          artistHref={artistSlug ? fieldCreativeHref(artistSlug) : null}
          registryId={artwork.registry_id}
          noImageLabel={t("registry.card.noImage")}
          trustTierStrip={
            <RegistryTrustTierStrip
              verificationStatus={artwork.verification_status}
              certificateTierLabel={certificateTierLabel}
              revoked={certRevoked}
            />
          }
          fields={[
            {
              label: t("registry.record.field.steward"),
              value: heldByContent,
            },
            {
              label: t("registry.record.field.creationDate"),
              value: creationDate,
            },
            {
              label: t("registry.record.field.year"),
              value: String(artwork.year || "–"),
            },
          ]}
          certificateActions={
            <RegistryRecordCertificateActions
              registryId={artwork.registry_id}
              verificationStatus={artwork.verification_status}
              hasCertificate={hasCertificate}
              certRevoked={certRevoked}
              certificateShareContext={certificateShareContext}
            />
          }
          trustPanel={
            <RegistryTrustPanel
              presentation={trustPresentation}
              trustTier={trustTier}
              variant="compact"
            />
          }
        />

        {recordVerified ? (
          <section className={`mb-12 mt-10 ${registryV2.surface.filing} p-6 md:p-8`}>
            <p className={registryV2.type.metaLabel}>{t("verification.share.sectionLabel")}</p>
            <VerificationShareControl
              context={verificationShareContext}
              className="mt-4"
            />
          </section>
        ) : null}

        {ownershipTimeline.length > 0 ? (
          <section className={`mb-16 ${registryV2.surface.filing} p-6 md:p-9`}>
            <div className="v2-surface-archive-sheet pl-5 md:pl-6">
              <h2 className={registryV2.type.sectionTitle}>
                {t("registry.record.ownershipLineage")}
              </h2>
              <p className={`${registryV2.type.metaValue} mt-3 max-w-2xl`}>
                {ownBadge.label}
              </p>
            </div>
            <OwnershipEventsChronology
              entries={ownershipTimeline}
              className="mt-8"
            />
          </section>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-10 lg:col-span-7">
            {artwork.description ? (
              <section className={`${registryV2.surface.filing} p-6 md:p-8`}>
                <h2 className={registryV2.type.sectionTitle}>
                  {t("registry.record.aboutWork")}
                </h2>
                <p className={`${registryV2.type.metaValue} mt-5 whitespace-pre-wrap`}>
                  {artwork.description}
                </p>
              </section>
            ) : null}

            <section className={`${registryV2.surface.filing} p-6 md:p-8`}>
              <h2 className={registryV2.type.sectionTitle}>
                {t("registry.record.specifications")}
              </h2>
              <dl className="mt-6 divide-y divide-[var(--v2-border)]">
                <div className="registry-spec-row flex flex-col gap-1.5 py-4 first:pt-0 sm:flex-row sm:justify-between sm:gap-6">
                  <dt className={registryV2.type.metaLabel}>{t("registry.record.field.medium")}</dt>
                  <dd className={`${registryV2.type.monoId} break-words sm:max-w-[60%] sm:text-right`}>
                    {artwork.medium || "–"}
                  </dd>
                </div>
                <div className="registry-spec-row flex flex-col gap-1.5 py-4 sm:flex-row sm:justify-between sm:gap-6">
                  <dt className={registryV2.type.metaLabel}>
                    {t("registry.record.field.dimensions")}
                  </dt>
                  <dd className={`${registryV2.type.monoId} break-words sm:max-w-[60%] sm:text-right`}>
                    {artwork.dimensions || "–"}
                  </dd>
                </div>
                <div className="registry-spec-row flex flex-col gap-1.5 py-4 sm:flex-row sm:justify-between sm:gap-6">
                  <dt className={registryV2.type.metaLabel}>{t("registry.record.field.year")}</dt>
                  <dd className={`${registryV2.type.monoId} break-words sm:text-right`}>
                    {artwork.year || "–"}
                  </dd>
                </div>
                {editionLine ? (
                  <div className="registry-spec-row flex flex-col gap-1.5 py-4 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className={registryV2.type.metaLabel}>
                      {t("registry.record.field.edition")}
                    </dt>
                    <dd className={`${registryV2.type.monoId} break-words sm:text-right`}>
                      {editionLine}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className={`${registryV2.surface.filing} p-6 md:p-9`}>
              <div className="v2-surface-archive-sheet pl-5 md:pl-6">
                <InfoTooltip text={t("registry.record.provenanceTooltip")} />
                <h2 className={`${registryV2.type.sectionTitle} mt-3`}>
                  {t("registry.record.provenance")}
                </h2>
              </div>
              <RegistryIntelligencePanel
                assessment={intelligenceAssessment}
                className="mt-8"
              />
              {provenanceInsights.length > 0 ? (
                <div className="mt-8 border-t border-[var(--v2-border)] pt-8">
                  <h3 className="v2-type-display text-lg text-[var(--v2-ink)]">
                    {t("registry.record.recordInsights")}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {provenanceInsights.map((ins, i) => (
                      <li
                        key={`${ins.type}-${ins.priority}-${i}`}
                        className={`${registryV2.surface.metadataField} ${registryV2.type.metaValue}`}
                      >
                        {translateProvenanceInsight(ins.message, t)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className={provenanceInsights.length > 0 ? "mt-8" : "mt-6"}>
                <ArchivalProvenanceTimeline
                  bundle={provenanceBundle}
                  registryId={artwork.registry_id}
                  artworkTitle={artwork.title || "Work on file"}
                />
              </div>
            </section>

            <RightsLedgerSection ledger={rightsLedger} />
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className={`${registryV2.surface.filingMajor} p-6 md:p-8`}>
              <h2 className={registryV2.type.sectionTitle}>
                {t("registry.record.certStatusTitle")}
              </h2>
              <div className={`${registryV2.type.metaValue} mt-6 space-y-3`}>
                <p className="font-medium text-[var(--v2-ink)]">{certificateTierLabel}</p>
                {!hasCertificate ? (
                  <p>{t("registry.record.certNotRecorded")}</p>
                ) : certRevoked ? (
                  revokedReason ? (
                    <p className="text-red-700/90">{revokedReason}</p>
                  ) : null
                ) : null}
              </div>

              <div className="mt-6">
                <RegistryRecordCertificateActions
                  registryId={artwork.registry_id}
                  verificationStatus={artwork.verification_status}
                  hasCertificate={hasCertificate}
                  certRevoked={certRevoked}
                  certificateShareContext={certificateShareContext}
                />
              </div>

              <p className={`${registryV2.type.monoId} mt-4`}>
                {t("registry.record.certFootnote")}
              </p>
            </div>

            <RegistryTechnicalDetails
              registryId={artwork.registry_id}
              verificationHash={artwork.verification_hash}
              timelineHash={artwork.timeline_hash}
            />

            <div className={`${registryV2.surface.filing} p-6 md:p-8`}>
              <h2 className={registryV2.type.sectionTitle}>
                {t("registry.record.verificationTitle")}
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                  className="v2-cta-primary block py-3 text-center text-xs"
                >
                  {t("registry.card.verifyCert")}
                </Link>
                <PublicClaimOwnership
                  artworkId={artwork.id}
                  registryId={artwork.registry_id}
                  loginNextPath={claimReturnPath}
                  initialClaimPath={ownershipClaimPath}
                />
                {!pendingAcquisitionOnArtwork ? (
                  <InviteRecordStewardControl
                    artworkId={artwork.id}
                    registryId={artwork.registry_id}
                    sessionUserId={sessionUserId}
                  />
                ) : null}
                <ShareRecordButton url={shareUrl} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
