"use client";

import { RegistryTrustSeal } from "@/components/Registry/RegistryTrustSeal";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import type { RegistryTrustPresentation } from "@/lib/registry-trust-model";
import {
  registryTrustLevelMessageKey,
  registryTrustPillarMessageKey,
} from "@/lib/registry-trust-model";
import { rrowmSurface } from "@/styles/rrowm-theme";
import { registryV2 } from "@/styles/registry-v2";

export type RegistryTrustPanelVariant = "hero" | "compact" | "modal";

type Props = {
  presentation: RegistryTrustPresentation;
  variant?: RegistryTrustPanelVariant;
  className?: string;
};

export function RegistryTrustPanel({
  presentation,
  variant = "hero",
  className = "",
}: Props) {
  const { t } = useLocalePreferences();
  const sealSize = variant === "hero" ? "lg" : "md";

  const shellClass =
    variant === "hero"
      ? `${registryV2.surface.filingMajor} p-8 md:p-10`
      : variant === "compact"
        ? `${registryV2.surface.filing} p-6 md:p-7`
        : `${rrowmSurface.l3} p-5`;

  const levelClass =
    variant === "modal"
      ? `${registryV2.type.sectionTitle} text-2xl md:text-[1.75rem]`
      : variant === "compact"
        ? `${registryV2.type.sectionTitle} text-xl md:text-2xl`
        : `${registryV2.type.recordTitle} text-3xl md:text-[2.125rem]`;

  return (
    <article className={`relative ${shellClass} ${className}`}>
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_40%,transparent)] to-transparent md:inset-x-10"
        aria-hidden
      />

      <div className="flex items-start gap-6 md:gap-8">
        <RegistryTrustSeal level={presentation.level} size={sealSize} />
        <div className="min-w-0 flex-1 pt-1">
          <h2 className={levelClass}>
            {t(registryTrustLevelMessageKey(presentation.level))}
          </h2>
          <p className={`${registryV2.type.metaLabel} mt-2`}>
            {t("registry.trust.panelLabel")}
          </p>
        </div>
      </div>

      <p className={`${registryV2.type.metaValue} mt-6 max-w-2xl md:mt-7`}>
        {t(presentation.explanationKey)}
      </p>

      <div className="mt-8 border-t border-[var(--v2-border)] pt-6 md:mt-9">
        <ul className="grid gap-3 sm:grid-cols-2">
          {presentation.pillars.map((pillar) => (
            <li
              key={pillar.id}
              className={`${registryV2.surface.metadataField} ${
                pillar.active ? "text-[var(--v2-ink)]" : "text-[var(--v2-cool-grey)]"
              }`}
            >
              <span className={`flex items-start gap-2.5 ${registryV2.type.metaValue} text-sm`}>
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    pillar.active ? "bg-[var(--v2-cobalt-signal)]" : "bg-[var(--v2-border-strong)]"
                  }`}
                  aria-hidden
                />
                {t(registryTrustPillarMessageKey(pillar.id))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {presentation.verifierName ? (
        <p className="mt-5 text-xs leading-relaxed text-neutral-500">
          {fillMessage(t("registry.record.verificationBy"), {
            name: presentation.verifierName,
          })}
        </p>
      ) : null}
    </article>
  );
}
