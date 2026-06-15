"use client";

import type { RecordCompletenessLevel } from "@/lib/record-completeness";
import {
  recordCompletenessDescriptionKey,
  recordCompletenessLabelKey,
  translateContinuityIndicator,
} from "@/lib/archival-provenance-i18n";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  recordCompleteness: RecordCompletenessLevel;
  continuityIndicators: string[];
};

export function ProvenanceCompletenessBand({
  recordCompleteness,
  continuityIndicators,
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <div className="rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-[#f7f4ef]/80 via-[#fafaf8] to-white px-6 py-7 shadow-[0_16px_48px_-36px_rgba(15,23,42,0.18)] md:px-8 md:py-8">
      <p className="text-sm font-medium text-neutral-600">
        {t("provenance.fileSummaryHeading")}
      </p>
      <p className="mt-2 font-serif text-2xl font-normal tracking-tight text-neutral-950">
        {t(recordCompletenessLabelKey(recordCompleteness))}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
        {t(recordCompletenessDescriptionKey(recordCompleteness))}
      </p>

      {continuityIndicators.length > 0 ? (
        <ul className="mt-6 space-y-2 border-t border-neutral-900/[0.06] pt-5">
          {continuityIndicators.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-sm leading-relaxed text-neutral-600"
            >
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
              <span>{translateContinuityIndicator(line, t)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
