"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { PriorityQueueItem, PriorityLevel } from "@/lib/gallery-priority-engine";

type Props = {
  items: PriorityQueueItem[];
  maxVisible?: number;
  onGoToRoster: () => void;
  onVerifyArtwork: (artworkId: string) => void;
  onIssueCertificate: (artworkId: string) => void;
};

function priorityLabel(level: PriorityLevel) {
  if (level === "immediate") return "Immediate";
  if (level === "high") return "High";
  if (level === "standard") return "Standard";
  return "Low";
}

function priorityTone(level: PriorityLevel) {
  // Calm, editorial: no bright colors, no badges — subtle text only.
  if (level === "immediate") return "text-neutral-950";
  if (level === "high") return "text-neutral-900";
  if (level === "standard") return "text-neutral-700";
  return "text-neutral-500";
}

export function PriorityQueueSection({
  items,
  maxVisible = 8,
  onGoToRoster,
  onVerifyArtwork,
  onIssueCertificate,
}: Props) {
  if (items.length === 0) return null;
  const visible = items.slice(0, Math.max(5, Math.min(8, maxVisible)));

  return (
    <section className="mb-8 rounded-2xl border border-neutral-900/[0.06] bg-white/50 p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7">
      <InfoTooltip text="Ordered operational guidance based on integrity, verification, value signals, market context, and recency." />
      <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
        Priority queue
      </h2>

      <ul className="mt-6 divide-y divide-neutral-900/[0.06] border-t border-neutral-900/[0.06] pt-4">
        {visible.map((item) => (
          <li
            key={item.artwork_id}
            className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-neutral-950">{item.title}</p>
              <p className={`mt-1 text-[12px] ${priorityTone(item.priority_level)}`}>
                {priorityLabel(item.priority_level)}
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">
                {item.reasons.join(" · ")}
              </p>
            </div>
            <div className="shrink-0 sm:pt-0.5">
              {item.action?.kind === "link" ? (
                <Link
                  href={item.action.href}
                  className="text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                >
                  {item.recommended_action}
                </Link>
              ) : item.action?.kind === "roster" ? (
                <button
                  type="button"
                  onClick={onGoToRoster}
                  className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                >
                  {item.recommended_action}
                </button>
              ) : item.action?.kind === "verify" ? (
                <button
                  type="button"
                  onClick={() => onVerifyArtwork(item.artwork_id)}
                  className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                >
                  {item.recommended_action}
                </button>
              ) : item.action?.kind === "issue_certificate" ? (
                <button
                  type="button"
                  onClick={() => onIssueCertificate(item.artwork_id)}
                  className="text-left text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
                >
                  {item.recommended_action}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

