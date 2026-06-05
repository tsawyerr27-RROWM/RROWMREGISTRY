"use client";

import { ParticipationLayersStrip } from "@/components/Registry/ParticipationLayersStrip";
import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import type { CreativePracticeChip } from "@/lib/practices";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  verifiedWorkCount: number;
  totalWorkCount: number;
  participationLayers: ParticipationLayer[];
  declaredPractices: CreativePracticeChip[];
  registryPractices: CreativePracticeChip[];
  showOwnerPracticeGuidance: boolean;
};

export function CreativePresenceRegistryEvidence({
  verifiedWorkCount,
  totalWorkCount,
  participationLayers,
  declaredPractices,
  registryPractices,
  showOwnerPracticeGuidance,
}: Props) {
  const { t } = useLocalePreferences();
  const hasWorks = verifiedWorkCount > 0 || totalWorkCount > 0;
  const hasPractices = declaredPractices.length > 0 || registryPractices.length > 0;

  return (
    <div className="mt-8 max-w-2xl rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
        {t("field.creative.registryEvidence")}
      </p>
      {hasWorks ? (
        <p className="mt-2 text-sm text-neutral-700">
          {verifiedWorkCount > 0 ? (
            <>
              {fillMessage(t("field.creative.verifiedWorksLine"), {
                count: String(verifiedWorkCount),
              })}
            </>
          ) : null}
          {verifiedWorkCount > 0 && totalWorkCount > 0 ? " · " : null}
          {totalWorkCount > 0 ? (
            <>
              {fillMessage(t("field.creative.publicFootprintLine"), {
                count: String(totalWorkCount),
              })}
            </>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-sm text-neutral-600">
          {t("field.creative.noWorksOnFile")}
        </p>
      )}

      {participationLayers.length > 0 ? (
        <div className="mt-5 border-t border-neutral-900/[0.05] pt-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
            {t("field.creative.participationHeading")}
          </p>
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
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
                {t("field.creative.practice.declaredHeading")}
              </p>
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
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
                {t("field.creative.practice.registryHeading")}
              </p>
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
