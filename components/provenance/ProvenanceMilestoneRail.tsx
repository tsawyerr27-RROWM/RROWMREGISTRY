"use client";

import type { ArchivalTimelineEvent } from "@/lib/provenance-timeline";
import {
  milestoneTierMessageKey,
  summarizeProvenanceMilestones,
} from "@/lib/provenance-milestones";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  events: ArchivalTimelineEvent[];
};

export function ProvenanceMilestoneRail({ events }: Props) {
  const { t } = useLocalePreferences();
  const summary = summarizeProvenanceMilestones(events);

  if (summary.length === 0) return null;

  return (
    <div className="mt-8 border-y border-neutral-900/[0.06] py-6">
      <p className="font-serif text-base font-normal text-neutral-800">
        {t("provenance.milestoneRailHeading")}
      </p>
      <ol className="mt-4 flex flex-wrap gap-2" role="list">
        {summary.map(({ tier, count }) => (
          <li
            key={tier}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-[#fafaf8]/90 px-3.5 py-1.5 text-xs text-neutral-700"
          >
            <span className="font-medium text-neutral-900">
              {t(milestoneTierMessageKey(tier))}
            </span>
            <span className="tabular-nums text-neutral-400">{count}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
