"use client";

import { RegistryTrustSeal } from "@/components/Registry/RegistryTrustSeal";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import type { RegistryTrustPresentation } from "@/lib/registry-trust-model";
import {
  registryTrustLevelMessageKey,
  registryTrustPillarMessageKey,
} from "@/lib/registry-trust-model";

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
      ? "p-8 shadow-[0_24px_64px_-40px_rgba(15,23,42,0.22)] md:p-10"
      : variant === "compact"
        ? "p-6 md:p-7"
        : "p-5";

  const levelClass =
    variant === "modal"
      ? "font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]"
      : "font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-[2.125rem]";

  return (
    <article
      className={`rounded-[1.25rem] border border-neutral-900/[0.08] bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f4f0]/90 ${shellClass} ${className}`}
    >
      <div className="flex items-start gap-6 md:gap-8">
        <RegistryTrustSeal level={presentation.level} size={sealSize} />
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-sm text-neutral-600">
            {t("registry.trust.panelLabel")}
          </p>
          <h2 className={`mt-2 ${levelClass}`}>
            {t(registryTrustLevelMessageKey(presentation.level))}
          </h2>
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
              className={pillar.active ? "text-neutral-800" : "text-neutral-400"}
            >
              <span className="flex items-start gap-2.5 text-sm leading-snug">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    pillar.active ? "bg-neutral-700" : "bg-neutral-300"
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
