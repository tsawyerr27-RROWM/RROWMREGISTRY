"use client";

import { useEffect } from "react";
import type { FieldSignatureStats } from "@/lib/fetch-field-signature-stats";
import type { FieldCulturalSignals } from "@/lib/fetch-field-cultural-signals";
import { buildFieldInsights } from "@/lib/field-insight-engine";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { useTelemetry } from "@/hooks/useTelemetry";
import { fieldSignature } from "@/styles/field-signature";

import { FieldCulturalSignalsRail } from "./FieldCulturalSignalsRail";
import { FieldSignatureArchiveTransition } from "./FieldSignatureArchiveTransition";
import { FieldSignatureConstellation } from "./FieldSignatureConstellation";
import { FieldSignatureExplorerRail } from "./FieldSignatureExplorerRail";
import { FieldSignatureHero } from "./FieldSignatureHero";
import { FieldSignatureTerminalStrip } from "./FieldSignatureTerminalStrip";

type Props = {
  stats: FieldSignatureStats;
  cultural: FieldCulturalSignals;
};

export function FieldSignatureSurface({ stats, cultural }: Props) {
  const { searchFocus } = useFieldIntelligence();
  const { track } = useTelemetry();
  const insights = buildFieldInsights(cultural.signals);

  useEffect(() => {
    track({ eventName: "field_opened", surface: "field" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={fieldSignature.scope}
      data-intel-query={searchFocus ? "" : undefined}
    >
      <FieldSignatureHero />
      <FieldSignatureTerminalStrip
        stats={stats}
        snapshotAt={cultural.snapshotAt}
        insights={insights}
      />
      <FieldCulturalSignalsRail cultural={cultural} />
      <FieldSignatureConstellation clusterIntel={cultural.cluster} />
      <FieldSignatureArchiveTransition />
      <FieldSignatureExplorerRail />
    </div>
  );
}
