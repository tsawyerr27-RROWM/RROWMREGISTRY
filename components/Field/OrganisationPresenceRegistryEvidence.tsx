"use client";

import { ParticipationLayersStrip } from "@/components/Registry/ParticipationLayersStrip";
import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import type { OrganisationPresenceFootprint } from "@/lib/field-organisation-presence";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  verified: boolean;
  footprint: OrganisationPresenceFootprint;
  representedCreativesCount: number;
  participationLayers: ParticipationLayer[];
};

export function OrganisationPresenceRegistryEvidence({
  verified,
  footprint,
  representedCreativesCount,
  participationLayers,
}: Props) {
  const { t } = useLocalePreferences();
  const hasFootprint = footprint.totalRecords > 0 || footprint.verifiedRecords > 0;

  return (
    <div className="mt-8 max-w-2xl rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm md:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
        {t("field.organisation.registryEvidence")}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            verified
              ? "border border-emerald-900/15 bg-emerald-50 text-emerald-950"
              : "border border-neutral-200 bg-neutral-50 text-neutral-700"
          }`}
        >
          {verified
            ? t("field.organisation.verification.onFile")
            : t("field.organisation.verification.participant")}
        </span>
      </div>

      {hasFootprint ? (
        <p className="mt-4 text-sm text-neutral-700">
          {footprint.verifiedRecords > 0 ? (
            <>
              {fillMessage(t("field.organisation.verifiedRecordsLine"), {
                count: String(footprint.verifiedRecords),
              })}
            </>
          ) : null}
          {footprint.verifiedRecords > 0 && footprint.totalRecords > 0 ? " · " : null}
          {footprint.totalRecords > 0 ? (
            <>
              {fillMessage(t("field.organisation.totalRecordsLine"), {
                count: String(footprint.totalRecords),
              })}
            </>
          ) : null}
        </p>
      ) : (
        <p className="mt-4 text-sm text-neutral-600">
          {t("field.organisation.noRecordsOnFile")}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
            {t("field.organisation.representedCreatives")}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900">
            {representedCreativesCount}{" "}
            {representedCreativesCount === 1 ? "Creative" : "Creatives"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
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
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
            {t("field.organisation.participationHeading")}
          </p>
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
