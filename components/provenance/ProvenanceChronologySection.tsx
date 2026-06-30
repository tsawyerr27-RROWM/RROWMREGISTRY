"use client";

import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { chronologyTemporalRecallLinesI18n } from "@/lib/archival-provenance-i18n";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { ProvenanceCompletenessBand } from "@/components/provenance/ProvenanceCompletenessBand";
import { ProvenanceEvidencePanel } from "@/components/provenance/ProvenanceEvidencePanel";
import { ProvenanceMilestoneRail } from "@/components/provenance/ProvenanceMilestoneRail";
import { registryV2 } from "@/styles/registry-v2";

type Props = {
  bundle: ArchivalProvenanceBundle;
  registryId: string;
  artworkTitle: string;
};

export function ProvenanceChronologySection({
  bundle,
  registryId,
  artworkTitle,
}: Props) {
  const { t, region } = useLocalePreferences();
  const { events, recordCompleteness, continuityIndicators } = bundle;
  const temporalRecall = chronologyTemporalRecallLinesI18n(bundle, t);

  if (!events.length) {
    return (
      <p className="text-sm leading-relaxed text-neutral-600">{t("provenance.empty")}</p>
    );
  }

  return (
    <div className="space-y-10 md:space-y-12">
      <ProvenanceCompletenessBand
        recordCompleteness={recordCompleteness}
        continuityIndicators={continuityIndicators}
      />

      <div>
        <div className="v2-surface-archive-sheet pl-5 md:pl-6">
          <h3 className={registryV2.type.sectionTitle}>
            {t("provenance.chronology")}
          </h3>
          <p className={`${registryV2.type.metaValue} mt-4 max-w-2xl`}>
            {t("provenance.chronologyIntro")}
          </p>
        </div>

        {temporalRecall.length > 0 ? (
          <div className="mt-5 max-w-2xl space-y-2 text-sm leading-relaxed text-neutral-500">
            {temporalRecall.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}

        <ProvenanceMilestoneRail events={events} />

        <ol className="mt-10 list-none space-y-0 p-0" role="list">
          {events.map((ev, i) => (
            <ProvenanceEvidencePanel
              key={ev.key}
              event={ev}
              locale={region.locale}
              registryId={registryId}
              artworkTitle={artworkTitle}
              isLast={i === events.length - 1}
              index={i}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
