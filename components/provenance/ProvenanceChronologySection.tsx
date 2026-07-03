"use client";

import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { chronologyTemporalRecallLinesI18n } from "@/lib/archival-provenance-i18n";
import {
  groupProvenanceEventsByPhase,
  provenancePhaseMessageKey,
} from "@/lib/provenance-chronology-phases";
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
  const phaseGroups = groupProvenanceEventsByPhase(events);

  if (!events.length) {
    return (
      <p className="text-sm leading-relaxed text-neutral-600">{t("provenance.empty")}</p>
    );
  }

  let eventIndex = 0;

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

        <div className="mt-10 space-y-12 md:space-y-14">
          {phaseGroups.map((group) => (
            <section key={group.phase} aria-labelledby={`phase-${group.phase}`}>
              <div className="mb-6 flex items-center gap-4 border-b border-[var(--v2-border)] pb-4">
                <h4
                  id={`phase-${group.phase}`}
                  className="v2-type-display text-lg text-[var(--v2-ink)] md:text-xl"
                >
                  {t(provenancePhaseMessageKey(group.phase))}
                </h4>
                <span className={`${registryV2.type.monoId} text-[var(--v2-cool-grey)]`}>
                  {group.events.length}
                </span>
              </div>
              <ol className="list-none space-y-0 p-0" role="list">
                {group.events.map((ev, i) => {
                  const index = eventIndex++;
                  const isLastInSection = i === group.events.length - 1;
                  const isLastOverall =
                    group.phase === phaseGroups[phaseGroups.length - 1]?.phase &&
                    isLastInSection;
                  return (
                    <ProvenanceEvidencePanel
                      key={ev.key}
                      event={ev}
                      locale={region.locale}
                      registryId={registryId}
                      artworkTitle={artworkTitle}
                      phase={group.phase}
                      isLast={isLastOverall}
                      index={index}
                    />
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
