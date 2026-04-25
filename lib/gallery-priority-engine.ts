import {
  computeRecordIntegrity,
  integrityRowTitle,
  type IntegrityArtworkFields,
  type RecordIntegrityStatus,
} from "@/lib/gallery-record-integrity";

export type PriorityLevel = "immediate" | "high" | "standard" | "low";

export type PriorityQueueItem = {
  artwork_id: string;
  title: string;
  priority_level: PriorityLevel;
  reasons: string[];
  recommended_action: string;
  /**
   * Optional machine action id for the dashboard to map to a link / modal.
   * This is derived from existing action mapping (no new persisted state).
   */
  action:
    | { kind: "link"; href: string; label: string }
    | { kind: "roster"; label: string }
    | { kind: "verify"; label: string }
    | { kind: "issue_certificate"; label: string }
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

function clampReasons(reasons: string[], max = 2) {
  const uniq: string[] = [];
  for (const r of reasons) {
    const s = r.trim();
    if (!s) continue;
    if (!uniq.includes(s)) uniq.push(s);
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
  const reasons: string[] = [];

  // --- Market context (deterministic hard escalations)
  const verifiedOnRegistry =
    String(artwork.verification_status || "").toLowerCase() === "verified" ||
    (signals.galleryIsVerified && signals.hasGalleryVerification) ||
    signals.hasLiveCertificate;

  if (signals.isListed && !verifiedOnRegistry) {
    score = Math.max(score, 98);
    reasons.push("Listed on market without verification");
  } else if (signals.isListed && !signals.hasLiveCertificate) {
    score = Math.max(score, 75);
    reasons.push("Listed on market without certificate");
  }

  // --- Value signal / uncertainty
  if (!signals.hasAnyValueEvent) {
    score += 18;
    reasons.push("No declared value on file");
  } else {
    const band = valueBandUSDish(signals.maxDeclaredValue);
    if (band === "high") {
      score += 14;
      reasons.push("High declared value");
    } else if (band === "mid") {
      score += 8;
      reasons.push("Material declared value");
    }
  }

  // --- Verification gap
  if (!signals.hasLiveCertificate) {
    if (verifiedOnRegistry) {
      score += 10;
      reasons.push("Verified without certificate");
    } else {
      score += 14;
      reasons.push("No verification signals");
    }
  } else {
    score -= 10; // certified: reduces priority
    reasons.push("Certified record");
  }

  // --- Recency (slight)
  const recentDays = daysSince(signals.lastActivityAt);
  const createdDays = daysSince(signals.artworkCreatedAt);
  if (recentDays != null && recentDays <= 14) {
    score += 4;
    reasons.push("Recent activity");
  }
  if (integrity.status === "incomplete") {
    // Old + incomplete tends to compound operational risk.
    if (createdDays != null && createdDays >= 365) {
      score += 5;
      reasons.push("Old record still incomplete");
    }
  }

  // --- Priority resolution overrides (per spec)
  // Immediate:
  // - incomplete integrity
  // - listed + not verified
  // - high value + no certificate
  if (integrity.status === "incomplete") {
    score = Math.max(score, 96);
  }
  const valueBand = valueBandUSDish(signals.maxDeclaredValue);
  if ((valueBand === "high" || valueBand === "mid") && !signals.hasLiveCertificate) {
    score = Math.max(score, 90);
    reasons.push("High value without certificate");
  }

  const priority_level = priorityFromScore(score);

  // Reasons should always be shown; include integrity reasons first if they exist.
  const finalReasons = clampReasons(
    [...integrity.reasons, ...reasons],
    2
  );

  // Recommended action should remain consistent with integrity’s action mapping.
  const action = integrity.action;
  const recommended_action =
    action?.label ||
    (priority_level === "low" ? "No action required" : "Review record");

  return {
    artwork_id: artwork.id,
    title: integrityRowTitle(artwork),
    priority_level,
    reasons: finalReasons,
    recommended_action,
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
    // Deterministic secondary sort: by title then artwork_id.
    const t = a.title.localeCompare(b.title);
    if (t !== 0) return t;
    return a.artwork_id.localeCompare(b.artwork_id);
  });
}

