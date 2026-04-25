"use client";

import type { ProvenanceTimelineRow, ProvenanceViewContext } from "@/lib/get-public-provenance";

function formatExactWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
}

export function ProvenanceTimeline({
  viewContext,
  entries,
}: {
  viewContext: ProvenanceViewContext;
  entries: ProvenanceTimelineRow[];
}) {
  if (!entries.length) {
    return (
      <p className="text-sm text-neutral-500">
        No additional registry activity has been published for this record.
      </p>
    );
  }

  const showExact = viewContext !== "public";
  const showSource = viewContext === "gallery";

  return (
    <div className="relative pl-6 sm:pl-8">
      <div
        className="absolute left-[7px] top-1 bottom-2 w-px bg-neutral-200 sm:left-[9px]"
        aria-hidden
      />
      <ul className="space-y-10 sm:space-y-12">
        {entries.map((row, idx) => (
          <li key={`${row.kind}-${idx}`} className="relative">
            <span
              className="absolute -left-6 top-1.5 h-2 w-2 rounded-full border border-neutral-300 bg-white sm:-left-8"
              aria-hidden
            />
            {row.kind === "single" ? (
              <div>
                <p className="text-xs text-neutral-400">{row.dateLabel}</p>
                {showExact ? (
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
                    {formatExactWhen(row.occurredAtIso)}
                  </p>
                ) : null}
                <p className="mt-1.5 font-serif text-lg font-normal text-neutral-950">{row.title}</p>
                {row.description ? (
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-600">
                    {row.description}
                  </p>
                ) : null}
                {showSource && row.sourceNote ? (
                  <p className="mt-2 max-w-xl text-xs text-neutral-500">{row.sourceNote}</p>
                ) : null}
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-400">{row.dateLabel}</p>
                <p className="mt-1.5 font-serif text-lg font-normal text-neutral-950">{row.title}</p>
                <ul className="mt-4 space-y-3 border-t border-black/[0.06] pt-4">
                  {row.items.map((item, j) => (
                    <li key={j}>
                      {showExact ? (
                        <p className="font-mono text-[11px] text-neutral-500">
                          {formatExactWhen(item.occurredAtIso)}
                        </p>
                      ) : null}
                      <p className="mt-0.5 text-sm leading-relaxed text-neutral-800">{item.title}</p>
                      {item.description ? (
                        <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
                      ) : null}
                      {showSource && item.sourceNote ? (
                        <p className="mt-1 text-xs text-neutral-500">{item.sourceNote}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
