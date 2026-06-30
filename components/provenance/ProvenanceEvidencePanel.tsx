"use client";

import type { ArchivalTimelineEvent } from "@/lib/provenance-timeline";
import {
  formatArchivalDate,
  translateEventTitle,
  translateParticipantLabel,
  translateVerificationLabel,
} from "@/lib/archival-provenance-i18n";
import {
  buildProvenanceMilestoneShareContext,
  isShareableProvenanceMilestone,
} from "@/lib/provenance-share";
import { isMajorProvenanceEvent } from "@/lib/provenance-milestones";
import {
  registryEventCategory,
  registryEventCategoryMessageKey,
  registryEventSemanticEvent,
  registryEventSignalBarClass,
  registryEventStampClass,
} from "@/lib/registry-event-visual";
import { ProvenanceMilestoneShareControl } from "@/components/provenance/ProvenanceMilestoneShareControl";
import { registryV2 } from "@/styles/registry-v2";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  event: ArchivalTimelineEvent;
  locale: string;
  registryId: string;
  artworkTitle: string;
  isLast?: boolean;
  index?: number;
};

export function ProvenanceEvidencePanel({
  event,
  locale,
  registryId,
  artworkTitle,
  isLast = false,
  index = 0,
}: Props) {
  const { t } = useLocalePreferences();
  const major = isMajorProvenanceEvent(event.narrativeKind);
  const category = registryEventCategory(event.narrativeKind);
  const stampClass = registryEventStampClass(category);
  const signalBar = registryEventSignalBarClass(category);
  const eventTitle = translateEventTitle(event, t);
  const participantLabel = event.participantLabel
    ? translateParticipantLabel(event.participantLabel, t)
    : null;
  const shareContext =
    major && isShareableProvenanceMilestone(event)
      ? buildProvenanceMilestoneShareContext({
          registryId,
          artworkTitle,
          event,
          eventTitle,
          participantContext: participantLabel,
        })
      : null;

  const footnotes = [
    event.hasSupportingEvidence ? t("provenance.supportingMaterial") : null,
    event.certificateRelated ? t("provenance.certificateOnFile") : null,
  ].filter(Boolean);

  const filingClass = major
    ? registryV2.surface.filingMajor
    : registryV2.surface.filing;
  const motionClass = registryV2.motion.forEvent(
    registryEventSemanticEvent(category)
  );

  return (
    <li
      id={`event-${event.key}`}
      className={`registry-chronology-filing list-none scroll-mt-28 ${
        isLast ? "registry-chronology-filing--last" : "pb-8 md:pb-10"
      } ${motionClass}`}
      style={{ animationDelay: `${Math.min(index, 8) * 0.08}s` }}
    >
      <div className="relative z-10 flex flex-col items-center pt-1">
        <span
          className={`${registryV2.type.stamp} ${stampClass}`}
          aria-hidden
        >
          {t(registryEventCategoryMessageKey(category))}
        </span>
        <span className={`${signalBar} mt-3 h-8 w-[2px] min-h-0`} aria-hidden />
      </div>

      <article
        className={`relative min-w-0 ${filingClass} ${registryV2.motion.hover} pl-5 md:pl-6`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-[var(--v2-border)] pb-4">
          <time
            dateTime={event.dateIso}
            className={`${registryV2.type.monoId} tabular-nums`}
          >
            {formatArchivalDate(event.dateIso, locale)}
          </time>
          <span className="v2-type-label text-[9px] tracking-[0.2em] text-[var(--v2-cool-grey)]">
            {t("registry.event.filed")} ·{" "}
            {translateVerificationLabel(event.verificationLabel, t)}
          </span>
        </div>

        <h3
          className={`mt-5 ${
            major ? registryV2.type.sectionTitle : "v2-type-display text-lg text-[var(--v2-ink)]"
          }`}
        >
          {eventTitle}
        </h3>

        {participantLabel ? (
          <p className={`${registryV2.type.metaValue} mt-4 max-w-2xl`}>
            {participantLabel}
          </p>
        ) : null}

        {shareContext ? (
          <div className="mt-6 border-t border-[var(--v2-border)] pt-5">
            <p className={`${registryV2.type.metaLabel} mb-3`}>
              {t("provenance.share.sectionLabel")}
            </p>
            <ProvenanceMilestoneShareControl context={shareContext} />
          </div>
        ) : null}

        {footnotes.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
            {footnotes.map((line) => (
              <li key={line} className={`${registryV2.type.monoId} inline-flex items-center gap-2`}>
                <span className="h-1 w-1 rounded-full bg-[var(--v2-cobalt-signal)]" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </li>
  );
}
