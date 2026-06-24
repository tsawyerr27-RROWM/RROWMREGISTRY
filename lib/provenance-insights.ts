import type { SupabaseClient } from "@supabase/supabase-js";

import {
  VERIFICATION_EVENT_INSIGHTS_SELECT,
} from "@/lib/verification-events-schema";
import { normalizeVerificationStatus } from "@/lib/ownership-ledger";

export type ProvenanceInsight = {
  type: "gap" | "warning" | "positive" | "neutral";
  message: string;
  priority: number;
};

function monthsBetween(a: Date, b: Date): number {
  const ay = a.getUTCFullYear();
  const am = a.getUTCMonth();
  const by = b.getUTCFullYear();
  const bm = b.getUTCMonth();
  return Math.abs((by - ay) * 12 + (bm - am));
}

export async function getProvenanceInsights(args: {
  supabase: SupabaseClient;
  artworkId: string;
  artworkCreatedAt?: string | null;
}): Promise<ProvenanceInsight[]> {
  const { supabase, artworkId, artworkCreatedAt } = args;

  const insights: ProvenanceInsight[] = [];

  const [
    { data: vEvents, error: vErr },
    { data: cert, error: certErr },
    { data: latestOwnership, error: ownErr },
    { data: saleRows, error: saleErr },
    { data: lastValue, error: lastValErr },
  ] = await Promise.all([
    supabase
      .from("verification_events")
      .select(VERIFICATION_EVENT_INSIGHTS_SELECT)
      .eq("artwork_id", artworkId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("certificates")
      .select("id, issued_at, revoked")
      .eq("artwork_id", artworkId)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ownership_events")
      .select("verification_status, created_at")
      .eq("artwork_id", artworkId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("value_events")
      .select("value_type, ownership_resolved, created_at")
      .eq("artwork_id", artworkId)
      .eq("value_type", "sale")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("value_events")
      .select("created_at")
      .eq("artwork_id", artworkId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const confirmedEvents = !vErr && Array.isArray(vEvents)
    ? (vEvents as any[]).filter((e) => {
        const status = String(e?.status || "confirmed").toLowerCase().trim();
        return status === "confirmed";
      })
    : [];
  const hasVerificationSignals = confirmedEvents.length > 0;
  const hasGalleryVerification = confirmedEvents.some((e) => {
    const src = String(e?.source || e?.verification_method || "")
      .toLowerCase()
      .trim();
    return src === "gallery";
  });
  const hasCertificate = !certErr && Boolean(cert?.id) && cert?.revoked !== true;

  // A. Verification gap
  if (!hasVerificationSignals && !hasCertificate) {
    insights.push({
      type: "gap",
      message: "This work has no verification signals.",
      priority: 10,
    });
  }

  // B. Ownership not verified (latest)
  const latestOwnershipStatus = normalizeVerificationStatus(
    (latestOwnership as any)?.verification_status
  );
  if (!ownErr && latestOwnership && latestOwnershipStatus !== "verified") {
    insights.push({
      type: "neutral",
      message: "Current ownership is unverified.",
      priority: 7,
    });
  }

  // C. Sale unresolved
  const latestSale = Array.isArray(saleRows) ? saleRows[0] : null;
  if (!saleErr && latestSale) {
    const resolved = (latestSale as any)?.ownership_resolved === true;
    if (!resolved) {
      insights.push({
        type: "neutral",
        message: "Sale recorded. Ownership transfer incomplete.",
        priority: 8,
      });
    }
  }

  // D. High-confidence record (certificate + verified ownership + any verification event)
  if (
    hasCertificate &&
    latestOwnershipStatus === "verified" &&
    hasGalleryVerification
  ) {
    insights.push({
      type: "positive",
      message: "Fully verified record.",
      priority: 2,
    });
  }

  // E. Stale record (> 24 months since last activity)
  const lastActivityISO =
    (!lastValErr && lastValue?.created_at ? String(lastValue.created_at) : null) ||
    (!ownErr && latestOwnership?.created_at ? String(latestOwnership.created_at) : null) ||
    (artworkCreatedAt ? String(artworkCreatedAt) : null);

  if (lastActivityISO) {
    const last = new Date(lastActivityISO);
    if (!Number.isNaN(last.getTime())) {
      const now = new Date();
      if (monthsBetween(last, now) > 24) {
        insights.push({
          type: "neutral",
          message: "No recent activity recorded.",
          priority: 4,
        });
      }
    }
  }

  // Sort: critical gaps first, positive last.
  insights.sort((a, b) => b.priority - a.priority);
  return insights;
}

