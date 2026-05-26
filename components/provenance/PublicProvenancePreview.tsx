import Link from "next/link";
import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { chronologyTemporalRecallLines } from "@/lib/archival-temporal";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

function formatPreviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  /** When set, links to the registry verification page (trust + certificate state). */
  verificationHref?: string;
  maxEvents?: number;
}) {
  const { continuityIndicators, events } = bundle;
  const temporalRecall = chronologyTemporalRecallLines(bundle);
  const tail = [...events].slice(-maxEvents).reverse();

  return (
    <div className="space-y-6">
      {continuityIndicators.length > 0 ? (
        <ul className="space-y-2 border-l border-neutral-200 pl-4">
          {continuityIndicators.map((line) => (
            <li key={line} className="text-[13px] leading-relaxed text-neutral-700">
              <span className="mr-2 text-neutral-400">·</span>
              {line}
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
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                  {formatPreviewDate(ev.dateIso)}
                </p>
                <p className="mt-1 font-serif text-sm text-neutral-950">{ev.displayTitle}</p>
                {ev.participantLabel ? (
                  <p className="mt-0.5 text-[13px] text-neutral-600">{ev.participantLabel}</p>
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
          Full chronology
        </Link>
        {verificationHref ? (
          <Link
            href={verificationHref}
            className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
          >
            Current record
          </Link>
        ) : null}
      </p>
    </div>
  );
}
