"use client";

import Link from "next/link";
import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import {
  chronologyTemporalRecallLinesI18n,
  formatArchivalDate,
  translateContinuityIndicator,
  translateEventTitle,
  translateParticipantLabel,
} from "@/lib/archival-provenance-i18n";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

/**
 * Short continuity + chronology preview. Full narrative: /artwork/[id]/provenance.
 * Current record surface: /verify/[id].
 */
export function PublicProvenancePreview({
  bundle,
  provenanceHref,
  verificationHref,
  maxEvents = 4,
}: {
  bundle: ArchivalProvenanceBundle;
  provenanceHref: string;
  verificationHref?: string;
  maxEvents?: number;
}) {
  const { t, region } = useLocalePreferences();
  const { continuityIndicators, events } = bundle;
  const temporalRecall = chronologyTemporalRecallLinesI18n(bundle, t);
  const tail = [...events].slice(-maxEvents).reverse();

  return (
    <div className="space-y-6">
      {continuityIndicators.length > 0 ? (
        <ul className="space-y-2 border-l border-neutral-200 pl-4">
          {continuityIndicators.map((line) => (
            <li key={line} className="text-[13px] leading-relaxed text-neutral-700">
              <span className="mr-2 text-neutral-400">·</span>
              {translateContinuityIndicator(line, t)}
            </li>
          ))}
        </ul>
      ) : null}

      {temporalRecall.length > 0 ? (
        <div className="space-y-2 border-l border-neutral-200/80 pl-4">
          {temporalRecall.map((line) => (
            <p
              key={line}
              className="text-[12px] leading-relaxed text-neutral-500 first:pt-0.5"
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {tail.length > 0 ? (
        <div className="space-y-3">
          <InfoTooltip text="Each work keeps one catalogue row. What follows is the latest stretch of its chronology on file." />
          <ol className="list-none space-y-3 p-0">
            {tail.map((ev) => (
              <li
                key={ev.key}
                className="border-b border-neutral-200/80 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-[13px] text-neutral-500">
                  {formatArchivalDate(ev.dateIso, region.locale)}
                </p>
                <p className="mt-1 font-serif text-sm text-neutral-950">
                  {translateEventTitle(ev, t)}
                </p>
                {ev.participantLabel ? (
                  <p className="mt-0.5 text-[13px] text-neutral-600">
                    {translateParticipantLabel(ev.participantLabel, t)}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
        <Link
          href={provenanceHref}
          className="text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
        >
          {t("provenance.fullChronology")}
        </Link>
        {verificationHref ? (
          <Link
            href={verificationHref}
            className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
          >
            {t("provenance.currentRecord")}
          </Link>
        ) : null}
      </p>
    </div>
  );
}
