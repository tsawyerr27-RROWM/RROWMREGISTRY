"use client";

import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  parseArtworkTrustTier,
  type ArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import {
  registryTrustTierHeadlineKey,
  registryTrustTierSublineKey,
} from "@/lib/registry-trust-tier-display";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  verificationStatus: string | null | undefined;
  certificateTierLabel?: string | null;
  revoked?: boolean;
  className?: string;
};

export function RegistryTrustTierStrip({
  verificationStatus,
  certificateTierLabel,
  revoked = false,
  className = "",
}: Props) {
  const { t } = useLocalePreferences();
  const tier: ArtworkTrustTier = parseArtworkTrustTier(verificationStatus);

  return (
    <div
      className={`${registryV2.surface.metadataField} border-l-2 ${
        tier === "verified"
          ? "border-l-[var(--v2-certification-signal)]"
          : tier === "self_attested"
            ? "border-l-[var(--v2-cobalt-signal)]"
            : "border-l-[var(--v2-border-strong)]"
      } ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`${registryV2.type.metaLabel} text-[var(--v2-cool-grey)]`}>
            {t("registry.record.field.trustTier")}
          </p>
          <p className={`${registryV2.type.sectionTitle} mt-2 text-xl md:text-[1.45rem]`}>
            {revoked
              ? t("registry.record.trust.revokedHeadline")
              : t(registryTrustTierHeadlineKey(tier))}
          </p>
          <p className={`${registryV2.type.metaValue} mt-2 max-w-xl`}>
            {revoked
              ? t("registry.record.trust.revokedSub")
              : t(registryTrustTierSublineKey(tier))}
          </p>
        </div>
        {!revoked ? (
          <ArtworkTrustBadge
            verificationStatus={verificationStatus}
            showTooltip={false}
            className="shrink-0"
          />
        ) : null}
      </div>

      {certificateTierLabel ? (
        <div className="mt-5 border-t border-[var(--v2-border)] pt-4">
          <p className={registryV2.type.metaLabel}>
            {t("registry.record.field.certificateTier")}
          </p>
          <p className={`${registryV2.type.metaValue} mt-2 font-medium text-[var(--v2-ink)]`}>
            {certificateTierLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
