"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { RegistryIntelligenceAssessment } from "@/lib/registry-intelligence";
import { registryIntelligenceDimensionLabelKey } from "@/lib/registry-intelligence";

type Props = {
  assessment: RegistryIntelligenceAssessment;
  className?: string;
};

function dimensionTone(id: string, level: string): string {
  if (id === "riskSignals" && level === "conflictsPresent") {
    return "text-red-900/90";
  }
  if (id === "riskSignals" && level === "reviewRecommended") {
    return "text-neutral-800";
  }
  return "text-neutral-900";
}

export function RegistryIntelligencePanel({ assessment, className = "" }: Props) {
  const { t } = useLocalePreferences();

  return (
    <section
      className={`rounded-[1.15rem] border border-neutral-900/[0.07] bg-white/70 p-6 md:p-8 ${className}`}
    >
      <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950 md:text-[1.35rem]">
        {t("registry.intelligence.panelLabel")}
      </h3>

      <dl className="mt-7 divide-y divide-neutral-900/[0.06]">
        {assessment.dimensions.map((dimension) => (
          <div
            key={dimension.id}
            className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-x-8"
          >
            <dt className="text-sm text-neutral-500">
              {t(registryIntelligenceDimensionLabelKey(dimension.id))}
            </dt>
            <dd className="min-w-0">
              <p
                className={`font-serif text-lg font-normal leading-snug ${dimensionTone(
                  dimension.id,
                  String(dimension.level)
                )}`}
              >
                {t(dimension.levelKey)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {t(dimension.explanationKey)}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
