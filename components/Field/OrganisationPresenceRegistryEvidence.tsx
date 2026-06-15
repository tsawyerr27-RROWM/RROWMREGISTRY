"use client";

import { ParticipationLayersStrip } from "@/components/Registry/ParticipationLayersStrip";
import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import type { OrganisationPresenceFootprint } from "@/lib/field-organisation-presence";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  footprint: OrganisationPresenceFootprint;
  representedCreativesCount: number;
  participationLayers: ParticipationLayer[];
};

export function OrganisationPresenceRegistryEvidence({
  footprint,
  representedCreativesCount,
  participationLayers,
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <div className="mt-8 max-w-2xl rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm md:p-6">
      <h2 className="font-serif text-lg font-normal text-neutral-950">
        {t("field.organisation.registryEvidence")}
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
          <p className="text-sm text-neutral-500">
            {t("field.organisation.representedCreatives")}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900">
            {representedCreativesCount}{" "}
            {representedCreativesCount === 1 ? "Creative" : "Creatives"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
          <p className="text-sm text-neutral-500">
            {t("field.organisation.certificates")}
          </p>
          <p className="mt-1 text-sm text-neutral-800">
            {footprint.certificateCount > 0 ? (
              <>
                {fillMessage(t("field.organisation.certificatesLine"), {
                  count: String(footprint.certificateCount),
                })}
                {footprint.revokedCertificateCount > 0 ? (
                  <>
                    {" "}
                    ·{" "}
                    {fillMessage(t("field.organisation.certificatesRevokedLine"), {
                      count: String(footprint.revokedCertificateCount),
                    })}
                  </>
                ) : null}
              </>
            ) : (
              t("field.organisation.noCertificates")
            )}
          </p>
        </div>
      </div>

      {participationLayers.length > 0 ? (
        <div className="mt-5 border-t border-neutral-900/[0.05] pt-5">
          <h3 className="mb-3 text-sm font-medium text-neutral-700">
            {t("field.organisation.participationHeading")}
          </h3>
          <ParticipationLayersStrip
            layers={participationLayers}
            variant="light"
            showFootnote={false}
          />
        </div>
      ) : null}
    </div>
  );
}
