"use client";

import type { RecordCompletenessLevel } from "@/lib/record-completeness";
import {
  recordCompletenessDescriptionKey,
  recordCompletenessLabelKey,
  translateContinuityIndicator,
} from "@/lib/archival-provenance-i18n";
import { registryV2 } from "@/styles/registry-v2";
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
    <div
      className={`${registryV2.surface.metadataStack} ${registryV2.surface.filing} p-6 md:p-8 ${registryV2.motion.reveal}`}
    >
      <p className={registryV2.type.metaLabel}>{t("provenance.fileSummaryHeading")}</p>
      <p className={`${registryV2.type.sectionTitle} mt-3`}>
        {t(recordCompletenessLabelKey(recordCompleteness))}
      </p>
      <p className={`${registryV2.type.metaValue} mt-4 max-w-2xl`}>
        {t(recordCompletenessDescriptionKey(recordCompleteness))}
      </p>

      {continuityIndicators.length > 0 ? (
        <ul className="mt-6 space-y-2 border-t border-[var(--v2-border)] pt-5">
          {continuityIndicators.map((line) => (
            <li
              key={line}
              className={`flex gap-3 ${registryV2.type.metaValue}`}
            >
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--v2-cobalt-signal)]"
                aria-hidden
              />
              <span>{translateContinuityIndicator(line, t)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
