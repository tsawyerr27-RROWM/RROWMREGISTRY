"use client";

import { MotionReveal } from "@/components/LandingPage/MotionReveal";
import type { ProvenanceTimelineEvent } from "@/lib/provenance-timeline";

function toneClasses(tone: ProvenanceTimelineEvent["tone"]) {
  switch (tone) {
    case "verification":
      return "border-emerald-200/40 bg-emerald-50/35";
    case "certificate":
      return "border-emerald-200/40 bg-white/60 shadow-[0_12px_40px_-28px_rgba(16,185,129,0.25)]";
    case "value":
      return "border-amber-200/40 bg-amber-50/35";
    default:
      return "border-black/[0.06] bg-white/60";
  }
}

export function ProvenanceTimeline({
  events,
}: {
  events: ProvenanceTimelineEvent[];
}) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-4 text-sm text-neutral-600 shadow-sm">
        No provenance events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-neutral-200 pl-8">
      {events.map((ev, idx) => {
        const d = new Date(ev.date);
        const dateLabel = !Number.isNaN(d.getTime())
          ? d.toLocaleString()
          : String(ev.date);
        return (
          <MotionReveal key={`${ev.type}-${ev.date}-${idx}`} delay={0.02 * Math.min(idx, 6)}>
            <div
              className={`group relative mb-8 rounded-2xl border px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 ease-out last:mb-0 hover:-translate-y-0.5 hover:bg-white/75 ${toneClasses(
                ev.tone
              )}`}
            >
              <span className="absolute -left-[33px] top-6 h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <p className="text-xs text-neutral-500">{dateLabel}</p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {ev.title}
              </p>
              {ev.subtitle ? (
                <p className="mt-1 text-sm text-neutral-600">{ev.subtitle}</p>
              ) : null}
              {ev.type === "ownership" ? (
                <p className="mt-2 text-sm font-medium text-neutral-600">
                  Status · {ev.status}
                </p>
              ) : null}
            </div>
          </MotionReveal>
        );
      })}
    </div>
  );
}

