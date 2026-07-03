"use client";

import { motion } from "framer-motion";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { FieldSignatureStats } from "@/lib/fetch-field-signature-stats";
import { formatFieldSnapshotSync } from "@/lib/fetch-field-cultural-signals";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { useFieldMotion } from "@/hooks/useFieldMotion";
import type { FieldInsight } from "@/lib/field-insight-engine";
import { isRailFlashing } from "@/lib/field-intelligence-events";
import { fieldSignature } from "@/styles/field-signature";

import { FieldInsightTicker } from "./FieldInsightTicker";

type Props = {
  stats: FieldSignatureStats;
  snapshotAt: string;
  insights: FieldInsight[];
};

type RailItem = {
  key: keyof FieldSignatureStats;
  labelKey:
    | "field.signature.terminal.records"
    | "field.signature.terminal.creatives"
    | "field.signature.terminal.organisations"
    | "field.signature.terminal.opportunities";
};

const RAILS: RailItem[] = [
  { key: "records", labelKey: "field.signature.terminal.records" },
  { key: "creatives", labelKey: "field.signature.terminal.creatives" },
  { key: "organisations", labelKey: "field.signature.terminal.organisations" },
  { key: "opportunities", labelKey: "field.signature.terminal.opportunities" },
];

function formatCount(value: number | null, locale: string): string {
  if (value === null) return "-";
  return value.toLocaleString(locale);
}

export function FieldSignatureTerminalStrip({ stats, snapshotAt, insights }: Props) {
  const { t, region } = useLocalePreferences();
  const { motionEnabled } = useFieldMotion();
  const intel = useFieldIntelligence();
  const lastSync = formatFieldSnapshotSync(snapshotAt);
  const syncActive =
    intel.syncPulseUntil > Date.now() || intel.signalAlertUntil > Date.now();
  const activeCluster = intel.activeCluster;

  const body = (
    <div className="mx-auto w-full max-w-[min(100%,88rem)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        {RAILS.map((rail) => {
          const flashing = motionEnabled && isRailFlashing(intel, rail.key);
          const clusterActive = activeCluster === rail.key;
          return (
            <div
              key={rail.key}
              className={`field-signature-terminal-rail min-w-[7.5rem] flex-1${flashing ? " field-signature-terminal-rail--ack" : ""}${clusterActive ? " field-signature-terminal-rail--active" : ""}`}
              data-rail={rail.key}
            >
              <p className={fieldSignature.type.terminalMono}>{t(rail.labelKey)}</p>
              <p
                className={`mt-1 font-mono text-lg font-medium tabular-nums tracking-tight text-[var(--field-signature-terminal-count)] md:text-xl ${
                  motionEnabled ? fieldSignature.motion.terminalCountReveal : ""
                }`}
              >
                {formatCount(stats[rail.key], region.locale)}
              </p>
            </div>
          );
        })}
        <div
          className={`field-signature-terminal-sync min-w-[10rem] flex-1 sm:text-right${syncActive ? " field-signature-terminal-sync--pulse" : ""}`}
        >
          <p className={fieldSignature.type.terminalMono}>{t("field.signature.terminal.lastSync")}</p>
          <div className="field-signature-terminal-sync__row mt-1">
            <span
              className={`field-signature-terminal-sync__bar${syncActive ? " field-signature-terminal-sync__bar--active" : ""}`}
              aria-hidden
            />
            <p
              className="font-mono text-sm tabular-nums tracking-tight text-[var(--field-signature-terminal-count)] md:text-base"
              aria-live="off"
            >
              {lastSync}
            </p>
          </div>
        </div>
      </div>

      <FieldInsightTicker insights={insights} />
    </div>
  );

  return (
    <section
      className={`${fieldSignature.surfaces.terminalStrip}${intel.searchFocus ? " field-signature-terminal-strip--query" : ""}${intel.signalSeverity ? ` field-signature-terminal-strip--signal-${intel.signalSeverity}` : ""}`}
      aria-label={t("field.signature.terminal.aria")}
    >
      {motionEnabled ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {body}
        </motion.div>
      ) : (
        body
      )}
    </section>
  );
}
