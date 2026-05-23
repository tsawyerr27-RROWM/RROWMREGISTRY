/**
 * Server: load artwork + event timeline for Visual Replay Debugger (admin/service role).
 */

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArtworkMeta, GalleryAuthority, TimelineEvent } from "./artwork-replay-engine";
import {
  galleryAuthorityToRecord,
  groupContiguousByTs,
  normUuid,
  permutationChangesOutcome,
  replayOutcomeDiffersForSecondBucketOrder,
  replayTimeline,
  sortEvents,
  validateProvenanceAndChain,
  validateValueDeterminism,
} from "./artwork-replay-engine";

function isPublicSurfaceValueVisibility(visibility: string | null | undefined): boolean {
  return (
    visibility == null ||
    visibility === "" ||
    visibility === "public" ||
    visibility === "certificate"
  );
}

/** When RLS blocks direct `certificates` reads (e.g. anon key), RPC + synth row preserves replay shape. */
function syntheticCertificateRowForPublicRead(
  artworkId: string,
  createdAtIso: string | null,
  revoked: boolean
) {
  const base =
    createdAtIso && !Number.isNaN(new Date(createdAtIso).getTime())
      ? createdAtIso
      : new Date().toISOString();
  const h = createHash("sha256").update(`rrowm:synth-cert:${artworkId}`).digest();
  const hex = Buffer.from(h.subarray(0, 16)).toString("hex");
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-8${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
  return {
    id,
    issued_at: base,
    created_at: base,
    revoked,
    certificate_snapshot: null as unknown,
  };
}

export type GetArtworkReplayDataOptions = {
  /** When `public_surface`, only value events visible on public surfaces are included in replay. */
  valueVisibility?: "all" | "public_surface";
};

export type ArtworkReplayWireEvent = {
  id: string;
  type: "ownership" | "value" | "verification" | "certificate" | "system";
  timestamp: string;
  sortTs: number;
  data: Record<string, unknown>;
};

export type ArtworkReplayValidation = {
  mismatches: string[];
  snapshot_errors: string[];
  eventIssues: Record<string, string[]>;
  warnings: string[];
  drift_detected: boolean;
  ordering_ambiguous: boolean;
};

export type ArtworkReplayData = {
  artwork: {
    id: string;
    registry_id: string | null;
    title: string | null;
    artist_id: string | null;
    artist_label: string | null;
    created_at: string | null;
    /** DB cache only — not used as replay source of truth in the UI. */
    db_cache: {
      current_owner_id: string | null;
      verification_status: string | null;
    };
  };
  events: ArtworkReplayWireEvent[];
  galleryAuthority: Record<string, boolean>;
  certRevokedById: Record<string, boolean>;
  ownershipRows: Array<{
    id: string;
    from_user_id: string | null;
    to_user_id: string | null;
  }>;
  meta: ArtworkMeta;
  validation: ArtworkReplayValidation;
};

function pushIssue(map: Record<string, string[]>, eventId: string, msg: string): void {
  if (!map[eventId]) map[eventId] = [];
  if (!map[eventId].includes(msg)) map[eventId].push(msg);
}

function snapshotErrorToCertId(msg: string): string | null {
  const m = /^certificate ([0-9a-f-]{36}):/i.exec(msg);
  return m ? m[1].toLowerCase() : null;
}

async function loadGalleryAuthoritySupabase(
  admin: SupabaseClient,
  artworkId: string
): Promise<GalleryAuthority> {
  const m: GalleryAuthority = new Map();

  const { data: gv } = await admin
    .from("verification_events")
    .select("source_id")
    .eq("artwork_id", artworkId)
    .eq("source", "gallery");

  const gids = [...new Set((gv ?? []).map((r) => r.source_id).filter(Boolean))] as string[];
  if (gids.length) {
    const { data: galleries } = await admin.from("galleries").select("id, verified").in("id", gids);
    for (const g of galleries ?? []) {
      m.set(String(g.id).toLowerCase(), g.verified === true);
    }
  }

  const { data: row } = await admin
    .from("artworks")
    .select("artist_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (row?.artist_id) {
    const { data: ar } = await admin
      .from("artists")
      .select("gallery_id")
      .eq("id", row.artist_id)
      .maybeSingle();
    if (ar?.gallery_id) {
      const { data: g } = await admin
        .from("galleries")
        .select("id, verified")
        .eq("id", ar.gallery_id)
        .maybeSingle();
      if (g?.id) {
        const k = String(g.id).toLowerCase();
        if (!m.has(k)) m.set(k, g.verified === true);
      }
    }
  }

  return m;
}

/**
 * Load merged, sorted replay payload + validation hints for one artwork.
 */
export async function getArtworkReplayData(
  admin: SupabaseClient,
  artworkId: string,
  options?: GetArtworkReplayDataOptions
): Promise<{ ok: true; data: ArtworkReplayData } | { ok: false; error: string }> {
  const { data: aw, error: awErr } = await admin
    .from("artworks")
    .select("id, registry_id, title, artist_id, created_at, current_owner_id, verification_status")
    .eq("id", artworkId)
    .maybeSingle();

  if (awErr || !aw) {
    return { ok: false, error: awErr?.message || "Artwork not found" };
  }

  let artistLabel: string | null = null;
  if (aw.artist_id) {
    const { data: ar } = await admin.from("artists").select("slug").eq("id", aw.artist_id).maybeSingle();
    artistLabel = (ar?.slug as string | undefined)?.trim() || String(aw.artist_id);
  }

  const meta: ArtworkMeta = {
    id: String(aw.id),
    artist_id: aw.artist_id ? String(aw.artist_id) : null,
    registry_id: aw.registry_id ? String(aw.registry_id) : null,
  };

  const { data: oeRaw, error: oeErr } = await admin
    .from("ownership_events")
    .select("id, from_user_id, to_user_id, created_at")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (oeErr) return { ok: false, error: oeErr.message };

  const { data: veRaw, error: veErr } = await admin
    .from("value_events")
    .select("id, declared_value, currency, created_at, visibility_level, value_type")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (veErr) return { ok: false, error: veErr.message };

  const { data: verRaw, error: verErr } = await admin
    .from("verification_events")
    .select("id, source, source_id, status, created_at")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (verErr) return { ok: false, error: verErr.message };

  const { data: ceRaw, error: ceErr } = await admin
    .from("certificates")
    .select("id, issued_at, created_at, revoked, certificate_snapshot")
    .eq("artwork_id", artworkId);

  let ceSorted: Array<{
    id: string;
    issued_at: unknown;
    created_at: unknown;
    revoked: boolean;
    certificate_snapshot: unknown;
  }>;

  if (ceErr) {
    const { data: certRpc, error: rpcErr } = await admin.rpc(
      "get_certificate_public_status_single",
      { p_artwork_id: artworkId }
    );
    if (rpcErr) {
      ceSorted = [];
    } else {
      const row = Array.isArray(certRpc) ? certRpc[0] : certRpc;
      const hasCert =
        row &&
        typeof row === "object" &&
        "has_certificate" in row &&
        (row as { has_certificate?: boolean }).has_certificate === true;
      if (hasCert) {
        const revoked = (row as { revoked?: boolean }).revoked === true;
        ceSorted = [
          syntheticCertificateRowForPublicRead(
            artworkId,
            aw.created_at != null ? String(aw.created_at) : null,
            revoked
          ),
        ];
      } else {
        ceSorted = [];
      }
    }
  } else {
    ceSorted = [...(ceRaw ?? [])].sort((a, b) => {
      const ta = new Date((a.issued_at ?? a.created_at) as string).getTime();
      const tb = new Date((b.issued_at ?? b.created_at) as string).getTime();
      if (ta !== tb) return ta - tb;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  const certRevokedById = new Map<string, boolean>();
  const events: TimelineEvent[] = [];

  const ownershipRows = (oeRaw ?? []).map((r) => ({
    id: String(r.id),
    from_user_id: r.from_user_id != null ? String(r.from_user_id) : null,
    to_user_id: r.to_user_id != null ? String(r.to_user_id) : null,
    created_at: new Date(r.created_at as string),
  }));

  for (const r of ownershipRows) {
    events.push({
      kind: "ownership",
      ts: r.created_at.getTime(),
      id: r.id,
      from_user_id: r.from_user_id,
      to_user_id: r.to_user_id,
    });
  }

  for (const r of veRaw ?? []) {
    if (options?.valueVisibility === "public_surface") {
      const vis = (r as { visibility_level?: string | null }).visibility_level;
      if (!isPublicSurfaceValueVisibility(vis)) continue;
    }
    const d = new Date(r.created_at as string);
    events.push({
      kind: "value",
      ts: d.getTime(),
      id: String(r.id),
      currency: String(r.currency ?? ""),
      declared_value: Number(r.declared_value ?? 0),
    });
  }

  for (const r of verRaw ?? []) {
    const d = new Date(r.created_at as string);
    events.push({
      kind: "verification",
      ts: d.getTime(),
      id: String(r.id),
      source: String(r.source ?? ""),
      source_id: r.source_id != null ? String(r.source_id) : null,
      status: String(r.status ?? ""),
    });
  }

  for (const r of ceSorted) {
    const id = String(r.id);
    certRevokedById.set(id, r.revoked === true);
    const issued = r.issued_at ? new Date(r.issued_at as string) : null;
    const created = new Date(r.created_at as string);
    const t = (issued ?? created).getTime();
    events.push({
      kind: "certificate_issue",
      ts: t,
      id,
      snapshot: r.certificate_snapshot,
    });
  }

  const sorted = sortEvents(events, "full");

  const valueMetaById = new Map<string, { visibility_level: string | null; value_type: string | null }>();
  for (const r of veRaw ?? []) {
    valueMetaById.set(String(r.id), {
      visibility_level:
        (r as { visibility_level?: string | null }).visibility_level != null
          ? String((r as { visibility_level?: string | null }).visibility_level)
          : null,
      value_type:
        (r as { value_type?: string | null }).value_type != null
          ? String((r as { value_type?: string | null }).value_type)
          : null,
    });
  }

  const wireEvents: ArtworkReplayWireEvent[] = sorted.map((e) => {
    const iso = new Date(e.ts).toISOString();
    if (e.kind === "ownership") {
      return {
        id: e.id,
        type: "ownership" as const,
        timestamp: iso,
        sortTs: e.ts,
        data: {
          from_user_id: e.from_user_id,
          to_user_id: e.to_user_id,
        },
      };
    }
    if (e.kind === "value") {
      const meta = valueMetaById.get(e.id);
      return {
        id: e.id,
        type: "value" as const,
        timestamp: iso,
        sortTs: e.ts,
        data: {
          currency: e.currency,
          declared_value: e.declared_value,
          visibility_level: meta?.visibility_level ?? null,
          value_type: meta?.value_type ?? null,
        },
      };
    }
    if (e.kind === "verification") {
      return {
        id: e.id,
        type: "verification" as const,
        timestamp: iso,
        sortTs: e.ts,
        data: {
          source: e.source,
          source_id: e.source_id,
          status: e.status,
        },
      };
    }
    if (e.kind === "certificate_issue") {
      return {
        id: e.id,
        type: "certificate" as const,
        timestamp: iso,
        sortTs: e.ts,
        data: {
          snapshot: e.snapshot,
          revoked: certRevokedById.get(e.id) === true,
        },
      };
    }
    if (e.kind === "system") {
      return {
        id: e.id,
        type: "system" as const,
        timestamp: iso,
        sortTs: e.ts,
        data: {},
      };
    }
    const _never: never = e;
    return _never;
  });

  const authority = await loadGalleryAuthoritySupabase(admin, artworkId);

  const mismatches: string[] = [];
  const snapshot_errors: string[] = [];
  const warnings: string[] = [];
  const eventIssues: Record<string, string[]> = {};

  validateProvenanceAndChain(ownershipRows, meta.artist_id, mismatches);
  if (mismatches.some((m) => m.startsWith("provenance:")) && ownershipRows[0]) {
    pushIssue(eventIssues, ownershipRows[0].id, "Provenance / first ownership issue");
  }
  for (const m of mismatches) {
    if (m.startsWith("ownership chain:")) {
      const mid = m.match(/event ([0-9a-f-]{36})/i)?.[1];
      if (mid) pushIssue(eventIssues, mid.toLowerCase(), m);
    }
  }

  validateValueDeterminism(events, mismatches);
  const valueConflicts = new Map<string, Set<string>>();
  for (const e of events) {
    if (e.kind !== "value") continue;
    const cur = String(e.currency || "").toUpperCase();
    if (!cur) continue;
    const key = `${e.ts}\n${cur}`;
    if (!valueConflicts.has(key)) valueConflicts.set(key, new Set());
    valueConflicts.get(key)!.add(e.id);
  }
  for (const m of mismatches) {
    if (!m.startsWith("value determinism:")) continue;
    for (const ids of valueConflicts.values()) {
      if (ids.size > 1) {
        for (const vid of ids) pushIssue(eventIssues, vid, m);
      }
    }
  }

  const r1 = replayTimeline(sorted, authority, certRevokedById, meta);
  snapshot_errors.push(...r1.snapshot_errors);
  for (const msg of snapshot_errors) {
    const cid = snapshotErrorToCertId(msg);
    if (cid) pushIssue(eventIssues, cid, msg);
  }

  const dbOwner = normUuid(aw.current_owner_id as string | null);
  const dbVs = String(aw.verification_status || "unverified").toLowerCase();
  const rpOwner = normUuid(r1.state.current_owner_id);
  const rpVs = r1.state.verification_status;
  if (dbOwner !== rpOwner) {
    mismatches.push(
      `current_owner_id: db=${dbOwner ?? "null"} replay=${rpOwner ?? "null"}`
    );
  }
  if (dbVs !== rpVs) {
    mismatches.push(`verification_status: db=${aw.verification_status} replay=${rpVs}`);
  }

  const drift_second =
    replayOutcomeDiffersForSecondBucketOrder(events, authority, certRevokedById, meta);
  const drift_perm = permutationChangesOutcome(sorted, authority, certRevokedById, meta);
  const drift_detected = drift_second || drift_perm;
  const ordering_ambiguous = drift_detected;

  if (ordering_ambiguous) {
    const msg =
      "Ordering affects replay outcome — tie timestamps are ambiguous under alternate orderings";
    const groups = groupContiguousByTs(sorted);
    for (const g of groups) {
      if (g.length <= 1) continue;
      for (const ev of g) pushIssue(eventIssues, ev.id, msg);
    }
  }

  const { count: gveCount } = await admin
    .from("verification_events")
    .select("id", { count: "exact", head: true })
    .eq("artwork_id", artworkId)
    .eq("source", "gallery");

  if ((gveCount ?? 0) > 0) {
    warnings.push("Verification depends on mutable external state (galleries.verified)");
  }

  if (!ceErr) {
    const { data: snapDup } = await admin
      .from("certificates")
      .select("certificate_snapshot, revoked")
      .eq("artwork_id", artworkId);

    const snapKeyCount = new Map<string, number>();
    for (const r of snapDup ?? []) {
      if (r.revoked === true) continue;
      const k = JSON.stringify(r.certificate_snapshot);
      snapKeyCount.set(k, (snapKeyCount.get(k) ?? 0) + 1);
    }
    for (const [, n] of snapKeyCount) {
      if (n > 1) {
        mismatches.push(
          "certificates: multiple live rows share identical certificate_snapshot"
        );
        break;
      }
    }
  }

  return {
    ok: true,
    data: {
      artwork: {
        id: meta.id,
        registry_id: meta.registry_id,
        title: aw.title != null ? String(aw.title) : null,
        artist_id: meta.artist_id,
        artist_label: artistLabel,
        created_at: aw.created_at != null ? String(aw.created_at) : null,
        db_cache: {
          current_owner_id: aw.current_owner_id != null ? String(aw.current_owner_id) : null,
          verification_status:
            aw.verification_status != null ? String(aw.verification_status) : null,
        },
      },
      events: wireEvents,
      galleryAuthority: galleryAuthorityToRecord(authority),
      certRevokedById: Object.fromEntries(certRevokedById),
      ownershipRows: ownershipRows.map(({ id, from_user_id, to_user_id }) => ({
        id,
        from_user_id,
        to_user_id,
      })),
      meta,
      validation: {
        mismatches,
        snapshot_errors,
        eventIssues,
        warnings,
        drift_detected,
        ordering_ambiguous,
      },
    },
  };
}
