import {
  computeRecordIntegrity,
  integrityRowTitle,
  type IntegrityArtworkFields,
  type RecordIntegrityStatus,
} from "@/lib/gallery-record-integrity";
import type {
  PriorityReasonCode,
  RecommendedActionKey,
} from "@/lib/gallery-ops-i18n";

export type PriorityLevel = "immediate" | "high" | "standard" | "low";

export type PriorityQueueItem = {
  artwork_id: string;
  title: string;
  priority_level: PriorityLevel;
  reasonCodes: PriorityReasonCode[];
  recommendedActionKey: RecommendedActionKey;
  action:
    | { kind: "link"; href: string; labelKey: import("@/lib/gallery-ops-i18n").OpsActionLabelKey }
    | { kind: "roster"; labelKey: import("@/lib/gallery-ops-i18n").OpsActionLabelKey }
    | { kind: "verify"; labelKey: import("@/lib/gallery-ops-i18n").OpsActionLabelKey }
    | { kind: "issue_certificate"; labelKey: import("@/lib/gallery-ops-i18n").OpsActionLabelKey }
    | null;
};

type Signals = {
  galleryIsVerified: boolean;

  ownershipEventCount: number;
  ownershipLastToUserId: string | null;

  hasAnyValueEvent: boolean;
  maxDeclaredValue: number | null;
  maxDeclaredValueCurrency: string | null;

  hasGalleryVerification: boolean;
  hasLiveCertificate: boolean;
  hasRevokedCertificate: boolean;

  isListed: boolean;

  /** latest activity across known sources (ISO) */
  lastActivityAt: string | null;
  artworkCreatedAt: string | null;
};

function clampReasonCodes(reasons: PriorityReasonCode[], max = 2) {
  const uniq: PriorityReasonCode[] = [];
  for (const r of reasons) {
    if (!uniq.includes(r)) uniq.push(r);
    if (uniq.length >= max) break;
  }
  return uniq;
}

function priorityFromScore(score: number): PriorityLevel {
  if (score >= 90) return "immediate";
  if (score >= 65) return "high";
  if (score >= 35) return "standard";
  return "low";
}

function scoreBaseFromIntegrity(status: RecordIntegrityStatus): number {
  if (status === "incomplete") return 95;
  if (status === "needs_attention") return 70;
  return 25;
}

function parseIso(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return t;
}

function daysSince(iso: string | null | undefined): number | null {
  const t = parseIso(iso);
  if (t == null) return null;
  const now = Date.now();
  const d = Math.floor((now - t) / (1000 * 60 * 60 * 24));
  return Number.isFinite(d) ? d : null;
}

function valueBandUSDish(maxValue: number | null): "high" | "mid" | "low" | "none" {
  if (maxValue == null) return "none";
  if (maxValue >= 250_000) return "high";
  if (maxValue >= 50_000) return "mid";
  return "low";
}

/**
 * Priority engine for gallery operations.
 *
 * Deterministic, explainable, derived-only:
 * - Integrity base weight comes from existing integrity classifier (no duplicate checks).
 * - Boosts incorporate value uncertainty, verification/cert gaps, market listing context, and recency.
 */
export function computeArtworkPriorityQueueItem(args: {
  artwork: IntegrityArtworkFields & { created_at?: string | null; verification_status?: string | null };
  signals: Signals;
}): PriorityQueueItem {
  const { artwork, signals } = args;

  const integrity = computeRecordIntegrity(artwork, {
    ownershipEventCount: signals.ownershipEventCount,
    ownershipLastToUserId: signals.ownershipLastToUserId,
    hasAnyValueEvent: signals.hasAnyValueEvent,
    hasGalleryVerification: signals.hasGalleryVerification,
    hasLiveCertificate: signals.hasLiveCertificate,
    hasRevokedCertificate: signals.hasRevokedCertificate,
    galleryIsVerified: signals.galleryIsVerified,
  });

  let score = scoreBaseFromIntegrity(integrity.status);
  const reasonCodes: PriorityReasonCode[] = [];

  const verifiedOnRegistry =
    String(artwork.verification_status || "").toLowerCase() === "verified" ||
    (signals.galleryIsVerified && signals.hasGalleryVerification) ||
    signals.hasLiveCertificate;

  if (signals.isListed && !verifiedOnRegistry) {
    score = Math.max(score, 98);
    reasonCodes.push("listed_without_verification");
  } else if (signals.isListed && !signals.hasLiveCertificate) {
    score = Math.max(score, 75);
    reasonCodes.push("listed_without_certificate");
  }

  if (!signals.hasAnyValueEvent) {
    score += 18;
    reasonCodes.push("no_declared_value");
  } else {
    const band = valueBandUSDish(signals.maxDeclaredValue);
    if (band === "high") {
      score += 14;
      reasonCodes.push("high_declared_value");
    } else if (band === "mid") {
      score += 8;
      reasonCodes.push("material_declared_value");
    }
  }

  if (!signals.hasLiveCertificate) {
    if (verifiedOnRegistry) {
      score += 10;
      reasonCodes.push("verified_without_certificate");
    } else {
      score += 14;
      reasonCodes.push("no_verification_signals");
    }
  } else {
    score -= 10;
    reasonCodes.push("certified_record");
  }

  const recentDays = daysSince(signals.lastActivityAt);
  const createdDays = daysSince(signals.artworkCreatedAt);
  if (recentDays != null && recentDays <= 14) {
    score += 4;
    reasonCodes.push("recent_activity");
  }
  if (integrity.status === "incomplete") {
    if (createdDays != null && createdDays >= 365) {
      score += 5;
      reasonCodes.push("old_incomplete");
    }
  }

  if (integrity.status === "incomplete") {
    score = Math.max(score, 96);
  }
  const valueBand = valueBandUSDish(signals.maxDeclaredValue);
  if ((valueBand === "high" || valueBand === "mid") && !signals.hasLiveCertificate) {
    score = Math.max(score, 90);
    reasonCodes.push("high_value_no_certificate");
  }

  const priority_level = priorityFromScore(score);

  const finalReasonCodes = clampReasonCodes(
    [...integrity.reasonCodes, ...reasonCodes],
    2
  );

  const action = integrity.action;
  const recommendedActionKey: RecommendedActionKey =
    priority_level === "low"
      ? "gallery.ops.recommended.noAction"
      : "gallery.ops.recommended.reviewRecord";

  return {
    artwork_id: artwork.id,
    title: integrityRowTitle(artwork),
    priority_level,
    reasonCodes: finalReasonCodes,
    recommendedActionKey,
    action,
  };
}

export function sortPriorityQueue(items: PriorityQueueItem[]) {
  const order: Record<PriorityLevel, number> = {
    immediate: 0,
    high: 1,
    standard: 2,
    low: 3,
  };
  return [...items].sort((a, b) => {
    const d = order[a.priority_level] - order[b.priority_level];
    if (d !== 0) return d;
    const t = a.title.localeCompare(b.title);
    if (t !== 0) return t;
    return a.artwork_id.localeCompare(b.artwork_id);
  });
}
