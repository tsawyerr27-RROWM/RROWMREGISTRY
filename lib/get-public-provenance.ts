/**
 * Server-only: public proven narrative + replayed state (no debug payload).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReplayState } from "./artwork-replay-engine";
import {
  galleryAuthorityFromRecord,
  normUuid,
  replayTimeline,
  sortEvents,
  timelineFromWire,
} from "./artwork-replay-engine";
import {
  getArtworkReplayData,
  type ArtworkReplayValidation,
  type ArtworkReplayWireEvent,
} from "./get-artwork-replay-data";
import { getCanonicalOwner } from "./canonical-ownership-engine";

const REGISTRY_GROUP_GAP_MS = 120_000;

export type ProvenanceViewContext = "public" | "collector" | "gallery";

export type ProvenanceTimelineItemBody = {
  title: string;
  description: string;
  occurredAtIso: string;
  valueVisibilityLabel?: string | null;
  sourceNote?: string | null;
};

export type ProvenanceTimelineRow =
  | (ProvenanceTimelineItemBody & {
      kind: "single";
      dateLabel: string;
    })
  | {
      kind: "group";
      dateLabel: string;
      title: "Registry update" | "Value updates" | "System writes";
      items: ProvenanceTimelineItemBody[];
    };

/** @deprecated Use ProvenanceTimelineRow */
export type PublicProvenanceTimelineSingle = Extract<ProvenanceTimelineRow, { kind: "single" }>;
/** @deprecated Use ProvenanceTimelineRow */
export type PublicProvenanceTimelineGroup = Extract<ProvenanceTimelineRow, { kind: "group" }>;

export type PublicProvenanceIntegrity = {
  levelLabel: string;
  narrative: string;
  certificateRevoked?: {
    headline: string;
    body: string;
  };
};

export type PublicProvenancePayload = {
  header: {
    title: string | null;
    artistName: string | null;
    artistSlug: string | null;
    registryId: string;
    createdAtLabel: string | null;
  };
  /** Wire events (ownership, value, verification, certificate, system) — for “X recorded events”. */
  recordedEventCount: number;
  /** True when there are no wire events; timeline should not be shown. */
  provenanceActivityEmpty: boolean;
  viewContext: ProvenanceViewContext;
  artworkId: string;
  integrity: PublicProvenanceIntegrity;
  timeline: ProvenanceTimelineRow[];
  /** Declared value changes (non-public views; same wire events as replay). */
  valueHistory: Array<{
    currencyUpper: string;
    amountLabel: string;
    visibilityNote: string | null;
    whenLabel: string;
  }>;
  /** Latest row per currency (for summary line). */
  valueLatestByCurrency: Array<{ currencyUpper: string; line: string }>;
  collectorSurface?: {
    acquisitionNote: string | null;
  };
  gallerySurface?: {
    galleryName: string | null;
    galleryVerified: boolean;
    artistRelationship: "represented" | "associated";
    verificationAuthorityLine: string;
    canMarkVerified: boolean;
    certificateContextLine: string | null;
  };
  state: {
    ownerLine: string;
    verificationLine: string;
    valuesLines: string[];
    certificateLine: string;
  };
  certificate: {
    showRow: boolean;
    label: string;
    href: string;
    loginNextHref: string;
  };
};

export type PublicProvenanceLimitedHeader = {
  title: string | null;
  artistName: string | null;
  artistSlug: string | null;
  registryId: string;
};

export type GetPublicProvenanceResult =
  | { kind: "full"; data: PublicProvenancePayload }
  | { kind: "limited"; header: PublicProvenanceLimitedHeader }
  | { kind: "not_found" };

export type ProvenanceViewerOptions = {
  /** Authenticated user id (auth.users), if any. */
  viewerUserId: string | null;
  /**
   * RLS-aware server client (e.g. `createSupabaseServerClient()`). When the service role key
   * is not set, this is used for gallery/collector view detection; replay still uses the anon key.
   */
  viewerSupabase?: SupabaseClient | null;
};

export const PUBLIC_PROVENANCE_UNAVAILABLE =
  "Provenance data is temporarily unavailable.";

