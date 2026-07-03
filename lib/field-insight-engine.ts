import type { FieldCulturalSignalMetrics } from "@/lib/fetch-field-cultural-signals";

export type FieldInsightSeverity = "normal" | "attention" | "high";

export type FieldInsight = {
  severity: FieldInsightSeverity;
  headline: string;
  body: string;
};

function formatCount(value: number): string {
  return value.toLocaleString("en-GB");
}

/** Insights derived only from supported registry metrics — no fabricated category analytics. */
export function buildFieldInsights(
  metrics: FieldCulturalSignalMetrics
): FieldInsight[] {
  const insights: FieldInsight[] = [];

  const {
    newRecords7d,
    newRecordsPrior7d,
    verificationPending,
    transfersActive7d,
    transfersPrior7d,
    closingSoon72h,
  } = metrics;

  if (typeof closingSoon72h === "number" && closingSoon72h > 0) {
    const urgent = closingSoon72h >= 3;
    insights.push({
      severity: urgent ? "high" : "attention",
      headline:
        closingSoon72h === 1
          ? "1 open call closes within 72 hours."
          : `${formatCount(closingSoon72h)} open calls close within 72 hours.`,
      body: "Published briefs with imminent response deadlines.",
    });
  }

  if (typeof verificationPending === "number" && verificationPending > 0) {
    const backlogPressure =
      typeof newRecords7d === "number" &&
      newRecords7d > 0 &&
      verificationPending > newRecords7d;

    insights.push({
      severity: backlogPressure || verificationPending >= 12 ? "high" : "attention",
      headline: `${formatCount(verificationPending)} works await institutional verification.`,
      body: backlogPressure
        ? "Pending verification exceeds recent filing volume."
        : "Filed and self-attested records not yet verified.",
    });
  }

  if (
    typeof newRecords7d === "number" &&
    newRecords7d > 0 &&
    typeof newRecordsPrior7d === "number"
  ) {
    const increased = newRecordsPrior7d > 0 && newRecords7d > newRecordsPrior7d;
    insights.push({
      severity: increased ? "attention" : "normal",
      headline: increased
        ? "New record filings increased week over week."
        : `${formatCount(newRecords7d)} new records filed in the last 7 days.`,
      body: increased
        ? `${formatCount(newRecords7d)} this week · ${formatCount(newRecordsPrior7d)} prior week.`
        : "Registry velocity across canonical works.",
    });
  } else if (typeof newRecords7d === "number" && newRecords7d > 0) {
    insights.push({
      severity: "normal",
      headline: `${formatCount(newRecords7d)} new records filed in the last 7 days.`,
      body: "Registry velocity across canonical works.",
    });
  }

  if (
    typeof transfersActive7d === "number" &&
    transfersActive7d > 0 &&
    typeof transfersPrior7d === "number" &&
    transfersPrior7d > 0 &&
    transfersActive7d > transfersPrior7d
  ) {
    insights.push({
      severity: "attention",
      headline: "Transfer activity accelerated this week.",
      body: `${formatCount(transfersActive7d)} ownership events · ${formatCount(transfersPrior7d)} prior week.`,
    });
  } else if (typeof transfersActive7d === "number" && transfersActive7d > 0) {
    insights.push({
      severity: "normal",
      headline: `${formatCount(transfersActive7d)} ownership transfers recorded this week.`,
      body: "Ownership events filed across the registry ledger.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      severity: "normal",
      headline: "Field index is steady.",
      body: "No elevated registry pressure detected in the current window.",
    });
  }

  return insights;
}
