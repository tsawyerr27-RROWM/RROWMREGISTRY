"use client";

import Link from "next/link";
import { useEffect } from "react";

import { RrowmLogo } from "@/components/brand/RrowmLogo";
import { CertificateArtistActions } from "@/components/certificate/CertificateArtistActions";
import { CertificateAuthenticityBlock } from "@/components/certificate/CertificateAuthenticityBlock";
import { CertificateDocumentFrame } from "@/components/certificate/CertificateDocumentFrame";
import { CertificateSeal } from "@/components/certificate/CertificateSeal";
import { CertificateShareControl } from "@/components/certificate/CertificateShareControl";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  artworkYearMediumLine,
  formatCertificateIssuedDate,
  type CertificateDocumentData,
} from "@/lib/certificate-document";
import { buildCertificateShareContext } from "@/lib/certificate-share";
import { certificateClassTitleKey } from "@/lib/artwork-trust-tier";
import { registryPremium } from "@/styles/registry-premium";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  data: CertificateDocumentData;
  isArtistOwner: boolean;
  qrCodeDataUrl: string;
};

export function CertificateDocumentView({
  data,
  isArtistOwner,
  qrCodeDataUrl,
}: Props) {
  const { t, region } = useLocalePreferences();
  const { track } = useTelemetry();

  useEffect(() => {
    track({
      eventName: "certificate_opened",
      surface: "registry",
      metadata: { registry_id: data.artwork.registry_id ?? null },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.artwork.registry_id]);
  const { artwork, certificate, artistName, verifierName, verifyUrl } = data;
  const isRevoked = certificate.revoked;
  const labelClass = registryV2.type.metaLabel;
  const issuedDate = formatCertificateIssuedDate(certificate.issued_at, region.locale);
  const yearMedium = artworkYearMediumLine(artwork.year, artwork.medium);
  const sealLevel = isRevoked ? "revoked" : "attested";
  const certificateClassLabel = certificate.certificate_class
    ? t(certificateClassTitleKey(certificate.certificate_class))
    : null;
  const shareContext = buildCertificateShareContext({
    registryId: artwork.registry_id,
    artworkTitle: artwork.title,
    artistName,
    issuedAt: certificate.issued_at,
    verificationStatus: artwork.verification_status,
    hasCertificate: true,
    revoked: isRevoked,
  });

  return (
    <CertificateDocumentFrame
      certificateClassLabel={certificateClassLabel}
      screenWatermark={
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none print:hidden">
          <div className={`${registryV2.type.monoId} text-[min(18vw,180px)] tracking-[0.45em] text-[var(--v2-ink)]/[0.04]`}>
            RROWM
          </div>
        </div>
      }
      revokedWatermark={
        isRevoked ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center print:hidden">
            <div className="rotate-[-14deg] text-[min(20vw,180px)] font-semibold tracking-[0.2em] text-red-900/[0.06]">
              {t("certificate.document.revokedWatermark")}
            </div>
          </div>
        ) : null
      }
    >
      {isArtistOwner ? (
        <CertificateArtistActions registryId={artwork.registry_id} />
      ) : null}

      <div className="mb-8 print:hidden">
        <p className="mb-3 text-sm font-medium text-neutral-800">
          {t("certificate.share.sectionLabel")}
        </p>
        <CertificateShareControl context={shareContext} />
      </div>

      {isRevoked ? (
        <div className="mb-10 shrink-0 break-inside-avoid rounded-xl border border-red-200/90 bg-red-50/90 px-5 py-4 text-sm text-red-950 print:mb-2 print:rounded-sm print:px-3 print:py-2 print:text-xs">
          <p className="text-sm font-semibold text-red-900/90">
            {t("certificate.document.revokedTitle")}
          </p>
          <p className="mt-2 leading-relaxed text-red-900/85">
            {t("certificate.document.revokedBody")}
          </p>
          {certificate.revoked_reason ? (
            <p className="mt-4 border-t border-red-200/70 pt-3 text-red-800/95 print:mt-3 print:pt-3">
              {certificate.revoked_reason}
            </p>
          ) : null}
        </div>
      ) : null}

      <header className="flex shrink-0 flex-col gap-8 border-b border-[var(--v2-border)] pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-9 print:flex-row print:items-end print:justify-between print:gap-2 print:border-b print:border-neutral-200/90 print:pb-2">
        <div className="min-w-0">
          <Link
            href="/"
            className="inline-flex max-w-[156px] print:block print:max-w-[128px]"
            aria-label="RROWM home"
          >
            <RrowmLogo
              sizes="(max-width: 640px) 148px, 156px"
              className="h-9 w-auto max-h-9 max-w-full object-contain object-left opacity-95 sm:h-10 sm:max-h-10 print:h-8 print:max-h-8"
            />
          </Link>
          <p className={`${registryV2.type.sectionTitle} mt-5 text-xl print:mt-1.5 print:text-sm`}>
            {t("certificate.document.registryName")}
          </p>
          <p className={`${registryV2.type.metaLabel} mt-2 print:mt-1`}>
            {certificateClassLabel ?? t("certificate.document.subtitle")}
          </p>
        </div>
        <div className="shrink-0 sm:text-right print:text-right">
          <p className={registryV2.type.metaLabel}>{t("certificate.document.registryId")}</p>
          <p className={`${registryV2.type.monoId} mt-2 max-w-full break-all font-medium text-[var(--v2-ink)] print:text-[11px]`}>
            {artwork.registry_id}
          </p>
        </div>
      </header>

      <section className="min-w-0 py-10 sm:py-12 md:py-14 print:flex print:min-h-0 print:flex-1 print:flex-col print:justify-center print:py-1">
        {artwork.image_url ? (
          <div className="mx-auto mb-8 flex max-w-sm justify-center print:mb-3 print:max-w-[42mm]">
            <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-sm border border-neutral-200/90 bg-neutral-100 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] print:max-w-[42mm] print:shadow-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.image_url}
                alt=""
                className="h-full w-full object-cover print:object-contain"
              />
            </div>
          </div>
        ) : null}

        <p className="text-center text-sm text-neutral-600 print:text-sm">
          {t("certificate.document.registeredWork")}
        </p>
        <div className="mx-auto mt-6 flex max-w-2xl justify-center print:mt-2">
          <div
            className="h-px w-16 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"
            aria-hidden
          />
        </div>
        <h1
          className={`${registryV2.type.recordTitle} mx-auto mt-8 max-w-full text-balance break-words px-1 text-center print:mt-2 print:px-0 print:text-[clamp(1.125rem,1.45rem,1.95rem)] print:leading-[1.12]`}
        >
          {artwork.title}
        </h1>
        {yearMedium ? (
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-neutral-500 print:mt-1.5 print:text-xs">
            {yearMedium}
          </p>
        ) : null}
        {artistName ? (
          <div className="mx-auto mt-10 max-w-xl px-1 text-center print:mt-2 print:max-w-full">
            <p className={registryV2.type.metaLabel}>{t("certificate.document.attributedCreator")}</p>
            <p className={`${registryV2.type.sectionTitle} mt-3 text-xl sm:text-2xl print:mt-1.5 print:text-lg`}>
              {artistName}
            </p>
          </div>
        ) : null}
        {verifierName ? (
          <div className="mx-auto mt-8 max-w-xl px-1 text-center print:mt-2">
            <p className={labelClass}>{t("certificate.document.issuedBy")}</p>
            <p className="mt-2 text-sm text-neutral-700 print:text-xs">{verifierName}</p>
          </div>
        ) : null}
      </section>

      <section className="grid shrink-0 grid-cols-1 gap-10 border-y border-neutral-200/80 py-2 sm:grid-cols-3 sm:gap-12 print:grid-cols-3 print:gap-2 print:border-y print:border-neutral-200/90">
        <div className="min-w-0 px-1 py-2 sm:px-4 md:px-5 print:border-r print:border-neutral-200/80 print:px-2 print:py-2">
          <p className={labelClass}>{t("certificate.document.certificateNumber")}</p>
          <p className="mt-3 break-words font-mono text-[15px] font-medium tracking-[0.1em] text-neutral-900 print:mt-1.5 print:text-sm">
            {certificate.certificate_number}
          </p>
        </div>
        <div className="min-w-0 px-1 py-2 sm:px-4 md:px-5 print:border-r print:border-neutral-200/80 print:px-2 print:py-2">
          <p className={labelClass}>{t("certificate.document.dateIssued")}</p>
          <p className="mt-3 break-words text-[15px] font-normal tabular-nums text-neutral-900 print:mt-1.5 print:text-sm">
            {issuedDate}
          </p>
        </div>
        <div className="min-w-0 px-1 py-2 sm:px-4 md:px-5 print:px-2 print:py-2">
          <p className={labelClass}>{t("certificate.document.verificationNote")}</p>
          <p className="mt-3 text-sm leading-snug text-neutral-700 print:mt-1.5 print:text-xs">
            {t("certificate.document.verificationHint")}
          </p>
        </div>
      </section>

      <CertificateAuthenticityBlock
        certificateHash={certificate.certificate_hash}
        verificationHash={artwork.verification_hash}
        timelineHash={artwork.timeline_hash}
      />

      <footer className="mt-12 flex shrink-0 flex-col items-center gap-12 pt-12 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:pt-11 print:mt-2 print:flex-row print:items-end print:justify-between print:gap-4 print:border-t print:border-neutral-200/90 print:pt-2">
        <CertificateSeal
          level={sealLevel}
          size="document"
          label={t("certificate.document.digitalSeal")}
          sublabel={
            isRevoked
              ? t("registry.seal.revoked")
              : t("registry.seal.attested")
          }
          className="sm:items-start print:items-start"
        />
        <div className="flex min-w-0 flex-col items-center sm:items-end print:items-end">
          <div className="rounded-xl border border-neutral-200/90 bg-white p-3 shadow-sm print:rounded-sm print:p-2 print:shadow-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeDataUrl}
              alt=""
              className="box-border h-[5.5rem] w-[5.5rem] max-h-[5.5rem] max-w-full object-contain print:h-16 print:w-16 print:max-h-16 print:max-w-16"
              width={88}
              height={88}
            />
          </div>
          <p className="mt-4 max-w-[14rem] text-center text-[10px] leading-relaxed text-neutral-500 sm:text-right print:mt-1 print:text-right print:text-[9px]">
            {t("certificate.document.scanToVerify")}
          </p>
          <p className="mt-1 max-w-[14rem] break-all text-center font-mono text-[9px] text-neutral-400 sm:text-right print:text-[8px]">
            {verifyUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </footer>
    </CertificateDocumentFrame>
  );
}
