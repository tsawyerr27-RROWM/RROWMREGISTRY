"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { FieldRelationshipContextSection } from "@/components/Field/FieldRelationshipContextSection";
import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { RegistryRecordHero } from "@/components/Registry/RegistryRecordHero";
import {
  artistConfirmationLabel,
  certificateStatusLabel,
  organisationVerificationLabel,
  recordVerificationStatusLabel,
} from "@/lib/field-verify-record";
import type { FieldRecordPageData } from "@/lib/field-record-page";
import {
  fieldExplorerRecordsHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { registryLedgerHref } from "@/lib/registry-nav";
import { recordVerificationPendingLabel } from "@/lib/representation-language";
import { buildStudioNewDealHref } from "@/lib/deal-create-nav";
import {
  acquisitionDealWorkLabel,
  shouldShowAcquisitionDealCta,
} from "@/lib/acquisition-deal-counterparty";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  data: FieldRecordPageData;
};

export function FieldRecordView({ data }: Props) {
  const { t } = useLocalePreferences();
  const { track } = useTelemetry();

  useEffect(() => {
    track({
      eventName: "field_record_opened",
      surface: "field",
      metadata: {
        registry_id: data.artwork.registry_id ?? null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.artwork.registry_id]);
  const {
    artwork,
    recordVerified,
    artistConfirmationOnFile,
    organisation,
    certificate,
    certificateRevoked,
    image_url,
    year,
    medium,
    description,
    artistName,
    creativeHref,
    organisationName,
    organisationHref,
    contextPanels,
    sessionUserId,
    dealCounterparty,
    currentOwnerUserId,
    pendingAcquisitionOnArtwork,
  } = data;

  const showExpressInterestCta = useMemo(
    () =>
      shouldShowAcquisitionDealCta({
        sessionUserId,
        counterpartyUserId: dealCounterparty?.userId ?? null,
        currentOwnerUserId,
        pendingAcquisitionOnArtwork,
      }),
    [
      currentOwnerUserId,
      dealCounterparty?.userId,
      pendingAcquisitionOnArtwork,
      sessionUserId,
    ]
  );

  const acquisitionWorkLabel = acquisitionDealWorkLabel({
    title: artwork.title,
    registryId: artwork.registry_id,
  });

  const title = artwork.title?.trim() || t("field.record.title");
  const ledgerHref = registryLedgerHref(artwork.registry_id);
  const verifyHref = fieldVerifyRecordHref(artwork.registry_id);
  const yearMedium = [year, medium].filter(Boolean).join(" · ");

  const filedDate = (() => {
    const d = artwork.created_at;
    if (!d) return "-";
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  const heroActions = (
    <>
      <Link href={verifyHref} className="v2-cta-primary !min-h-0 px-6 py-3 text-xs">
        {t("field.record.link.verify")}
      </Link>
      {showExpressInterestCta && sessionUserId && dealCounterparty ? (
        <Link
          href={buildStudioNewDealHref({
            counterpartyUserId: dealCounterparty.userId,
            counterpartyLabel: dealCounterparty.label,
            artworkId: artwork.id,
            artworkTitle: acquisitionWorkLabel,
            initialIntentId: "acquisition_interest",
          })}
          className="v2-cta-secondary !min-h-0 px-6 py-3 text-xs"
        >
          Start acquisition deal
        </Link>
      ) : null}
      <Link href={ledgerHref} className="v2-cta-secondary !min-h-0 px-6 py-3 text-xs">
        {t("field.record.link.ledger")}
      </Link>
      <Link
        href={fieldVerifyHref()}
        className="v2-cta-secondary !min-h-0 px-6 py-3 text-xs"
      >
        {t("field.record.link.verifyHub")}
      </Link>
    </>
  );

  return (
    <main className={`${registryV2.scope} mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14 lg:px-8`}>
      <div className="mb-8">
        <ArtworkTrustBadge verificationStatus={artwork.verification_status} />
      </div>
      <RegistryRecordHero
        imageUrl={image_url}
        title={title}
        artistName={artistName || "-"}
        artistHref={creativeHref}
        registryId={artwork.registry_id}
        fields={[
          {
            label: t("registry.record.field.verification"),
            value: recordVerificationStatusLabel(
              artwork.verification_status,
              recordVerified
            ),
          },
          {
            label: "Artist confirmation",
            value: artistConfirmationLabel(artistConfirmationOnFile),
          },
          {
            label: "Organisation",
            value: organisationVerificationLabel(organisation),
          },
          {
            label: "Certificate",
            value: certificateStatusLabel({
              recordVerified,
              certificate,
              certificateRevoked,
              pendingLabel: recordVerificationPendingLabel(),
            }),
          },
          {
            label: t("registry.record.field.creationDate"),
            value: filedDate,
          },
          ...(yearMedium
            ? [{ label: t("registry.record.field.year"), value: yearMedium }]
            : []),
        ]}
        actions={heroActions}
      />

      {organisationName ? (
        <section className={`mt-12 ${registryV2.surface.filing} p-6 md:p-8`}>
          <h2 className={registryV2.type.metaLabel}>Organisation</h2>
          <p className={`${registryV2.type.metaValue} mt-3 text-base`}>
            {organisationHref ? (
              <Link
                href={organisationHref}
                className="font-medium text-[var(--v2-ink)] underline decoration-[var(--v2-border)] underline-offset-4 hover:decoration-[var(--v2-border-strong)]"
              >
                {organisationName}
              </Link>
            ) : (
              organisationName
            )}
          </p>
        </section>
      ) : null}

      {description?.trim() ? (
        <section className={`mt-12 ${registryV2.surface.filing} p-6 md:p-8`}>
          <h2 className={registryV2.type.sectionTitle}>About this work</h2>
          <div className={`${registryV2.type.metaValue} mt-6 space-y-4`}>
            {description.split(/\n\n+/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <FieldRelationshipContextSection data={{ panels: contextPanels }} />

      <section className={`mt-14 ${registryV2.surface.filing} p-6 md:p-8`}>
        <div className={registryV2.surface.explorerIndex}>
          <h2 className={registryV2.type.sectionTitle}>
            {t("field.record.discoveryHeading")}
          </h2>
          <p className={`${registryV2.type.metaValue} mt-4 max-w-2xl`}>
            {t("field.record.discoveryLede")}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={fieldExplorerRecordsHref()}
            className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs"
          >
            {t("field.record.link.explorer")}
          </Link>
          {creativeHref ? (
            <Link
              href={creativeHref}
              className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs"
            >
              {t("field.record.link.creative")}
            </Link>
          ) : null}
          {organisationHref ? (
            <Link
              href={organisationHref}
              className="v2-cta-secondary !min-h-0 px-5 py-2.5 text-xs"
            >
              {t("field.record.link.organisation")}
            </Link>
          ) : null}
        </div>
      </section>

      <section
        className={`mx-auto mt-12 max-w-2xl px-6 py-10 text-center md:mt-16 ${registryV2.surface.filing}`}
      >
        <p className={`${registryV2.type.metaValue} text-base`}>
          {t("field.record.ledgerNote")}
        </p>
      </section>
    </main>
  );
}
