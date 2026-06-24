import type { MessageKey } from "@/lib/locale-messages";
import { fillMessage } from "@/lib/locale-messages";
import type { RecordHealthResult } from "@/lib/studio-insight-types";
import {
  formatGrowthPercent,
  formatHighlightGrowth,
  type StudioCatalogueMetrics,
  type StudioCatalogueRole,
} from "@/lib/studio-catalogue-metrics";

type Translate = (key: MessageKey) => string;
type FormatCurrency = (amount: number, currency: string) => string;

export function buildValueInsightBreakdown(args: {
  role: StudioCatalogueRole;
  metrics: StudioCatalogueMetrics;
  latestValues: Record<string, number>;
  t: Translate;
  formatCurrency: FormatCurrency;
}): { breakdown: { label: string; value: string }[]; dataNotes: string[] } {
  const { role, metrics, latestValues, t, formatCurrency } = args;
  const { valueProgression } = metrics;

  const breakdown: { label: string; value: string }[] = [];

  if (valueProgression.comparableWorks > 0) {
    breakdown.push({
      label: t("studio.insight.breakdown.avgChange"),
      value: formatGrowthPercent(valueProgression.averageGrowthPercent),
    });
    breakdown.push({
      label: t("studio.insight.breakdown.worksIncreased"),
      value: String(valueProgression.worksIncreased),
    });
    breakdown.push({
      label: t("studio.insight.breakdown.worksDeclined"),
      value: String(valueProgression.worksDeclined),
    });
  }

  for (const [currency, amount] of Object.entries(latestValues).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    breakdown.push({
      label: fillMessage(t("studio.insight.breakdown.latestDeclared"), { currency }),
      value: formatCurrency(amount, currency),
    });
  }

  const noteKey =
    role === "gallery"
      ? "studio.insight.note.valueBasisGallery"
      : role === "collector"
        ? "studio.insight.note.valueBasisCollector"
        : "studio.insight.note.valueBasisArtist";

  const dataNotes = [
    t("studio.insight.note.valueProgressionBasis"),
    t(noteKey),
  ];

  return { breakdown, dataNotes };
}

export function buildOwnershipInsightBreakdown(args: {
  role: StudioCatalogueRole;
  metrics: StudioCatalogueMetrics;
  t: Translate;
}): { label: string; value: string }[] {
  const { role, metrics, t } = args;
  const { ownership, highlights } = metrics;

  const worksHeldLabel =
    role === "gallery"
      ? t("studio.insight.breakdown.worksRepresented")
      : t("studio.insight.breakdown.worksHeld");

  const avgHoldLabel =
    role === "gallery"
      ? t("studio.insight.breakdown.avgDaysOnRegistry")
      : t("studio.insight.breakdown.avgHoldDays");

  return [
    {
      label: t("studio.insight.breakdown.totalTransfers"),
      value: String(ownership.totalTransfers),
    },
    {
      label: worksHeldLabel,
      value: String(ownership.worksHeld),
    },
    {
      label: avgHoldLabel,
      value:
        ownership.avgHoldDays != null
          ? String(Math.round(ownership.avgHoldDays))
          : "–",
    },
    {
      label: t("studio.insight.breakdown.mostTransferred"),
      value: highlights.mostTransferred
        ? `${highlights.mostTransferred.title} · ${highlights.mostTransferred.transferCount}`
        : "–",
    },
    {
      label: t("studio.insight.breakdown.longestHeld"),
      value: highlights.longestHeld
        ? `${highlights.longestHeld.title} · ${Math.round(highlights.longestHeld.holdDays)}d`
        : "–",
    },
    {
      label: t("studio.insight.breakdown.fastestAppreciating"),
      value: formatHighlightGrowth(highlights.fastestAppreciating),
    },
  ];
}

export function buildHealthInsightBreakdown(args: {
  health: RecordHealthResult;
  role: StudioCatalogueRole;
  t: Translate;
}): { breakdown: { label: string; value: string }[]; dataNotes: string[] } {
  const { health, role, t } = args;

  const breakdown = [
    {
      label: t("studio.insight.breakdown.fullyVerifiedStrict"),
      value: String(health.fullyVerified),
    },
    {
      label: t("studio.insight.breakdown.withCertificate"),
      value: String(health.withCertificates),
    },
    {
      label: t("studio.insight.breakdown.missingVerification"),
      value: String(health.missingVerification),
    },
  ];

  if (health.unresolvedSales > 0) {
    breakdown.push({
      label: t("studio.insight.breakdown.unresolvedSales"),
      value: String(health.unresolvedSales),
    });
  }

  if (health.staleRecords > 0) {
    breakdown.push({
      label: t("studio.insight.breakdown.staleRecords"),
      value: String(health.staleRecords),
    });
  }

  return {
    breakdown,
    dataNotes: [
      t("studio.insight.note.healthNonAdditive"),
      t(
        role === "gallery"
          ? "studio.insight.note.healthStrictGallery"
          : "studio.insight.note.healthStrictArtist"
      ),
    ],
  };
}
