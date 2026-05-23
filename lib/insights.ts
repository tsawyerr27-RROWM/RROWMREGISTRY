import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getActivityTimeline,
  getArtworkCountTrend,
  getValueTrend,
} from "@/lib/data-insights";

function monthKey(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthsBetween(a: Date, b: Date): number {
  const ay = a.getUTCFullYear();
  const am = a.getUTCMonth();
  const by = b.getUTCFullYear();
  const bm = b.getUTCMonth();
  return Math.abs((by - ay) * 12 + (bm - am));
}

export async function getCatalogueHighlights(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<{
  totalWorks: number;
  uniqueWorks: number;
  editionWorks: number;
  mostRecentArtwork: { id: string; title: string | null; created_at: string | null } | null;
  mostActivePeriod: string | null;
}> {
  if (artworkIds.length === 0) {
    return {
      totalWorks: 0,
      uniqueWorks: 0,
      editionWorks: 0,
      mostRecentArtwork: null,
      mostActivePeriod: null,
    };
  }

  const { data } = await supabase
    .from("artworks")
    .select("id, title, created_at, edition_total, is_unique")
    .in("id", artworkIds);

  const rows = (data || []) as any[];
  const totalWorks = rows.length;
  let editionWorks = 0;
  let uniqueWorks = 0;

  const monthCounts: Record<string, number> = {};
  let mostRecent: any | null = null;

  for (const r of rows) {
    const edTotal = Number(r.edition_total ?? 0);
    const isUnique = r.is_unique === true;
    if (edTotal > 1) editionWorks += 1;
    if (isUnique || edTotal <= 1) uniqueWorks += 1;

    const created = r.created_at ? new Date(String(r.created_at)) : null;
    if (created && !Number.isNaN(created.getTime())) {
      const mk = monthKey(created);
      monthCounts[mk] = (monthCounts[mk] || 0) + 1;
      if (!mostRecent) mostRecent = r;
      else {
        const a = new Date(String(mostRecent.created_at || 0)).getTime();
        const b = created.getTime();
        if (b > a) mostRecent = r;
      }
    }
  }

  let mostActivePeriod: string | null = null;
  let best = 0;
  for (const [m, c] of Object.entries(monthCounts)) {
    if (c > best) {
      best = c;
      mostActivePeriod = m;
    }
  }

  return {
    totalWorks,
    uniqueWorks,
    editionWorks,
    mostRecentArtwork: mostRecent
      ? { id: String(mostRecent.id), title: mostRecent.title ?? null, created_at: mostRecent.created_at ?? null }
      : null,
    mostActivePeriod,
  };
}

export async function getOwnershipIntelligence(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<{
  totalTransfers: number;
  verifiedOwnerships: number;
  unverifiedOwnerships: number;
  avgTransfersPerWork: number;
  recentTransfers: number;
}> {
  if (artworkIds.length === 0) {
    return {
      totalTransfers: 0,
      verifiedOwnerships: 0,
      unverifiedOwnerships: 0,
      avgTransfersPerWork: 0,
      recentTransfers: 0,
    };
  }

  const { data } = await supabase
    .from("ownership_events")
    .select("artwork_id, verification_status, created_at")
    .in("artwork_id", artworkIds);

  const rows = (data || []) as any[];
  const totalTransfers = rows.length;

  let verifiedOwnerships = 0;
  let unverifiedOwnerships = 0;
  let recentTransfers = 0;
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 90;

  for (const r of rows) {
    const st = String(r.verification_status || "recorded").toLowerCase();
    if (st === "verified") verifiedOwnerships += 1;
    else unverifiedOwnerships += 1;

    const created = r.created_at ? new Date(String(r.created_at)).getTime() : 0;
    if (created && created >= cutoff) recentTransfers += 1;
  }

  const avgTransfersPerWork =
    artworkIds.length > 0 ? totalTransfers / artworkIds.length : 0;

  return {
    totalTransfers,
    verifiedOwnerships,
    unverifiedOwnerships,
    avgTransfersPerWork: Number(avgTransfersPerWork.toFixed(2)),
    recentTransfers,
  };
}

export async function getRecordHealth(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<{
  fullyVerified: number;
  withCertificates: number;
  missingVerification: number;
  unresolvedSales: number;
  staleRecords: number;
}> {
  if (artworkIds.length === 0) {
    return {
      fullyVerified: 0,
      withCertificates: 0,
      missingVerification: 0,
      unresolvedSales: 0,
      staleRecords: 0,
    };
  }

  const [
    { data: certRows },
    { data: verRows },
    { data: saleRows },
    { data: ownRows },
    { data: valRows },
  ] = await Promise.all([
    supabase
      .from("certificates")
      .select("artwork_id, revoked, issued_at")
      .in("artwork_id", artworkIds),
    supabase
      .from("verification_events")
      .select("artwork_id, source, status, created_at")
      .in("artwork_id", artworkIds),
    supabase
      .from("value_events")
      .select("artwork_id, value_type, ownership_resolved, created_at")
      .in("artwork_id", artworkIds)
      .eq("value_type", "sale"),
    supabase
      .from("ownership_events")
      .select("artwork_id, verification_status, created_at, id")
      .in("artwork_id", artworkIds)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }),
    supabase
      .from("value_events")
      .select("artwork_id, created_at")
      .in("artwork_id", artworkIds)
      .order("created_at", { ascending: false }),
  ]);

  const hasCert = new Set<string>();
  for (const c of (certRows || []) as any[]) {
    if (c.revoked === true) continue;
    if (c.artwork_id) hasCert.add(String(c.artwork_id));
  }

  const confirmedVerByArt: Record<string, Set<string>> = {};
  const lastVerAt: Record<string, number> = {};
  for (const r of (verRows || []) as any[]) {
    if (String(r.status || "confirmed").toLowerCase() !== "confirmed") continue;
    const aid = String(r.artwork_id || "");
    if (!aid) continue;
    if (!confirmedVerByArt[aid]) confirmedVerByArt[aid] = new Set();
    confirmedVerByArt[aid].add(String(r.source || "system"));
    const t = r.created_at ? new Date(String(r.created_at)).getTime() : 0;
    if (t) lastVerAt[aid] = Math.max(lastVerAt[aid] || 0, t);
  }

  let unresolvedSales = 0;
  const lastSaleAt: Record<string, number> = {};
  for (const s of (saleRows || []) as any[]) {
    const aid = String(s.artwork_id || "");
    if (!aid) continue;
    if (s.ownership_resolved !== true) unresolvedSales += 1;
    const t = s.created_at ? new Date(String(s.created_at)).getTime() : 0;
    if (t) lastSaleAt[aid] = Math.max(lastSaleAt[aid] || 0, t);
  }

  // Latest ownership status per artwork
  const latestOwnStatus: Record<string, string> = {};
  for (const o of (ownRows || []) as any[]) {
    const aid = String(o.artwork_id || "");
    if (!aid) continue;
    if (latestOwnStatus[aid]) continue; // already picked latest due to ordering
    latestOwnStatus[aid] = String(o.verification_status || "recorded").toLowerCase();
  }

  const lastValAt: Record<string, number> = {};
  for (const v of (valRows || []) as any[]) {
    const aid = String(v.artwork_id || "");
    if (!aid) continue;
    if (lastValAt[aid]) continue;
    const t = v.created_at ? new Date(String(v.created_at)).getTime() : 0;
    if (t) lastValAt[aid] = t;
  }

  let withCertificates = hasCert.size;
  let missingVerification = 0;
  let fullyVerified = 0;
  let staleRecords = 0;

  const now = new Date();

  for (const aid of artworkIds) {
    const a = String(aid);
    const hasCertificate = hasCert.has(a);
    const sources = confirmedVerByArt[a] || new Set<string>();
    const hasAnyVerification = sources.size > 0;
    const hasGalleryVerification = sources.has("gallery");
    const latestOwnVerified = latestOwnStatus[a] === "verified";

    if (!hasAnyVerification && !hasCertificate) missingVerification += 1;
    if (hasCertificate && latestOwnVerified && hasGalleryVerification) fullyVerified += 1;

    const last =
      Math.max(
        lastValAt[a] || 0,
        lastVerAt[a] || 0,
        lastSaleAt[a] || 0
      ) || 0;
    if (last) {
      const months = monthsBetween(new Date(last), now);
      if (months > 24) staleRecords += 1;
    }
  }

  return {
    fullyVerified,
    withCertificates,
    missingVerification,
    unresolvedSales,
    staleRecords,
  };
}

export function generateInsightSummary(input: {
  valueTrend?: { growthDirection?: "up" | "down" | "stable"; currencies?: string[] };
  artworkTrend?: { series?: Array<{ works: number }> };
  activity?: { series?: Array<{ events: number }> };
  catalogue?: { mostActivePeriod?: string | null; totalWorks?: number };
  ownership?: { verifiedOwnerships?: number; unverifiedOwnerships?: number; recentTransfers?: number };
  health?: { missingVerification?: number; unresolvedSales?: number; staleRecords?: number; fullyVerified?: number };
}): string {
  const { valueTrend, activity, catalogue, ownership, health } = input;

  if (health) {
    if ((health.missingVerification || 0) > 0) return "Some records are incomplete.";
    if ((health.unresolvedSales || 0) > 0) return "Some sales are recorded without a completed ownership transfer.";
    if ((health.fullyVerified || 0) > 0) return "Many records are fully verified.";
  }

  if (ownership) {
    const v = ownership.verifiedOwnerships || 0;
    const u = ownership.unverifiedOwnerships || 0;
    if (v > u && v > 0) return "Ownership records are largely verified.";
    if (u > 0) return "Some ownership records have no verification recorded.";
    if ((ownership.recentTransfers || 0) > 0) return "Ownership changes are concentrated in recent periods.";
  }

  if (valueTrend) {
    const cur = valueTrend.currencies || [];
    if (cur.length === 0) {
      return "No value events recorded in the selected window.";
    }
    if (cur.length > 1) return "Values are recorded across multiple currencies.";
    if (valueTrend.growthDirection === "up") return "Value has increased in recent periods.";
    if (valueTrend.growthDirection === "down") return "Value has softened in recent periods.";
    return "Recorded value is steady across recent periods.";
  }

  if (activity) {
    const total = (activity.series || []).reduce((a, b) => a + (b.events || 0), 0);
    if (total > 0) return "Most activity occurred in recent periods.";
    return "No recent activity recorded.";
  }

  if (catalogue?.mostActivePeriod) return "Most works were registered in a concentrated period.";

  return "A calm view of this record over time.";
}

function generateValueRoleInsight(
  role: "artist" | "collector" | "gallery",
  valueTrend: NonNullable<
    Parameters<typeof generateInsightSummary>[0]["valueTrend"]
  >
) {
  const cur = valueTrend.currencies || [];
  if (cur.length === 0) {
    if (role === "artist") return "No value events in the last 12 months.";
    if (role === "collector") return "No recorded values in this window.";
    return "No declared values in this window for represented works.";
  }
  if (cur.length > 1) {
    if (role === "artist")
      return "Values are tracked in multiple currencies; each line uses its own scale.";
    if (role === "collector")
      return "Your collection spans multiple currencies.";
    return "Declared values span multiple currencies across your studio.";
  }
  if (valueTrend.growthDirection === "up") {
    if (role === "artist")
      return "Latest recorded values are trending up versus prior entries.";
    if (role === "collector")
      return "Latest recorded values are trending up.";
    return "Latest declared values are trending up across your studio.";
  }
  if (valueTrend.growthDirection === "down") {
    if (role === "artist")
      return "Latest recorded values have softened versus prior entries.";
    if (role === "collector")
      return "Latest recorded values have softened.";
    return "Latest declared values have softened across recent periods.";
  }
  if (role === "artist")
    return "Latest recorded values are steady compared with prior entries.";
  if (role === "collector") return "Recorded values are holding steady.";
  return "Declared values are steady across recent periods.";
}

export function generateRoleInsight(
  role: "artist" | "collector" | "gallery",
  input: Parameters<typeof generateInsightSummary>[0]
) {
  if (
    input.valueTrend &&
    !input.health &&
    !input.ownership &&
    !input.catalogue &&
    !input.artworkTrend &&
    !input.activity
  ) {
    return generateValueRoleInsight(role, input.valueTrend);
  }

  const base = generateInsightSummary(input);
  if (role === "artist") {
    if (base.includes("largely verified"))
      return "The catalogue shows a clear ownership record.";
    if (base.includes("no verification recorded"))
      return "Some ownership continuity is pending on file.";
    if (base.includes("incomplete"))
      return "Some works may need continuity recorded to complete the file.";
    if (base.includes("Value has increased") || base.includes("softened"))
      return "Latest recorded values have shifted versus prior periods.";
    if (base.includes("Recorded value is steady"))
      return "Latest recorded values are steady compared with prior entries.";
    if (base.includes("Values are recorded across multiple currencies"))
      return "Values are tracked in more than one currency.";
    if (base.includes("No value events recorded"))
      return "Add a value event to see progression here.";
    return "The catalogue has grown steadily.";
  }
  if (role === "collector") {
    if (base.includes("no verification recorded"))
      return "Some ownership continuity is pending on file.";
    if (base.includes("largely verified"))
      return "Ownership records are well established.";
    if (base.includes("currency"))
      return "The collection is recorded across multiple currencies.";
    return "The collection shows a consistent record over time.";
  }
  // gallery
  if (base.includes("no verification recorded"))
    return "Some ownership continuity is pending on file.";
  if (base.includes("largely verified"))
    return "Verification activity is steady across your studio.";
  if (base.includes("incomplete"))
    return "Some records are still pending on file.";
  return "Registry activity is steady across your represented works.";
}

export async function getOwnershipTransferTimeline(
  supabase: SupabaseClient,
  artworkIds: string[],
  opts: { months?: number } = {}
): Promise<{ series: { month: string; transfers: number; verified: number; unverified: number }[] }> {
  const months = opts.months ?? 12;
  if (artworkIds.length === 0) return { series: [] };

  const { data } = await supabase
    .from("ownership_events")
    .select("created_at, verification_status, artwork_id")
    .in("artwork_id", artworkIds)
    .order("created_at", { ascending: true });

  const points: string[] = [];
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  for (let i = months - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCMonth(d.getUTCMonth() - i);
    points.push(monthKey(x));
  }

  const m: Record<string, { transfers: number; verified: number; unverified: number }> = {};
  for (const p of points) m[p] = { transfers: 0, verified: 0, unverified: 0 };

  for (const r of (data || []) as any[]) {
    const created = r.created_at ? new Date(String(r.created_at)) : null;
    if (!created || Number.isNaN(created.getTime())) continue;
    const k = monthKey(created);
    if (!m[k]) continue;
    const st = String(r.verification_status || "recorded").toLowerCase();
    m[k].transfers += 1;
    if (st === "verified") m[k].verified += 1;
    else m[k].unverified += 1;
  }

  return {
    series: points.map((p) => ({ month: p, ...m[p] })),
  };
}

export async function getDashboardInsights(args: {
  supabase: SupabaseClient;
  userId: string;
  artworkIds: string[];
}) {
  const { supabase, userId, artworkIds } = args;

  const [
    valueTrend,
    artworkTrend,
    activity,
    catalogue,
    ownership,
    health,
    ownershipTrend,
  ] =
    await Promise.all([
      getValueTrend(supabase, artworkIds, { months: 12 }),
      getArtworkCountTrend(supabase, artworkIds, { months: 12 }),
      getActivityTimeline(supabase, userId, { months: 12 }),
      getCatalogueHighlights(supabase, artworkIds),
      getOwnershipIntelligence(supabase, artworkIds),
      getRecordHealth(supabase, artworkIds),
      getOwnershipTransferTimeline(supabase, artworkIds, { months: 12 }),
    ]);

  return {
    valueTrend,
    artworkTrend,
    activity,
    catalogue,
    ownership,
    health,
    ownershipTrend,
  } as const;
}

