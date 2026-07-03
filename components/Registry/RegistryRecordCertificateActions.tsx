"use client";

import Link from "next/link";

import { CertificateShareControl } from "@/components/certificate/CertificateShareControl";
import { RegistryCertificateOverviewButton } from "@/components/certificate/RegistryCertificateOverviewButton";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { CertificateShareContext } from "@/lib/certificate-share";
import {
  canParticipateInOwnershipFlow,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";

type Props = {
  registryId: string;
  verificationStatus: string | null | undefined;
  hasCertificate: boolean;
  certRevoked: boolean;
  certificateShareContext: CertificateShareContext | null;
};

export function RegistryRecordCertificateActions({
  registryId,
  verificationStatus,
  hasCertificate,
  certRevoked,
  certificateShareContext,
}: Props) {
  const { t } = useLocalePreferences();
  const tier = parseArtworkTrustTier(verificationStatus);
  const canViewCertificate =
    canParticipateInOwnershipFlow(verificationStatus) && hasCertificate && !certRevoked;
  const canShare =
    Boolean(certificateShareContext) &&
    certificateShareContext!.publicity === "full";

  if (certRevoked) {
    return (
      <p className="text-sm leading-relaxed text-red-800/90">
        {t("registry.record.trust.revokedSub")}
      </p>
    );
  }

  if (canViewCertificate) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={`/certificate/${encodeURIComponent(registryId)}`}
            className="v2-cta-primary block min-h-[44px] py-3 text-center text-xs sm:inline-flex sm:min-w-[11rem] sm:items-center sm:justify-center"
          >
            {t("registry.record.viewCertificate")}
          </Link>
          {canShare ? (
            <Link
              href={`/verify/${encodeURIComponent(registryId)}`}
              className="v2-cta-secondary block min-h-[44px] py-3 text-center text-xs sm:inline-flex sm:min-w-[11rem] sm:items-center sm:justify-center"
            >
              {t("registry.card.verifyCert")}
            </Link>
          ) : null}
        </div>
        {canShare && certificateShareContext ? (
          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--v2-cool-grey)]">
              {t("certificate.share.sectionLabel")}
            </p>
            <CertificateShareControl context={certificateShareContext} />
          </div>
        ) : null}
      </div>
    );
  }

  if (tier === "filed") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={`/verify/${encodeURIComponent(registryId)}`}
          className="v2-cta-primary block min-h-[44px] py-3 text-center text-xs sm:inline-flex sm:min-w-[11rem] sm:items-center sm:justify-center"
        >
          {t("registry.card.verifyCert")}
        </Link>
      </div>
    );
  }

  if (hasCertificate) {
    return <RegistryCertificateOverviewButton registryId={registryId} />;
  }

  return (
    <p className="text-sm leading-relaxed text-[var(--v2-ink-soft)]">
      {t("registry.record.certNotRecorded")}
    </p>
  );
}
