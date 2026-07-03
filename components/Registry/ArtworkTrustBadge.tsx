"use client";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  parseArtworkTrustTier,
  trustTierBadgeClass,
  trustTierLabelKey,
  trustTierTooltipKey,
  type ArtworkTrustTier,
} from "@/lib/artwork-trust-tier";

type Props = {
  verificationStatus: string | null | undefined;
  className?: string;
  showTooltip?: boolean;
  /** Subtle certification pulse — applied only to the verified seal tier */
  pulse?: boolean;
};

export function ArtworkTrustBadge({
  verificationStatus,
  className = "",
  showTooltip = true,
  pulse = false,
}: Props) {
  const { t } = useLocalePreferences();
  const tier: ArtworkTrustTier = parseArtworkTrustTier(verificationStatus);
  const label = t(trustTierLabelKey(tier));
  const pulseClass = pulse && tier === "verified" ? "rrowm-trust-pulse" : "";

  const badge = (
    <span className={`${trustTierBadgeClass(tier)} ${pulseClass} ${className}`.trim()}>
      {label}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <span className="inline-flex items-center gap-1.5">
      {badge}
      <InfoTooltip theme="light" text={t(trustTierTooltipKey(tier))} />
    </span>
  );
}
