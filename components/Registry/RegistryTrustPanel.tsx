"use client";

import { RegistryTrustSeal } from "@/components/Registry/RegistryTrustSeal";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import type { RegistryTrustPresentation } from "@/lib/registry-trust-model";
import {
  registryTrustLevelMessageKey,
  registryTrustPillarMessageKey,
} from "@/lib/registry-trust-model";
import { rrowmFloatingBlock, rrowmRegistrySurface, rrowmSurface } from "@/styles/rrowm-theme";

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
      ? rrowmRegistrySurface.trustPanel
      : variant === "compact"
        ? rrowmRegistrySurface.trustCompact
        : `${rrowmSurface.l3} p-5`;

  const levelClass =
    variant === "modal"
      ? "font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]"
      : "font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-[2.125rem]";

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
          <p className="mt-2 text-sm text-neutral-500">
            {t("registry.trust.panelLabel")}
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600 md:mt-7">
        {t(presentation.explanationKey)}
      </p>

      <div className="mt-8 border-t border-neutral-900/[0.06] pt-6 md:mt-9">
        <ul className="grid gap-3 sm:grid-cols-2">
          {presentation.pillars.map((pillar) => (
            <li
              key={pillar.id}
              className={`${rrowmFloatingBlock.compact} px-4 py-3 ${
                pillar.active ? "text-neutral-800" : "text-neutral-400"
              }`}
            >
              <span className="flex items-start gap-2.5 text-sm leading-snug">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    pillar.active ? "bg-[color:var(--rrowm-zone-accent)]" : "bg-neutral-300"
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