type InternalEntry = {
  ts: number;
  title: string;
  description: string;
  occurredAtIso: string;
  valueVisibilityLabel?: string | null;
  sourceNote?: string | null;
  allowCluster: boolean;
  clusterKind?: "value" | "system";
};

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Public anon client for identity fetch when service role is not configured. */
function publicAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type ArtworkIdentityRow = {
  id: string;
  artistId: string | null;
  currentOwnerId: string | null;
  title: string | null;
  artistName: string | null;
  artistSlug: string | null;
  registryId: string;
  createdAtLabel: string | null;
  createdAt: string | null;
  artistGalleryId: string | null;
  artistGallery: { id: string; name: string | null; verified: boolean } | null;
};

async function loadArtworkIdentity(
  client: SupabaseClient,
  registryId: string
): Promise<ArtworkIdentityRow | null> {
  const { data: awRow } = await client
    .from("artworks")
    .select(
      "id, created_at, artist_id, catalogue_artist_name, title, registry_id"
    )
    .eq("registry_id", registryId)
    .maybeSingle();

  if (!awRow?.id) return null;

  const title = awRow.title != null ? String(awRow.title) : null;
  const regId = awRow.registry_id != null ? String(awRow.registry_id) : registryId;
  const artistId = awRow.artist_id != null ? String(awRow.artist_id) : null;
  const canonical = await getCanonicalOwner(client, String(awRow.id));
  const currentOwnerId = canonical.userId;

  let artistName: string | null = null;
  let artistSlug: string | null = null;
  let artistGalleryId: string | null = null;
  let artistGallery: ArtworkIdentityRow["artistGallery"] = null;

  if (awRow.artist_id) {
    const { data: ar } = await client
      .from("artists")
      .select("display_name, slug, gallery_id")
      .eq("id", awRow.artist_id)
      .maybeSingle();
    artistName = ar?.display_name != null ? String(ar.display_name).trim() || null : null;
    artistSlug = ar?.slug != null ? String(ar.slug).trim() || null : null;
    artistGalleryId = ar?.gallery_id != null ? String(ar.gallery_id) : null;
    if (artistGalleryId) {
      const { data: g } = await client
        .from("galleries")
        .select("id, name, verified")
        .eq("id", artistGalleryId)
        .maybeSingle();
      if (g?.id) {
        artistGallery = {
          id: String(g.id),
          name: g.name != null ? String(g.name).trim() || null : null,
          verified: g.verified === true,
        };
      }
    }
  } else if ((awRow as { catalogue_artist_name?: string | null }).catalogue_artist_name) {
    const cn = String(
      (awRow as { catalogue_artist_name?: string | null }).catalogue_artist_name ?? ""
    ).trim();
    artistName = cn || null;
  }

  const createdAt = awRow.created_at != null ? String(awRow.created_at) : null;
  const createdAtLabel = createdAt ? formatLongDate(createdAt) : null;

  return {
    id: String(awRow.id),
    artistId,
    currentOwnerId,
    title,
    artistName,
    artistSlug,
    registryId: regId,
    createdAtLabel,
    createdAt,
    artistGalleryId,
    artistGallery,
  };
}

async function resolveViewContext(
  admin: SupabaseClient,
  viewerUserId: string | null,
  artistGalleryId: string | null,
  artworkDbOwnerId: string | null
): Promise<ProvenanceViewContext> {
  const v = normUuid(viewerUserId);
  if (!v) return "public";
  const ag = normUuid(artistGalleryId);
  if (ag) {
    const { data: gu } = await admin
      .from("gallery_users")
      .select("user_id")
      .eq("user_id", v)
      .eq("gallery_id", ag)
      .maybeSingle();
    if (gu?.user_id) return "gallery";
  }
  const o = normUuid(artworkDbOwnerId);
  if (o && o === v) return "collector";
  return "public";
}

function formatExactWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
}

function valueVisibilityNote(
  level: string | null | undefined,
  ctx: ProvenanceViewContext
): string | null {
  if (ctx === "public") return null;
  if (!level || level === "" || level === "public") return null;
  if (level === "certificate") return "Certificate visibility";
  return "Private";
}

