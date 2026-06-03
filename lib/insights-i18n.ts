import type { MessageKey } from "@/lib/locale-messages";
import type { generateInsightSummary } from "@/lib/insights";

type Translate = (key: MessageKey) => string;

type InsightInput = Parameters<typeof generateInsightSummary>[0];

type InsightSummaryKind =
  | "health_incomplete"
  | "health_unresolved_sales"
  | "health_fully_verified"
  | "ownership_largely_verified"
  | "ownership_unverified"
  | "ownership_recent_transfers"
  | "value_no_events"
  | "value_multi_currency"
  | "value_up"
  | "value_down"
  | "value_steady"
  | "activity_recent"
  | "activity_none"
  | "catalogue_peak"
  | "calm_default";

function classifyInsightSummary(input: InsightInput): InsightSummaryKind {
  const { valueTrend, activity, catalogue, ownership, health } = input;

  if (health) {
    if ((health.missingVerification || 0) > 0) return "health_incomplete";
    if ((health.unresolvedSales || 0) > 0) return "health_unresolved_sales";
    if ((health.fullyVerified || 0) > 0) return "health_fully_verified";
  }

  if (ownership) {
    const v = ownership.verifiedOwnerships || 0;
    const u = ownership.unverifiedOwnerships || 0;
    if (v > u && v > 0) return "ownership_largely_verified";
    if (u > 0) return "ownership_unverified";
    if ((ownership.recentTransfers || 0) > 0) return "ownership_recent_transfers";
  }

  if (valueTrend) {
    const cur = valueTrend.currencies || [];
    if (cur.length === 0) return "value_no_events";
    if (cur.length > 1) return "value_multi_currency";
    if (valueTrend.growthDirection === "up") return "value_up";
    if (valueTrend.growthDirection === "down") return "value_down";
    return "value_steady";
  }

  if (activity) {
    const total = (activity.series || []).reduce((a, b) => a + (b.events || 0), 0);
    if (total > 0) return "activity_recent";
    return "activity_none";
  }

  if (catalogue?.mostActivePeriod) return "catalogue_peak";

  return "calm_default";
}

function translateValueRoleInsight(
  role: "artist" | "collector" | "gallery",
  valueTrend: NonNullable<InsightInput["valueTrend"]>,
  t: Translate
): string {
  const cur = valueTrend.currencies || [];
  if (cur.length === 0) {
    if (role === "artist") return t("studio.insight.subtitle.artist.value.noEvents12mo");
    if (role === "collector") return t("studio.insight.subtitle.collector.value.noEvents");
    return t("studio.insight.subtitle.gallery.value.noDeclared");
  }
  if (cur.length > 1) {
    if (role === "artist") return t("studio.insight.subtitle.artist.value.multiCurrency");
    if (role === "collector") return t("studio.insight.subtitle.collector.value.multiCurrency");
    return t("studio.insight.subtitle.gallery.value.multiCurrency");
  }
  if (valueTrend.growthDirection === "up") {
    if (role === "artist") return t("studio.insight.subtitle.artist.value.trendingUp");
    if (role === "collector") return t("studio.insight.subtitle.collector.value.trendingUp");
    return t("studio.insight.subtitle.gallery.value.trendingUp");
  }
  if (valueTrend.growthDirection === "down") {
    if (role === "artist") return t("studio.insight.subtitle.artist.value.softened");
    if (role === "collector") return t("studio.insight.subtitle.collector.value.softened");
    return t("studio.insight.subtitle.gallery.value.softened");
  }
  if (role === "artist") return t("studio.insight.subtitle.artist.value.steady");
  if (role === "collector") return t("studio.insight.subtitle.collector.value.steady");
  return t("studio.insight.subtitle.gallery.value.steady");
}

const ARTIST_KIND_KEYS: Partial<Record<InsightSummaryKind, MessageKey>> = {
  health_incomplete: "studio.insight.subtitle.artist.continuityNeeded",
  ownership_largely_verified: "studio.insight.subtitle.artist.clearOwnership",
  ownership_unverified: "studio.insight.subtitle.artist.ownershipPending",
  value_up: "studio.insight.subtitle.artist.valuesShifted",
  value_down: "studio.insight.subtitle.artist.valuesShifted",
  value_steady: "studio.insight.subtitle.artist.valuesSteady",
  value_multi_currency: "studio.insight.subtitle.artist.multiCurrencyTracked",
  value_no_events: "studio.insight.subtitle.artist.addValueEvent",
  calm_default: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
  catalogue_peak: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
  activity_recent: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
  activity_none: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
  health_fully_verified: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
  health_unresolved_sales: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
  ownership_recent_transfers: "studio.insight.subtitle.artist.catalogueSteadyGrowth",
};

const GALLERY_KIND_KEYS: Partial<Record<InsightSummaryKind, MessageKey>> = {
  ownership_unverified: "studio.insight.subtitle.gallery.ownershipPending",
  ownership_largely_verified: "studio.insight.subtitle.gallery.verificationSteady",
  health_incomplete: "studio.insight.subtitle.gallery.recordsPending",
  calm_default: "studio.insight.subtitle.gallery.registrySteady",
  catalogue_peak: "studio.insight.subtitle.gallery.registrySteady",
  activity_recent: "studio.insight.subtitle.gallery.registrySteady",
  activity_none: "studio.insight.subtitle.gallery.registrySteady",
  health_fully_verified: "studio.insight.subtitle.gallery.registrySteady",
  health_unresolved_sales: "studio.insight.subtitle.gallery.registrySteady",
  ownership_recent_transfers: "studio.insight.subtitle.gallery.registrySteady",
  value_up: "studio.insight.subtitle.gallery.registrySteady",
  value_down: "studio.insight.subtitle.gallery.registrySteady",
  value_steady: "studio.insight.subtitle.gallery.registrySteady",
  value_multi_currency: "studio.insight.subtitle.gallery.registrySteady",
  value_no_events: "studio.insight.subtitle.gallery.registrySteady",
};

export function translateRoleInsight(
  role: "artist" | "collector" | "gallery",
  input: InsightInput,
  t: Translate
): string {
  if (
    input.valueTrend &&
    !input.health &&
    !input.ownership &&
    !input.catalogue &&
    !input.artworkTrend &&
    !input.activity
  ) {
    return translateValueRoleInsight(role, input.valueTrend, t);
  }

  const kind = classifyInsightSummary(input);

  if (role === "artist") {
    const key =
      ARTIST_KIND_KEYS[kind] ?? "studio.insight.subtitle.artist.catalogueSteadyGrowth";
    return t(key);
  }

  if (role === "gallery") {
    const key =
      GALLERY_KIND_KEYS[kind] ?? "studio.insight.subtitle.gallery.registrySteady";
    return t(key);
  }

  if (kind === "ownership_unverified") {
    return t("studio.insight.subtitle.collector.ownershipPending");
  }
  if (kind === "ownership_largely_verified") {
    return t("studio.insight.subtitle.collector.ownershipEstablished");
  }
  if (kind === "value_multi_currency") {
    return t("studio.insight.subtitle.collector.multiCurrency");
  }
  return t("studio.insight.subtitle.collector.consistentRecord");
}

export function translateInsightBarCategory(
  category: "fullyVerified" | "certified" | "incomplete",
  t: Translate
): string {
  if (category === "fullyVerified") return t("studio.insight.bar.fullyVerified");
  if (category === "certified") return t("studio.insight.bar.certified");
  return t("studio.insight.bar.incomplete");
}
