"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  aggregateReadinessCounts,
  computeRecordReadiness,
  type ReadinessArtworkFields,
  type RecordReadinessStatus,
} from "@/lib/gallery-record-readiness";

type Props = {
  artworks: ReadinessArtworkFields[];
  ownershipByArtworkId: Record<string, number>;
  hasDeclaredValueByArtworkId: Record<string, boolean>;
  onGoToRoster: () => void;
};

function statusPillClass(status: RecordReadinessStatus): string {
  if (status === "ready")
    return "bg-emerald-500/10 text-emerald-900 ring-1 ring-emerald-900/10";
  if (status === "needs_attention")
    return "bg-amber-500/10 text-amber-950 ring-1 ring-amber-900/12";
  return "bg-neutral-900/[0.06] text-neutral-800 ring-1 ring-black/[0.06]";
}

function statusLabel(status: RecordReadinessStatus): string {
  if (status === "ready") return "Ready";
  if (status === "needs_attention") return "Needs attention";
  return "Incomplete";
}

function displayTitle(artwork: ReadinessArtworkFields): string {
  const t = (artwork.title || "").trim() || "Untitled";
  const y = artwork.year != null && String(artwork.year).trim();
  return y ? `${t} (${String(artwork.year).trim()})` : t;
}

export function RecordReadinessSection({
  artworks,
  ownershipByArtworkId,
  hasDeclaredValueByArtworkId,
  onGoToRoster,
}: Props) {
  if (artworks.length === 0) return null;

  const rows = artworks.map((w) => {
    const oc = ownershipByArtworkId[w.id] ?? 0;
    const dv = Boolean(hasDeclaredValueByArtworkId[w.id]);
    const r = computeRecordReadiness(w, oc, dv);
    return { artwork: w, ...r };
  });

  const counts = aggregateReadinessCounts(rows);
  const affected = rows
    .filter((r) => r.status !== "ready")
    .sort((a, b) => {
      const order: Record<RecordReadinessStatus, number> = {
        incomplete: 0,
        needs_attention: 1,
        ready: 2,
      };
      return order[a.status] - order[b.status];
    });

  return (
    <section className="mb-8 rounded-2xl border border-neutral-900/[0.06] bg-white/50 p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7">
      <InfoTooltip text="Operational checks on catalogue records, not analytics." />
      <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
        Record readiness
      </h2>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] tabular-nums text-neutral-700">
        <span>
          <span className="font-medium text-emerald-900/90">{counts.ready}</span>{" "}
          ready
        </span>
        <span>
          <span className="font-medium text-amber-950/90">
            {counts.needs_attention}
          </span>{" "}
          needs attention
        </span>
        <span>
          <span className="font-medium text-neutral-900">{counts.incomplete}</span>{" "}
          incomplete
        </span>
      </div>

      {affected.length === 0 ? (
        <p className="mt-5 text-[13px] text-neutral-600">
          All catalogue records pass readiness checks.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-900/[0.06] border-t border-neutral-900/[0.06] pt-4">
          {affected.map(({ artwork, status, reason, action }) => (
            <li
              key={artwork.id}
              className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-neutral-950">
                  {displayTitle(artwork)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPillClass(status)}`}
                  >
                    {status === "needs_attention" ? "⚠ " : null}
                    {statusLabel(status)}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">
                  {reason}
                </p>
              </div>
              <div className="shrink-0 sm:pt-0.5">
                {action?.kind === "link" ? (
                  <Link
                    href={action.href}
                    className="text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                  >
                    {action.label}
                  </Link>
                ) : action?.kind === "roster" ? (
                  <button
                    type="button"
                    onClick={onGoToRoster}
                    className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                  >
                    {action.label}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