function valueTitleForContext(
  amt: number,
  cur: string,
  visNote: string | null,
  ctx: ProvenanceViewContext
): string {
  const money = formatMoney(amt, cur);
  if (ctx === "public") return `Declared value recorded: ${money}`;
  const suffix = visNote ? ` (${visNote})` : "";
  return `Value recorded: ${money}${suffix}`;
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateRange(aIso: string, bIso: string): string {
  const a = formatLongDate(aIso);
  const b = formatLongDate(bIso);
  return a === b ? a : `${a} – ${b}`;
}

function formatMoney(amount: number, currency: string): string {
  const cur = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${cur}`;
  }
}

function computeRecordIntegrity(args: {
  state: ReplayState;
  validation: ArtworkReplayValidation;
  events: ArtworkReplayWireEvent[];
  ownershipChainLength: number;
}): PublicProvenanceIntegrity {
  const { state, validation, events, ownershipChainLength } = args;

  const liveCerts = state.certificates.filter((c) => !c.revoked);
  const has_certificate = liveCerts.length > 0;
  const hasRevokedOnly = state.certificates.length > 0 && !has_certificate;

  const has_gallery_verification = events.some(
    (e) =>
      e.type === "verification" &&
      String(e.data.source || "").toLowerCase() === "gallery" &&
      String(e.data.status || "").toLowerCase() === "confirmed"
  );

  const missing_links = validation.mismatches.length > 0;

  const verified = state.trust_tier === "verified";

  let levelLabel: string;
  let narrative: string;

  if (!verified || missing_links || ownershipChainLength < 1) {
    levelLabel = "Opening file";
    narrative =
      "The catalogue entry is active; the chronology may still be gathering participant and custody detail.";
  } else if (
    has_certificate &&
    has_gallery_verification &&
    ownershipChainLength >= 2 &&
    !missing_links
  ) {
    levelLabel = "Layered on file";
    narrative =
      "Certificate, institution-linked confirmation, and custody milestones appear together in the current record. That depth does not imply legal completeness.";
  } else {
    levelLabel = "Documented listing";
    narrative =
      "The work is listed as verified on the registry; breadth of historical context still depends on what participants have filed.";
  }

  const certificateRevoked = hasRevokedOnly
    ? {
        headline: "Certificate no longer on file",
        body: "A certificate was revoked; treat the filing as disputed until the chronology reflects a resolved outcome.",
      }
    : undefined;

  return { levelLabel, narrative, certificateRevoked };
}

function certRevokedMapFromRecord(r: Record<string, boolean>): Map<string, boolean> {
  const m = new Map<string, boolean>();
  for (const [k, v] of Object.entries(r)) m.set(k.toLowerCase(), v);
  return m;
}

async function holderLabelMap(
  admin: SupabaseClient,
  userIds: (string | null | undefined)[],
  artistId: string | null,
  artistDisplay: string | null,
  opts?: { viewerUserId: string | null; viewContext: ProvenanceViewContext }
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const artist = normUuid(artistId);
  const artistName = artistDisplay?.trim() || "Artist";
  const normIds = [...new Set(userIds.map(normUuid).filter(Boolean))] as string[];
  const viewer = normUuid(opts?.viewerUserId ?? null);

  for (const id of normIds) {
    if (opts?.viewContext === "collector" && viewer && id === viewer) {
      out.set(id, "You (current owner)");
      continue;
    }
    if (artist && id === artist) out.set(id, artistName);
  }

  const needProfiles = normIds.filter((id) => !out.has(id));
  if (needProfiles.length) {
    const { data: profiles } = await admin
      .from("collector_profiles")
      .select("user_id, display_name, slug, is_public")
      .in("user_id", needProfiles);
    for (const row of profiles ?? []) {
      const uid = normUuid((row as { user_id: string }).user_id);
      if (!uid) continue;
      const p = row as {
        display_name: string | null;
        slug: string | null;
        is_public: boolean | null;
      };
      if (p.is_public && p.slug && p.display_name?.trim()) out.set(uid, p.display_name.trim());
      else out.set(uid, "Private holder");
    }
  }

  for (const id of normIds) {
    if (!out.has(id)) out.set(id, "Private holder");
  }

  return out;
}

async function galleryNameMap(
  admin: SupabaseClient,
  events: ArtworkReplayWireEvent[]
): Promise<Map<string, string>> {
  const ids = new Set<string>();
  for (const e of events) {
    if (e.type !== "verification") continue;
    if (String(e.data.source || "").toLowerCase() !== "gallery") continue;
    const gid = e.data.source_id as string | null | undefined;
    const n = normUuid(gid);
    if (n) ids.add(n);
  }
  const m = new Map<string, string>();
  if (!ids.size) return m;
  const { data: rows } = await admin.from("galleries").select("id, name").in("id", [...ids]);
  for (const r of rows ?? []) {
    const id = normUuid((r as { id: string }).id);
    const name = String((r as { name: string | null }).name || "").trim();
    if (id) m.set(id, name || "Gallery");
  }
  return m;
}

function buildInternalEntries(args: {
  events: ArtworkReplayWireEvent[];
  holders: Map<string, string>;
  galleries: Map<string, string>;
  createdAt: string | null;
  artistDisplay: string | null;
  viewContext: ProvenanceViewContext;
  viewerGalleryId: string | null;
}): InternalEntry[] {
  const { events, holders, galleries, createdAt, artistDisplay, viewContext, viewerGalleryId } =
    args;
  const entries: InternalEntry[] = [];
  const vg = normUuid(viewerGalleryId);

  if (createdAt) {
    const ts = new Date(createdAt).getTime();
    if (!Number.isNaN(ts)) {
      entries.push({
        ts,
        title: artistDisplay?.trim()
          ? `Record established, attributed to ${artistDisplay.trim()}`
          : "Record established on the registry",
        description: "",
        occurredAtIso: new Date(createdAt).toISOString(),
        allowCluster: false,
      });
    }
  }

  const sorted = [...events].sort((a, b) => {
    if (a.sortTs !== b.sortTs) return a.sortTs - b.sortTs;
    return a.id.localeCompare(b.id);
  });

  for (const e of sorted) {
    const ts = e.sortTs;

    if (e.type === "ownership") {
      const toId = normUuid(e.data.to_user_id as string | null);
      const label = toId ? holders.get(toId) ?? "Private holder" : "Private holder";
      entries.push({
        ts,
        title: `Ownership transferred to ${label}`,
        description: "",
        occurredAtIso: e.timestamp,
        allowCluster: false,
      });
      continue;
    }

    if (e.type === "value") {
      const cur = String(e.data.currency || "USD").toUpperCase();
      const amt = Number(e.data.declared_value ?? 0);
      const visLevel = e.data.visibility_level as string | null | undefined;
      const visNote = valueVisibilityNote(visLevel, viewContext);
      entries.push({
        ts,
        title: valueTitleForContext(amt, cur, visNote, viewContext),
        description: "",
        occurredAtIso: e.timestamp,
        valueVisibilityLabel: visNote,
        allowCluster: true,
        clusterKind: "value",
      });
      continue;
    }

    if (e.type === "system") {
      const summary =
        typeof e.data.summary === "string" && e.data.summary.trim()
          ? e.data.summary.trim()
          : typeof e.data.label === "string" && e.data.label.trim()
            ? e.data.label.trim()
            : "Registry update applied";
      entries.push({
        ts,
        title: summary,
        description: "",
        occurredAtIso: e.timestamp,
        allowCluster: true,
        clusterKind: "system",
      });
      continue;
    }

    if (e.type === "verification") {
      const st = String(e.data.status || "").toLowerCase();
      if (st && st !== "confirmed") continue;
      const src = String(e.data.source || "").toLowerCase();
      let title: string;
      let sourceNote: string | null = null;
      if (src === "gallery") {
        const gid = normUuid(e.data.source_id as string | null);
        const gn = gid ? galleries.get(gid) : null;
        if (viewContext === "gallery" && gid && vg && gid === vg) {
          title = "Verified by your gallery";
        } else {
          title = gn ? `Verified by ${gn}` : "Verified by gallery";
        }
        if (viewContext === "gallery" && gid && vg && gid !== vg) {
          sourceNote = "Attestation by another institution on file.";
        }
      } else if (src === "artist") {
        title = "Verified by artist";
        if (viewContext === "gallery") sourceNote = "Artist attestation on file.";
      } else if (src === "certificate") {
        title = "Certificate verification recorded";
      } else {
        title = "Verification recorded";
      }
      entries.push({
        ts,
        title,
        description: "",
        occurredAtIso: e.timestamp,
        sourceNote,
        allowCluster: false,
      });
      continue;
    }

    if (e.type === "certificate") {
      entries.push({
        ts,
        title: "Certificate issued",
        description: "",
        occurredAtIso: e.timestamp,
        allowCluster: false,
      });
      if (e.data.revoked === true) {
        entries.push({
          ts: ts + 1,
          title: "Certificate revoked",
          description: "",
          occurredAtIso: new Date(ts + 1).toISOString(),
          allowCluster: false,
        });
      }
    }
  }

  entries.sort((a, b) => a.ts - b.ts);
  return entries;
}

function clusterHeading(block: InternalEntry[]): "Registry update" | "Value updates" | "System writes" {
  const kinds = block.map((b) => b.clusterKind);
  const allValue = kinds.every((k) => k === "value");
  const allSystem = kinds.every((k) => k === "system");
  if (allValue) return "Value updates";
  if (allSystem) return "System writes";
  return "Registry update";
}

function internalToItemBody(b: InternalEntry): ProvenanceTimelineItemBody {
  return {
    title: b.title,
    description: b.description,
    occurredAtIso: b.occurredAtIso,
    valueVisibilityLabel: b.valueVisibilityLabel ?? null,
    sourceNote: b.sourceNote ?? null,
  };
}

function groupEntries(raw: InternalEntry[]): ProvenanceTimelineRow[] {
  if (!raw.length) return [];
  const sorted = [...raw].sort((a, b) => {
    if (a.ts !== b.ts) return a.ts - b.ts;
    return a.title.localeCompare(b.title);
  });
  const out: ProvenanceTimelineRow[] = [];
  let i = 0;
  while (i < sorted.length) {
    const cur = sorted[i];
    if (!cur.allowCluster) {
      out.push({
        kind: "single",
        dateLabel: formatLongDate(new Date(cur.ts).toISOString()),
        ...internalToItemBody(cur),
      });
      i++;
      continue;
    }

    const block: InternalEntry[] = [cur];
    i++;
    while (i < sorted.length) {
      const next = sorted[i];
      if (!next.allowCluster) break;
      if (next.ts - block[block.length - 1].ts > REGISTRY_GROUP_GAP_MS) break;
      block.push(next);
      i++;
    }

    if (block.length === 1) {
      const b = block[0];
      out.push({
        kind: "single",
        dateLabel: formatLongDate(new Date(b.ts).toISOString()),
        ...internalToItemBody(b),
      });
    } else {
      const dateLabel = formatDateRange(
        new Date(block[0].ts).toISOString(),
        new Date(block[block.length - 1].ts).toISOString()
      );
      out.push({
        kind: "group",
        dateLabel,
        title: clusterHeading(block),
        items: block.map((b) => internalToItemBody(b)),
      });
    }
  }
  return out;
}

function buildValueHistory(
  events: ArtworkReplayWireEvent[],
  viewContext: ProvenanceViewContext
): PublicProvenancePayload["valueHistory"] {
  if (viewContext === "public") return [];
  const sorted = [...events]
    .filter((e) => e.type === "value")
    .sort((a, b) => a.sortTs - b.sortTs);
  return sorted.map((e) => {
    const cur = String(e.data.currency || "USD").toUpperCase();
    const amt = Number(e.data.declared_value ?? 0);
    const vis = valueVisibilityNote(e.data.visibility_level as string | null, viewContext);
    return {
      currencyUpper: cur,
      amountLabel: formatMoney(amt, cur),
      visibilityNote: vis,
      whenLabel: formatExactWhen(e.timestamp),
    };
  });
}

function buildValueLatestSummary(
  history: PublicProvenancePayload["valueHistory"]
): Array<{ currencyUpper: string; line: string }> {
  const latest = new Map<string, (typeof history)[number]>();
  for (const h of history) latest.set(h.currencyUpper, h);
  return [...latest.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, h]) => ({
      currencyUpper: h.currencyUpper,
      line: `${h.currencyUpper}: ${h.amountLabel}${
        h.visibilityNote ? ` (${h.visibilityNote})` : ""
      } · as of ${h.whenLabel}`,
    }));
}

function buildCollectorAcquisitionNote(
  events: ArtworkReplayWireEvent[],
  viewerUserId: string | null
): string | null {
  const v = normUuid(viewerUserId);
  if (!v) return null;
  let lastTs = -1;
  let lastWhen = "";
  for (const e of [...events].sort((a, b) => a.sortTs - b.sortTs)) {
    if (e.type !== "ownership") continue;
    const to = normUuid(e.data.to_user_id as string | null);
    if (to === v && e.sortTs >= lastTs) {
      lastTs = e.sortTs;
      lastWhen = e.timestamp;
    }
  }
  if (!lastWhen) return null;
  return `You acquired this work when ownership transferred to you on ${formatExactWhen(lastWhen)}.`;
}

function stateToDisplayLines(
  state: ReplayState,
  holders: Map<string, string>,
  viewContext: ProvenanceViewContext,
  viewerUserId: string | null
): PublicProvenancePayload["state"] {
  const oid = normUuid(state.current_owner_id);
  const viewer = normUuid(viewerUserId);
  const ownerLine =
    oid && viewContext === "collector" && viewer && oid === viewer
      ? "You (current owner)"
      : oid
        ? holders.get(oid) ?? "Private holder"
        : "Unassigned";
  const verificationLine =
    state.trust_tier === "verified"
      ? "Listed as verified in the current record"
      : state.trust_tier === "self_attested"
        ? "Self-attested in the current record"
        : "Not listed as verified in the current record";
  const valuesLines = Object.keys(state.value_by_currency)
    .sort()
    .map((c) => {
      const v = state.value_by_currency[c];
      return `${c.toUpperCase()}: ${formatMoney(Number(v), c)}`;
    });
  const live = state.certificates.filter((c) => !c.revoked);
  let certificateLine: string;
  if (state.certificates.length === 0) certificateLine = "No certificate on file";
  else if (live.length > 0) certificateLine = "Active certificate on file";
  else certificateLine = "Certificate withdrawn from file";
  return { ownerLine, verificationLine, valuesLines, certificateLine };
}

/**
 * Load sanitized provenance for a public page (replay-aligned; presentation varies by viewer).
 */
export async function getPublicProvenanceByRegistryId(
  registryId: string,
  options: ProvenanceViewerOptions = { viewerUserId: null }
): Promise<GetPublicProvenanceResult> {
  const clean = registryId.trim();
  if (!clean) return { kind: "not_found" };

  const privileged = serviceClient();
  const db = privileged ?? publicAnonClient();
  if (!db) return { kind: "not_found" };

  const ctxClient = privileged ?? options.viewerSupabase ?? publicAnonClient();
  if (!ctxClient) return { kind: "not_found" };

  const identityRow = await loadArtworkIdentity(db, clean);
  if (!identityRow) return { kind: "not_found" };

  const viewerUserId = options.viewerUserId ?? null;
  const viewContext = await resolveViewContext(
    ctxClient,
    viewerUserId,
    identityRow.artistGalleryId,
    identityRow.currentOwnerId
  );

  const artworkId = identityRow.id;
  const title = identityRow.title;
  const regId = identityRow.registryId;
  const createdAtLabel = identityRow.createdAtLabel;
  const artistName = identityRow.artistName;
  const artistSlug = identityRow.artistSlug;
  const createdAt = identityRow.createdAt;

  const replay = await getArtworkReplayData(db, artworkId, {
    valueVisibility: viewContext === "public" ? "public_surface" : "all",
  });
  if (!replay.ok) {
    return {
      kind: "limited",
      header: {
        title: identityRow.title,
        artistName: identityRow.artistName,
        artistSlug: identityRow.artistSlug,
        registryId: identityRow.registryId,
      },
    };
  }

  const userIds: string[] = [];
  for (const e of replay.data.events) {
    if (e.type === "ownership") {
      const to = e.data.to_user_id as string | null | undefined;
      const from = e.data.from_user_id as string | null | undefined;
      if (to) userIds.push(to);
      if (from) userIds.push(from);
    }
  }
  if (replay.data.meta.artist_id) userIds.push(replay.data.meta.artist_id);

  const sortedTimeline = sortEvents(
    timelineFromWire(replay.data.events),
    "full"
  );
  const authority = galleryAuthorityFromRecord(replay.data.galleryAuthority);
  const certMap = certRevokedMapFromRecord(replay.data.certRevokedById);
  const { state } = replayTimeline(sortedTimeline, authority, certMap, replay.data.meta);

  if (state.current_owner_id) userIds.push(state.current_owner_id);

  const holders = await holderLabelMap(
    db,
    userIds,
    replay.data.meta.artist_id,
    artistName,
    { viewerUserId, viewContext }
  );

  const galleries = await galleryNameMap(db, replay.data.events);

  const recordedEventCount = replay.data.events.length;
  const provenanceActivityEmpty = recordedEventCount === 0;

  const viewerGalleryIdNorm = normUuid(identityRow.artistGalleryId);
  const internal = buildInternalEntries({
    events: replay.data.events,
    holders,
    galleries,
    createdAt,
    artistDisplay: artistName,
    viewContext,
    viewerGalleryId: viewerGalleryIdNorm,
  });

  const timeline = provenanceActivityEmpty ? [] : groupEntries(internal);

  const valueHistory = buildValueHistory(replay.data.events, viewContext);
  const valueLatestByCurrency = buildValueLatestSummary(valueHistory);

  const encReg = encodeURIComponent(regId);
  const certificateHref = `/certificate/${encReg}`;
  const loginNextHref = `/login?next=${encodeURIComponent(certificateHref)}`;

  const liveCerts = state.certificates.filter((c) => !c.revoked);

  const ownershipChainLength = replay.data.ownershipRows.length;
  const integrity = computeRecordIntegrity({
    state,
    validation: replay.data.validation,
    events: replay.data.events,
    ownershipChainLength,
  });

  const hasConfirmedGalleryVerification = replay.data.events.some(
    (e) =>
      e.type === "verification" &&
      String(e.data.source || "").toLowerCase() === "gallery" &&
      String(e.data.status || "").toLowerCase() === "confirmed"
  );

  const gallerySurface =
    viewContext === "gallery" && identityRow.artistGallery
      ? {
          galleryName: identityRow.artistGallery.name,
          galleryVerified: identityRow.artistGallery.verified,
          artistRelationship: "represented" as const,
          verificationAuthorityLine: identityRow.artistGallery.verified
            ? "Your gallery is verified to attest works on the RROWM registry."
            : "Your gallery is not yet verified for registry attestations.",
          canMarkVerified:
            identityRow.artistGallery.verified && !hasConfirmedGalleryVerification,
          certificateContextLine: hasConfirmedGalleryVerification
            ? "Gallery attestation is on file; certificate status follows the full registry record."
            : "Certificate status reflects the registry record for this work.",
        }
      : undefined;

  const collectorSurface =
    viewContext === "collector"
      ? {
          acquisitionNote: buildCollectorAcquisitionNote(replay.data.events, viewerUserId),
        }
      : undefined;

  const certLabel =
    viewContext === "collector"
      ? "View your certificate"
      : "Certificate available";

  return {
    kind: "full",
    data: {
      header: {
        title,
        artistName,
        artistSlug,
        registryId: regId,
        createdAtLabel,
      },
      recordedEventCount,
      provenanceActivityEmpty,
      viewContext,
      artworkId,
      integrity,
      timeline,
      valueHistory,
      valueLatestByCurrency,
      collectorSurface,
      gallerySurface,
      state: stateToDisplayLines(state, holders, viewContext, viewerUserId),
      certificate: {
        showRow: liveCerts.length > 0,
        label: certLabel,
        href: certificateHref,
        loginNextHref,
      },
    },
  };
}
