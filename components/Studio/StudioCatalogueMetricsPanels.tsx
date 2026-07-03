"use client";

import {
  StudioContentSlab,
  StudioMetricTile,
} from "@/components/Studio/StudioContentSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  formatGrowthPercent,
  formatHighlightGrowth,
  type StudioCatalogueMetrics,
  type StudioCatalogueRole,
} from "@/lib/studio-catalogue-metrics";

type Props = {
  role: StudioCatalogueRole;
  metrics: StudioCatalogueMetrics | null;
  onOpenValueInsight?: () => void;
};

export function StudioCatalogueMetricsPanels({
  role,
  metrics,
  onOpenValueInsight,
}: Props) {
  const { t } = useLocalePreferences();

  if (!metrics) return null;

  const { valueProgression, ownership, highlights } = metrics;

  const worksHeldLabel =
    role === "gallery"
      ? t("studio.overview.worksRepresented")
      : t("studio.overview.worksYouHold");

  const avgHoldLabel =
    role === "gallery"
      ? t("studio.overview.avgDaysOnRegistry")
      : t("studio.overview.avgHoldDays");

  const longestHeldHint =
    role === "gallery"
      ? t("studio.overview.longestOnRegistryHint")
      : t("studio.overview.longestHeldHint");

  return (
    <>
      <StudioContentSlab
        title={t("studio.overview.valueProgression.title")}
        subtitle={t("studio.overview.valueProgression.subtitle")}
      >
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {valueProgression.comparableWorks > 0 ? (
            <>
              <StudioMetricTile
                variant="primary"
                label={t("studio.overview.avgChange")}
                value={formatGrowthPercent(valueProgression.averageGrowthPercent)}
                hint={t("studio.overview.avgChangeHint")}
                onClick={onOpenValueInsight}
              />
              <StudioMetricTile
                variant="secondary"
                label={t("studio.overview.worksIncreased")}
                value={valueProgression.worksIncreased}
                onClick={onOpenValueInsight}
              />
              <StudioMetricTile
                variant="secondary"
                label={t("studio.overview.decliningWorks")}
                value={valueProgression.worksDeclined}
                onClick={onOpenValueInsight}
              />
            </>
          ) : (
            <div className="sm:col-span-3">
              <StudioMetricTile
                label={t("studio.overview.valueChange")}
                value={t("studio.overview.noProgressionData")}
                onClick={onOpenValueInsight}
              />
            </div>
          )}
        </div>
      </StudioContentSlab>

      <StudioContentSlab
        title={t("studio.overview.ownershipIntel.title")}
        subtitle={t("studio.overview.ownershipIntel.subtitle")}
      >
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <StudioMetricTile
            variant="primary"
            label={worksHeldLabel}
            value={ownership.worksHeld}
          />
          <StudioMetricTile
            variant="secondary"
            label={t("studio.overview.totalTransfers")}
            value={ownership.totalTransfers}
          />
          <StudioMetricTile
            variant="secondary"
            label={avgHoldLabel}
            value={
              ownership.avgHoldDays != null
                ? Math.round(ownership.avgHoldDays)
                : "–"
            }
          />
        </div>
      </StudioContentSlab>

      <StudioContentSlab
        title={t("studio.overview.catalogueHighlights.title")}
        subtitle={t("studio.overview.catalogueHighlights.subtitle")}
      >
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <StudioMetricTile
            label={t("studio.overview.mostTransferred")}
            value={
              highlights.mostTransferred
                ? `${highlights.mostTransferred.title} · ${highlights.mostTransferred.transferCount}`
                : "–"
            }
            hint={t("studio.overview.mostTransferredHint")}
          />
          <StudioMetricTile
            label={t("studio.overview.longestHeld")}
            value={
              highlights.longestHeld
                ? `${highlights.longestHeld.title} · ${Math.round(highlights.longestHeld.holdDays)}d`
                : "–"
            }
            hint={longestHeldHint}
          />
          <StudioMetricTile
            label={t("studio.overview.fastestAppreciating")}
            value={formatHighlightGrowth(highlights.fastestAppreciating)}
            hint={t("studio.overview.fastestAppreciatingHint")}
            onClick={onOpenValueInsight}
          />
        </div>
      </StudioContentSlab>
    </>
  );
}
