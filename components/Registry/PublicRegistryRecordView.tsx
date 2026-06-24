"use client";

import Link from "next/link";
import { useMemo } from "react";

import { RightsLedgerSection } from "@/components/Rights/RightsLedgerSection";
import { ArchivalProvenanceTimeline } from "@/components/provenance/ArchivalProvenanceTimeline";
import { CertificateShareControl } from "@/components/certificate/CertificateShareControl";
import { VerificationShareControl } from "@/components/Registry/VerificationShareControl";
import { RegistryCertificateOverviewButton } from "@/components/certificate/RegistryCertificateOverviewButton";
import { RegistryTrustPanel } from "@/components/Registry/RegistryTrustPanel";
import { RegistryIntelligencePanel } from "@/components/Registry/RegistryIntelligencePanel";
import { InviteRecordStewardControl } from "@/components/Registry/InviteRecordStewardControl";
import { PublicClaimOwnership } from "@/components/Registry/PublicClaimOwnership";
import { RegistryTechnicalDetails } from "@/components/Registry/RegistryTechnicalDetails";
import { ShareRecordButton } from "@/components/Registry/ShareRecordButton";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
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
import { fieldCreativeHref, fieldRecordHref } from "@/lib/field-nav";
import { rrowmRegistrySection } from "@/styles/rrowm-theme";
import {
  computeRegistryTrustPresentation,
  isRecordVerified,
} from "@/lib/registry-trust-model";
import { OwnershipEventsChronology } from "@/components/Registry/OwnershipEventsChronology";
import type { OwnershipTimelineEntry } from "@/lib/canonical-ownership-engine";
import { computeRegistryIntelligence } from "@/lib/registry-intelligence";

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
            href={`/collector-studio/${encodeURIComponent(currentOwner.slug)}`}
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
    isVerified: isRecordVerified(artwork.verification_status),
    hasCertificate,
    revoked: certRevoked,
  });

  const recordVerified = isRecordVerified(artwork.verification_status);
  const verificationShareContext = buildVerificationShareContext({
    registryId: artwork.registry_id,
    artworkTitle: artwork.title || "Work on file",
    verifierName: verificationGalleryName,
    trustLevel: trustPresentation.level,
    verifiedAt: null,
    isVerified: recordVerified,
  });

  return (
    <div className="rrowm-zone-registry text-neutral-900">
      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(40vh,22rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.9),transparent_58%)]"
          aria-hidden
        />
        <div className={`mb-8 flex flex-wrap items-center justify-between gap-3 ${rrowmRegistrySection.discovery}`}>
          <p className="max-w-2xl text-sm text-neutral-600">
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
                className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-900/[0.12] hover:bg-white"
              >
                Start acquisition deal
              </Link>
            ) : null}
            <Link
              href={fieldRecordHref(artwork.registry_id)}
              className="inline-flex rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("registry.record.openFieldRecord")}
            </Link>
          </div>
        </div>

        <RegistryTrustPanel
          presentation={trustPresentation}
          variant="hero"
          className="mb-10"
        />

        {recordVerified ? (
          <section className={`mb-10 ${rrowmRegistrySection.section}`}>
            <p className="text-sm font-medium text-neutral-800">
              {t("verification.share.sectionLabel")}
            </p>
            <VerificationShareControl
              context={verificationShareContext}
              className="mt-4"
            />
          </section>
        ) : null}

        <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-7">
            <div className={`${rrowmRegistrySection.artworkFrame}`}>
              {artwork.image_url ? (
                <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-neutral-100 to-neutral-200/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200/60 text-sm text-neutral-500">
                  {t("registry.card.noImage")}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-1">
            <div className={rrowmRegistrySection.metadata}>
              <p className="font-mono text-[11px] leading-relaxed tracking-tight text-neutral-500">
                {artwork.registry_id}
              </p>
              <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-[1.06]">
                {artwork.title}
              </h1>
              <p className="mt-4 text-lg text-neutral-700">
                {artistSlug ? (
                  <Link
                    href={fieldCreativeHref(artistSlug)}
                    className="transition hover:text-neutral-900 hover:underline"
                  >
                    {artistName}
                  </Link>
                ) : (
                  artistName
                )}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                  "–"}
              </p>
            </div>
            <div className={rrowmRegistrySection.ownership}>
              <p className={ownBadge.className}>{ownBadge.label}</p>
              <p className="mt-2 text-sm text-neutral-600">{heldByContent}</p>
            </div>
            {ownershipTimeline.length > 0 ? (
              <section className={`${rrowmRegistrySection.section} md:px-6 md:py-7`}>
                <h2 className="font-serif text-lg font-normal text-neutral-950">
                  Ownership chronology
                </h2>
                <OwnershipEventsChronology
                  entries={ownershipTimeline}
                  className="mt-4"
                />
              </section>
            ) : null}
            {artwork.description ? (
              <section className={`${rrowmRegistrySection.section} md:px-6 md:py-7`}>
                <h2 className="font-serif text-lg font-normal text-neutral-950">
                  {t("registry.record.aboutWork")}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                  {artwork.description}
                </p>
              </section>
            ) : null}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-10 lg:col-span-7">
            <section className={rrowmRegistrySection.section}>
              <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                {t("registry.record.specifications")}
              </h2>
              <dl className="mt-6 divide-y divide-black/[0.06] text-sm">
                <div className="flex justify-between gap-6 py-4 first:pt-0">
                  <dt className="text-neutral-500">
                    {t("registry.record.field.medium")}
                  </dt>
                  <dd className="max-w-[60%] text-right text-neutral-900">
                    {artwork.medium || "–"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-neutral-500">
                    {t("registry.record.field.dimensions")}
                  </dt>
                  <dd className="max-w-[60%] text-right text-neutral-900">
                    {artwork.dimensions || "–"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-neutral-500">
                    {t("registry.record.field.year")}
                  </dt>
                  <dd className="text-right text-neutral-900">
                    {artwork.year || "–"}
                  </dd>
                </div>
                {editionLine ? (
                  <div className="flex justify-between gap-6 py-4">
                    <dt className="text-neutral-500">
                      {t("registry.record.field.edition")}
                    </dt>
                    <dd className="text-right text-neutral-900">{editionLine}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className={rrowmRegistrySection.provenance}>
              <div className="border-b border-neutral-900/[0.06] pb-6">
                <InfoTooltip text={t("registry.record.provenanceTooltip")} />
                <h2 className="mt-3 font-serif text-[1.75rem] font-normal tracking-tight text-neutral-950 md:text-2xl">
                  {t("registry.record.provenance")}
                </h2>
              </div>
              <RegistryIntelligencePanel
                assessment={intelligenceAssessment}
                className="mt-8"
              />
              {provenanceInsights.length > 0 ? (
                <div className="mt-8 border-b border-neutral-900/[0.06] pb-8">
                  <h3 className="font-serif text-lg font-normal text-neutral-900">
                    {t("registry.record.recordInsights")}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {provenanceInsights.map((ins, i) => (
                      <li
                        key={`${ins.type}-${ins.priority}-${i}`}
                        className={`${rrowmRegistrySection.insight} text-sm leading-relaxed text-neutral-700`}
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
            <div className={rrowmRegistrySection.certificate}>
              <h2 className="font-serif text-lg font-normal text-neutral-950">
                {t("registry.record.certStatusTitle")}
              </h2>
              <div className="mt-6 space-y-3 text-sm">
                {!hasCertificate ? (
                  <p className="font-medium text-neutral-900">
                    {t("registry.record.certNotRecorded")}
                  </p>
                ) : certRevoked ? (
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">
                      {t("registry.record.certRevoked")}
                    </p>
                    {revokedReason ? (
                      <p className="text-red-700/90">{revokedReason}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="font-medium text-neutral-900">
                    {t("registry.record.certRecorded")}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <RegistryCertificateOverviewButton
                  registryId={artwork.registry_id}
                />
              </div>

              {hasCertificate ? (
                <div className="mt-5">
                  <p className="mb-3 text-xs font-medium text-neutral-700">
                    {t("certificate.share.sectionLabel")}
                  </p>
                  <CertificateShareControl context={certificateShareContext} />
                </div>
              ) : null}

              <p className="mt-4 text-xs text-neutral-500">
                {t("registry.record.certFootnote")}
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(`/certificate/${artwork.registry_id}`)}`}
                className="mt-4 block rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                {t("registry.card.viewCertLogin")}
              </Link>
            </div>

            <RegistryTechnicalDetails
              registryId={artwork.registry_id}
              verificationHash={artwork.verification_hash}
              timelineHash={artwork.timeline_hash}
            />

            <div className={rrowmRegistrySection.verification}>
              <h2 className="font-serif text-lg font-normal text-neutral-950">
                {t("registry.record.verificationTitle")}
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                  className="rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
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
