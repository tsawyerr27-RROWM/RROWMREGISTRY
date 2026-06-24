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
import {
  isMajorProvenanceEvent,
  milestoneTierAccentClass,
  milestoneTierForKind,
} from "@/lib/provenance-milestones";
import { ProvenanceMilestoneShareControl } from "@/components/provenance/ProvenanceMilestoneShareControl";
import { rrowmRegistrySurface } from "@/styles/rrowm-theme";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  event: ArchivalTimelineEvent;
  locale: string;
  registryId: string;
  artworkTitle: string;
  isLast?: boolean;
};

export function ProvenanceEvidencePanel({
  event,
  locale,
  registryId,
  artworkTitle,
  isLast = false,
}: Props) {
  const { t } = useLocalePreferences();
  const major = isMajorProvenanceEvent(event.narrativeKind);
  const tier = milestoneTierForKind(event.narrativeKind);
  const accent = milestoneTierAccentClass(tier);
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

  if (major) {
    return (
      <li
        id={`event-${event.key}`}
        className={`group relative scroll-mt-28 list-none ${isLast ? "" : "pb-8 md:pb-10"}`}
      >
        <article
          className={`relative overflow-hidden ${rrowmRegistrySurface.trustCompact} border-l-[3px] transition duration-500 hover:-translate-y-0.5 ${accent} md:min-h-[148px]`}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#e8e4df]/40 blur-[72px] transition duration-700 group-hover:bg-[#e8e4df]/55"
            aria-hidden
          />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <time
                dateTime={event.dateIso}
                className="text-xs tabular-nums text-neutral-500"
              >
                {formatArchivalDate(event.dateIso, locale)}
              </time>
              <span className="text-xs text-neutral-400">
                {translateVerificationLabel(event.verificationLabel, t)}
              </span>
            </div>
            <h3 className="mt-4 font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-2xl">
              {eventTitle}
            </h3>
            {participantLabel ? (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-[15px]">
                {participantLabel}
              </p>
            ) : null}
            {shareContext ? (
              <div className="mt-6 border-t border-neutral-900/[0.06] pt-5">
                <p className="mb-3 text-xs font-medium text-neutral-700">
                  {t("provenance.share.sectionLabel")}
                </p>
                <ProvenanceMilestoneShareControl context={shareContext} />
              </div>
            ) : null}
            {footnotes.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                {footnotes.map((line) => (
                  <li key={line} className="inline-flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      </li>
    );
  }

  return (
    <li className={`list-none ${isLast ? "" : "pb-4 md:pb-5"}`}>
      <article className={`${rrowmRegistrySurface.chronology} border-l-2 transition duration-500 hover:-translate-y-0.5 ${accent}`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <time
            dateTime={event.dateIso}
            className="text-[11px] tabular-nums text-neutral-500"
          >
            {formatArchivalDate(event.dateIso, locale)}
          </time>
          <span className="text-[11px] text-neutral-400">
            {translateVerificationLabel(event.verificationLabel, t)}
          </span>
        </div>
        <h3 className="mt-2 font-serif text-base font-normal leading-snug text-neutral-900">
          {translateEventTitle(event, t)}
        </h3>
        {event.participantLabel ? (
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {translateParticipantLabel(event.participantLabel, t)}
          </p>
        ) : null}
        {footnotes.length > 0 ? (
          <p className="mt-3 text-xs text-neutral-500">{footnotes.join(" · ")}</p>
        ) : null}
      </article>
    </li>
  );
}
