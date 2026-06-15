"use client";

import { ParticipationLayersStrip } from "@/components/Registry/ParticipationLayersStrip";
import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import type { CreativePracticeChip } from "@/lib/practices";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  participationLayers: ParticipationLayer[];
  declaredPractices: CreativePracticeChip[];
  registryPractices: CreativePracticeChip[];
  showOwnerPracticeGuidance: boolean;
};

export function CreativePresenceRegistryEvidence({
  participationLayers,
  declaredPractices,
  registryPractices,
  showOwnerPracticeGuidance,
}: Props) {
  const { t } = useLocalePreferences();
  const hasPractices = declaredPractices.length > 0 || registryPractices.length > 0;
  const hasParticipation = participationLayers.length > 0;
  const hasContent =
    hasParticipation || hasPractices || showOwnerPracticeGuidance;

  if (!hasContent) return null;

  return (
    <div className="mt-8 max-w-2xl rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm md:p-6">
      <h2 className="font-serif text-lg font-normal text-neutral-950">
        {t("field.creative.registryEvidence")}
      </h2>

      {hasParticipation ? (
        <div className="mt-5 border-t border-neutral-900/[0.05] pt-5">
          <h3 className="mb-3 text-sm font-medium text-neutral-700">
            {t("field.creative.participationHeading")}
          </h3>
          <ParticipationLayersStrip
            layers={participationLayers}
            variant="light"
            showFootnote={false}
          />
        </div>
      ) : null}

      {hasPractices ? (
        <div className="mt-5 border-t border-neutral-900/[0.05] pt-5">
          {declaredPractices.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-neutral-700">
                {t("field.creative.practice.declaredHeading")}
              </h3>
              <div className="mt-3">
                <FieldCreativePracticeChips
                  practices={declaredPractices}
                  showLegend={declaredPractices.length > 0 && registryPractices.length > 0}
                />
              </div>
            </div>
          ) : null}
          {registryPractices.length > 0 ? (
            <div className={declaredPractices.length > 0 ? "mt-4" : ""}>
              <h3 className="text-sm font-medium text-neutral-700">
                {t("field.creative.practice.registryHeading")}
              </h3>
              <div className="mt-3">
                <FieldCreativePracticeChips
                  practices={registryPractices}
                  showLegend={
                    declaredPractices.length === 0 && registryPractices.length > 0
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showOwnerPracticeGuidance ? (
        <p className="mt-5 border-t border-neutral-900/[0.05] pt-5 text-sm leading-relaxed text-neutral-600">
          {t("field.creative.practice.ownerGuidance")}
        </p>
      ) : null}
    </div>
  );
}
