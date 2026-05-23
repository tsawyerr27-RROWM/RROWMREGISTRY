"use client";

import type {
  ArchivalProvenanceBundle,
  ArchivalTimelineEvent,
} from "@/lib/provenance-timeline";
import {
  recordCompletenessDescription,
  recordCompletenessLabel,
} from "@/lib/record-completeness";
import { chronologyTemporalRecallLines } from "@/lib/archival-temporal";

function kindGlyph(kind: ArchivalTimelineEvent["narrativeKind"]): string {
  switch (kind) {
    case "registration":
      return "◆";
    case "institutional_confirmation":
      return "◇";
    case "artist_confirmation":
      return "○";
    case "certificate":
      return "▫";
    case "provenance_continuation":
      return "→";
    case "transfer":
      return "·";
    case "evidence":
      return "┄";
    case "dispute_open":
      return "†";
    case "dispute_resolved":
      return "※";
    default:
      return "·";
  }
}

function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EventRow({
  ev,
  isLast,
  relaxedSpacing,
}: {
  ev: ArchivalTimelineEvent;
  isLast: boolean;
  relaxedSpacing?: boolean;
}) {
  const pb = relaxedSpacing ? "pb-14 md:pb-[4.25rem]" : "pb-12 md:pb-16";
  return (
    <li className="relative flex gap-0">
      <div className="relative flex w-10 shrink-0 flex-col items-center pt-1 md:w-11">
        {!isLast ? (
          <span
            className="absolute left-1/2 top-4 bottom-0 w-px -translate-x-1/2 bg-stone-200/90"
            aria-hidden
          />
        ) : null}
        <span
          className="relative z-[1] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300/80 bg-[#fafaf8] font-serif text-[11px] leading-none text-stone-500"
          aria-hidden
        >
          {kindGlyph(ev.narrativeKind)}
        </span>
      </div>
      <div
        className={`min-w-0 flex-1 ${isLast ? "" : `border-b border-stone-200/50 ${pb}`}`}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <time
            dateTime={ev.dateIso}
            className="text-[11px] font-normal uppercase tracking-[0.12em] text-stone-500"
          >
            {formatStamp(ev.dateIso)}
          </time>
          <span className="text-[11px] text-stone-400">{ev.verificationLabel}</span>
        </div>
        <h3 className="mt-3 font-serif text-lg font-normal leading-snug text-neutral-950 md:text-[1.125rem]">
          {ev.displayTitle}
        </h3>
        {ev.participantLabel ? (
          <p className="mt-3 text-[13px] leading-relaxed text-stone-600 md:text-[0.9375rem]">
            {ev.participantLabel}
          </p>
        ) : null}
        {(ev.hasSupportingEvidence || ev.certificateRelated) && (
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[10px] uppercase tracking-[0.1em] text-stone-500">
            {ev.hasSupportingEvidence ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-stone-300" aria-hidden>
                  ·
                </span>
                Supporting material attached
              </span>
            ) : null}
            {ev.certificateRelated ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-stone-300" aria-hidden>
                  ·
                </span>
                Certificate on file
              </span>
            ) : null}
          </p>
        )}
      </div>
    </li>
  );
}

export function ArchivalProvenanceTimeline({
  bundle,
}: {
  bundle: ArchivalProvenanceBundle;
}) {
  const { events, recordCompleteness, continuityIndicators } = bundle;
  const levelWord = recordCompletenessLabel(recordCompleteness);
  const temporalRecall = chronologyTemporalRecallLines(bundle);

  if (!events.length) {
    return (
      <p className="text-sm leading-relaxed text-stone-600">
        No chronology milestones are on file for this work yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {/* Chronology first — emotional center */}
      <div>
        <h3 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
          Chronology
        </h3>
        <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-stone-500">
          Entries accumulate; later filings sit alongside earlier ones. Multiple
          participants may appear as confirmations and custody steps are documented.
        </p>
        {temporalRecall.length > 0 ? (
          <div className="mt-6 max-w-xl space-y-2 text-[12px] leading-relaxed text-stone-500/95">
            {temporalRecall.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        <div
          className={
            events.length >= 6
              ? "mt-10 border-l border-stone-200/70 pl-5 md:mt-12 md:pl-6"
              : "mt-10 md:mt-12"
          }
        >
          <ol className="list-none p-0" role="list">
            {events.map((ev, i) => (
              <EventRow
                key={ev.key}
                ev={ev}
                isLast={i === events.length - 1}
                relaxedSpacing={events.length >= 6}
              />
            ))}
          </ol>
        </div>
      </div>

      {/* Secondary context — quieter, below the story */}
      <div className="mt-16 border-t border-stone-200/70 pt-12 md:mt-20 md:pt-16">
        <div className="space-y-10">
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-stone-400">
              How the file reads
            </p>
            <p className="mt-2 font-serif text-lg font-normal text-stone-800">{levelWord}</p>
            <p className="mt-3 max-w-xl text-[13px] leading-[1.65] text-stone-500">
              {recordCompletenessDescription(recordCompleteness)}
            </p>
          </div>

          {continuityIndicators.length > 0 ? (
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-stone-400">
                Continuity markers
              </p>
              <ul className="mt-5 space-y-3">
                {continuityIndicators.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-[13px] leading-relaxed text-stone-600"
                  >
                    <span className="text-stone-300 select-none" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
