"use client";

import Link from "next/link";

import { PersonalArchiveControl } from "@/components/archive/PersonalArchiveControl";
import { VerificationShareControl } from "@/components/Registry/VerificationShareControl";
import { RegistryTrustPanel } from "@/components/Registry/RegistryTrustPanel";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  artistConfirmationLabel,
  certificateStatusLabel,
  type FieldVerifyRecordData,
  organisationVerificationLabel,
  recordVerificationStatusLabel,
} from "@/lib/field-verify-record";
import {
  fieldCreativeHref,
  fieldOrganisationHref,
  fieldRecordHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { registryLedgerHref } from "@/lib/registry-nav";
import { computeRegistryTrustPresentation } from "@/lib/registry-trust-model";
import { buildVerificationShareContext } from "@/lib/verification-share";
import { recordVerificationPendingLabel } from "@/lib/representation-language";

type Props = {
  data: FieldVerifyRecordData;
};

function TrustRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border-b border-neutral-900/[0.06] py-4 last:border-0">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-neutral-900">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{detail}</p>
      ) : null}
    </div>
  );
}

export function FieldVerifyRecordView({ data }: Props) {
  const { t } = useLocalePreferences();
  const {
    artwork,
    artist,
    recordVerified,
    artistConfirmationOnFile,
    organisation,
    artistVerifiedWorkCount,
    certificate,
    certificateRevoked,
    archiveCount,
    userArchived,
    sessionUserId,
  } = data;

  const verifyPath = fieldVerifyRecordHref(artwork.registry_id);
  const recordHref = fieldRecordHref(artwork.registry_id);
  const ledgerHref = registryLedgerHref(artwork.registry_id);
  const verifiedWorksLine =
    artistVerifiedWorkCount === 1
      ? fillMessage(t("field.verify.record.verifiedWorksCount"), {
          count: String(artistVerifiedWorkCount),
        })
      : fillMessage(t("field.verify.record.verifiedWorksCountPlural"), {
          count: String(artistVerifiedWorkCount),
        });

  const trustPresentation = computeRegistryTrustPresentation({
    verificationStatus: artwork.verification_status,
    hasCertificate: Boolean(certificate),
    certRevoked: certificateRevoked,
    verifierName: organisation?.name ?? null,
    artistConfirmationOnFile,
    organisationVerified: Boolean(organisation?.verified),
  });

  const verificationShareContext = buildVerificationShareContext({
    registryId: artwork.registry_id,
    artworkTitle: artwork.title?.trim() || t("field.record.title"),
    verifierName: organisation?.name ?? null,
    trustLevel: trustPresentation.level,
    verifiedAt: recordVerified ? artwork.created_at : null,
    isVerified: recordVerified,
  });

  return (
    <div className="relative mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      {certificateRevoked ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-24 flex justify-center opacity-[0.07]"
          aria-hidden
        >
          <span className="rotate-[-18deg] text-7xl font-bold tracking-widest text-red-700 md:text-8xl">
            {t("field.verify.record.revokedWatermark")}
          </span>
        </div>
      ) : null}

      <h1 className="font-serif text-3xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-4xl">
        {artwork.title?.trim() || t("field.record.title")}
      </h1>
      {artist?.display_name ? (
        <p className="mt-3 text-base text-neutral-700">{artist.display_name}</p>
      ) : null}

      <RegistryTrustPanel
        presentation={trustPresentation}
        variant="compact"
        className="relative mt-8"
      />

      {recordVerified ? (
        <section
          className={`relative mt-8 rounded-[1.15rem] border border-neutral-300/70 bg-gradient-to-br from-[#f7f4ef] via-[#fafaf8] to-[#f0ebe3] px-6 py-6 shadow-sm md:px-8`}
        >
          <p className="text-sm font-medium text-neutral-800">
            {t("verification.share.verifiedKicker")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
            {t("verification.share.verifiedLede")}
          </p>
          <VerificationShareControl
            context={verificationShareContext}
            className="mt-5"
          />
        </section>
      ) : null}

      {!recordVerified ? (
        <div className="mt-6 rounded-xl border border-neutral-900/[0.08] bg-white/85 px-4 py-4 text-sm text-neutral-700">
          <p className="font-medium text-neutral-900">
            {t("field.verify.record.unverifiedTitle")}
          </p>
          <p className="mt-1 leading-relaxed text-neutral-600">
            {t("field.verify.record.unverifiedBody")}
          </p>
          <Link
            href={recordHref}
            className="mt-3 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2"
          >
            {t("field.verify.record.viewFieldRecord")}
          </Link>
        </div>
      ) : null}

      <section className="relative mt-10 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/85 p-6 shadow-sm md:p-8">
        <h2 className="font-serif text-xl font-normal text-neutral-950">
          {t("field.verify.record.trustHeading")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          {t("field.verify.record.trustIntro")}
        </p>

        <div className="mt-6">
          <h3 className="mb-3 font-serif text-base font-normal text-neutral-800">
            {t("field.verify.hub.tier1.label")}
          </h3>
          <TrustRow
            label={t("field.verify.record.label.registryId")}
            value={artwork.registry_id}
          />
          <TrustRow
            label={t("field.verify.record.label.recordVerification")}
            value={recordVerificationStatusLabel(
              artwork.verification_status,
              recordVerified
            )}
          />
          <TrustRow
            label={t("field.verify.record.label.artistConfirmation")}
            value={artistConfirmationLabel(artistConfirmationOnFile)}
          />
        </div>

        <div className="mt-8 border-t border-neutral-900/[0.06] pt-6">
          <h3 className="mb-3 font-serif text-base font-normal text-neutral-800">
            {t("field.verify.hub.tier2.label")}
          </h3>
          <TrustRow
            label={t("field.verify.record.label.organisationVerification")}
            value={organisationVerificationLabel(organisation)}
          />
          {artistVerifiedWorkCount > 0 ? (
            <TrustRow
              label={t("field.verify.record.label.verifiedWorksByCreative")}
              value={verifiedWorksLine}
              detail={t("field.verify.record.verifiedWorksDetail")}
            />
          ) : null}
        </div>

        <div className="mt-8 border-t border-neutral-900/[0.06] pt-6">
          <h3 className="mb-3 font-serif text-base font-normal text-neutral-800">
            {t("field.verify.hub.tier3.label")}
          </h3>
          <TrustRow
            label={t("field.verify.record.label.certificateStatus")}
            value={certificateStatusLabel({
              recordVerified,
              certificate,
              certificateRevoked,
              pendingLabel: recordVerificationPendingLabel(),
            })}
          />
          {certificateRevoked && certificate?.revoked_reason ? (
            <div className="mt-4 rounded-xl border border-red-200/80 bg-red-50/85 px-4 py-3 text-sm text-red-800">
              <p className="text-sm font-medium text-red-900">
                {t("field.verify.record.revocationReason")}
              </p>
              <p className="mt-1">{certificate.revoked_reason}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 border-t border-neutral-900/[0.06] pt-4">
          <TrustRow
            label={t("field.verify.record.label.recordedOn")}
            value={new Date(artwork.created_at).toLocaleDateString()}
          />
        </div>
      </section>

      {recordVerified ? (
        <p className="mt-8 text-xs leading-relaxed text-neutral-500">
          {t("field.verify.record.certificateLoginNote")}{" "}
          <a
            href={`/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(artwork.registry_id)}`)}`}
            className="font-medium text-neutral-800 underline underline-offset-2"
          >
            {t("field.verify.record.viewCertificateLogin")}
          </a>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
        <Link
          href={recordHref}
          className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.verify.record.linkFieldRecord")}
        </Link>
        <Link
          href={ledgerHref}
          className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.verify.record.linkRegistryLedger")}
        </Link>
        {artist?.slug ? (
          <Link
            href={fieldCreativeHref(artist.slug)}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.verify.record.linkCreativeProfile")}
          </Link>
        ) : null}
        <Link
          href={fieldVerifyHref()}
          className="text-neutral-800 underline decoration-neutral-800/25 underline-offset-[3px] hover:decoration-neutral-800/50"
        >
          {t("field.explorer.link.verifyHub")}
        </Link>
      </div>

      <PersonalArchiveControl
        artworkId={artwork.id}
        registryId={artwork.registry_id}
        isSignedIn={Boolean(sessionUserId)}
        initialArchived={userArchived}
        initialCount={archiveCount}
        variant="compact"
        loginNextPath={verifyPath}
      />
    </div>
  );
}
