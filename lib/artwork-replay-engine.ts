/**
 * Pure artwork replay logic — shared by Historical Replay Validator and Visual Replay Debugger.
 * No DB / Node-only imports; safe for client bundles.
 */

export const REPLAY_PERMUTATION_CAP = 48;

export type ReplayState = {
  current_owner_id: string | null;
  verification_status: "verified" | "unverified";
  value_by_currency: Record<string, number>;
  certificates: Array<{ id: string; revoked: boolean }>;
};

export type GalleryAuthority = Map<string, boolean>;

export type ArtworkMeta = {
  id: string;
  artist_id: string | null;
  registry_id: string | null;
};

export type TimelineEvent =
  | {
      kind: "ownership";
      ts: number;
      id: string;
      from_user_id: string | null;
      to_user_id: string | null;
    }
  | {
      kind: "value";
      ts: number;
      id: string;
      currency: string;
      declared_value: number;
    }
  | {
      kind: "verification";
      ts: number;
      id: string;
      source: string;
      source_id: string | null;
      status: string;
    }
  | {
      kind: "certificate_issue";
      ts: number;
      id: string;
      snapshot: unknown;
    }
  /** Audit-only / import markers — no replay state change. */
  | {
      kind: "system";
      ts: number;
      id: string;
    };

export type VerificationEvent = Extract<TimelineEvent, { kind: "verification" }>;

export function galleryAuthorityFromRecord(r: Record<string, boolean>): GalleryAuthority {
  const m: GalleryAuthority = new Map();
  for (const [k, v] of Object.entries(r)) {
    m.set(k.toLowerCase(), v);
  }
  return m;
}

export function galleryAuthorityToRecord(m: GalleryAuthority): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  for (const [k, v] of m) o[k] = v;
  return o;
}

export const INITIAL_REPLAY_STATE = (): ReplayState => ({
  current_owner_id: null,
  verification_status: "unverified",
  value_by_currency: {},
  certificates: [],
});

export function normUuid(u: string | null | undefined): string | null {
  if (u == null || String(u).trim() === "") return null;
  return String(u).toLowerCase();
}

export function verificationEventsConfirmedGallery(
  events: VerificationEvent[],
  authority: GalleryAuthority
): boolean {
  for (const e of events) {
    if (String(e.status).toLowerCase() !== "confirmed") continue;
    if (String(e.source).toLowerCase() !== "gallery") continue;
    const gid = normUuid(e.source_id);
    if (!gid) continue;
    if (authority.get(gid) === true) return true;
  }
  return false;
}

export function recomputeVerification(
  state: ReplayState,
  verApplied: VerificationEvent[],
  authority: GalleryAuthority
): void {
  const liveCert = state.certificates.some((c) => !c.revoked);
  if (liveCert) {
    state.verification_status = "verified";
    return;
  }
  state.verification_status = verificationEventsConfirmedGallery(verApplied, authority)
    ? "verified"
    : "unverified";
}

export function cloneReplayState(s: ReplayState): ReplayState {
  return {
    current_owner_id: s.current_owner_id,
    verification_status: s.verification_status,
    value_by_currency: { ...s.value_by_currency },
    certificates: s.certificates.map((c) => ({ ...c })),
  };
}

export function stateSignature(s: ReplayState): string {
  const cur = normUuid(s.current_owner_id);
  const vals = Object.keys(s.value_by_currency)
    .sort()
    .map((k) => `${k}:${s.value_by_currency[k]}`)
    .join("|");
  const certs = [...s.certificates]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((c) => `${c.id}:${c.revoked ? "1" : "0"}`)
    .join("|");
  return `${cur}|${s.verification_status}|${vals}|${certs}`;
}

export function sortEvents(
  events: TimelineEvent[],
  mode: "full" | "second_bucket"
): TimelineEvent[] {
  const out = [...events];
  if (mode === "full") {
    out.sort((a, b) => {
      if (a.ts !== b.ts) return a.ts - b.ts;
      return a.id.localeCompare(b.id);
    });
    return out;
  }
  const buckets = new Map<number, TimelineEvent[]>();
  for (const e of out) {
    const sec = Math.floor(e.ts / 1000);
    const arr = buckets.get(sec) ?? [];
    arr.push(e);
    buckets.set(sec, arr);
  }
  const keys = [...buckets.keys()].sort((x, y) => x - y);
  const merged: TimelineEvent[] = [];
  for (const k of keys) {
    const bucket = buckets.get(k)!;
    bucket.sort((a, b) => a.id.localeCompare(b.id));
    merged.push(...bucket);
  }
  return merged;
}

export function groupContiguousByTs(sorted: TimelineEvent[]): TimelineEvent[][] {
  const groups: TimelineEvent[][] = [];
  let i = 0;
  while (i < sorted.length) {
    const t = sorted[i].ts;
    const block: TimelineEvent[] = [];
    while (i < sorted.length && sorted[i].ts === t) {
      block.push(sorted[i]);
      i++;
    }
    groups.push(block);
  }
  return groups;
}

export function mergeContiguousGroups(groups: TimelineEvent[][]): TimelineEvent[] {
  return groups.flat();
}

export function generatePermutationsDeterministic(
  block: TimelineEvent[],
  cap: number
): TimelineEvent[][] {
  const n = block.length;
  if (n <= 1) return [[...block]];
  const sorted = [...block].sort((a, b) => a.id.localeCompare(b.id));
  if (n > 7) {
    const out: TimelineEvent[][] = [sorted, [...sorted].reverse()];
    for (let k = 1; k < n && out.length < cap; k++) {
      out.push([...sorted.slice(k), ...sorted.slice(0, k)]);
    }
    return out;
  }
  const out: TimelineEvent[][] = [];
  const used = new Array(n).fill(false);
  const current: TimelineEvent[] = [];

  function dfs() {
    if (out.length >= cap) return;
    if (current.length === n) {
      out.push([...current]);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(sorted[i]);
      dfs();
      current.pop();
      used[i] = false;
      if (out.length >= cap) return;
    }
  }
  dfs();
  if (out.length === 0) out.push([...sorted]);
  return out;
}

export function timelineWithPermutedGroup(
  groups: TimelineEvent[][],
  groupIndex: number,
  permuted: TimelineEvent[]
): TimelineEvent[] {
  const next = groups.map((g, i) => (i === groupIndex ? permuted : g));
  return mergeContiguousGroups(next);
}

function applyOwnershipOrValue(state: ReplayState, e: TimelineEvent): void {
  if (e.kind === "system") return;
  if (e.kind === "ownership") {
    const to = normUuid(e.to_user_id);
    if (to != null) state.current_owner_id = to;
    return;
  }
  if (e.kind === "value") {
    const c = String(e.currency || "").toUpperCase();
    if (c) state.value_by_currency[c] = Number(e.declared_value);
  }
}

function patchCertificateRevocation(state: ReplayState, byId: Map<string, boolean>): void {
  for (const c of state.certificates) {
    if (byId.get(c.id) === true) c.revoked = true;
  }
}

function finalizeRevocations(
  state: ReplayState,
  byId: Map<string, boolean>,
  verApplied: VerificationEvent[],
  authority: GalleryAuthority
): void {
  patchCertificateRevocation(state, byId);
  recomputeVerification(state, verApplied, authority);
}

export type ReplayTimelineOptions = {
  /** When false, skip applying final certificate revoked flags (mid-timeline previews). Default true. */
  applyFinalRevocationPatch?: boolean;
};

export function replayTimeline(
  sorted: TimelineEvent[],
  authority: GalleryAuthority,
  certRevokedById: Map<string, boolean>,
  meta: ArtworkMeta,
  options?: ReplayTimelineOptions
): { state: ReplayState; snapshot_errors: string[] } {
  const applyFinal = options?.applyFinalRevocationPatch !== false;
  const snapshot_errors: string[] = [];
  const verApplied: VerificationEvent[] = [];

  let state = INITIAL_REPLAY_STATE();

  for (const e of sorted) {
    if (e.kind === "certificate_issue") {
      const snap = e.snapshot;
      const o =
        snap && typeof snap === "object" && !Array.isArray(snap)
          ? (snap as Record<string, unknown>)
          : null;
      const aid = o?.artwork_id != null ? String(o.artwork_id).toLowerCase() : "";
      const arid = o?.artist_id != null ? String(o.artist_id).toLowerCase() : "";
      const own =
        o?.current_owner_id != null ? String(o.current_owner_id).toLowerCase() : "";

      const pre = cloneReplayState(state);

      if (aid && aid !== meta.id.toLowerCase()) {
        snapshot_errors.push(
          `certificate ${e.id}: snapshot.artwork_id ${aid} !== artwork ${meta.id}`
        );
      }
      if (arid && normUuid(meta.artist_id) && arid !== normUuid(meta.artist_id)) {
        snapshot_errors.push(
          `certificate ${e.id}: snapshot.artist_id ${arid} !== artworks.artist_id ${normUuid(meta.artist_id)}`
        );
      }
      const expectOwner = normUuid(pre.current_owner_id);
      if (own && expectOwner && own !== expectOwner) {
        snapshot_errors.push(
          `certificate ${e.id}: snapshot.current_owner_id ${own} !== replay owner at issuance ${expectOwner}`
        );
      }
      if (!own && expectOwner) {
        snapshot_errors.push(
          `certificate ${e.id}: snapshot missing current_owner_id (replay had ${expectOwner})`
        );
      }

      state.certificates.push({ id: e.id, revoked: false });
      recomputeVerification(state, verApplied, authority);
      continue;
    }

    if (e.kind === "verification") {
      verApplied.push(e);
      recomputeVerification(state, verApplied, authority);
      continue;
    }

    if (e.kind === "system") {
      continue;
    }

    applyOwnershipOrValue(state, e);
    recomputeVerification(state, verApplied, authority);
  }

  if (applyFinal) {
    finalizeRevocations(state, certRevokedById, verApplied, authority);
  }
  return { state, snapshot_errors };
}

/** Replay first `count` events from `sorted` (0 ≤ count ≤ sorted.length). */
export function replayPartial(
  sorted: TimelineEvent[],
  count: number,
  authority: GalleryAuthority,
  certRevokedById: Map<string, boolean>,
  meta: ArtworkMeta
): { state: ReplayState; snapshot_errors: string[] } {
  const slice = sorted.slice(0, Math.max(0, Math.min(count, sorted.length)));
  const atEnd = count >= sorted.length;
  return replayTimeline(slice, authority, certRevokedById, meta, {
    applyFinalRevocationPatch: atEnd,
  });
}

/** State immediately before event at `index` in `sorted` (index 0 = before first event). */
export function stateBeforeEventAtIndex(
  sorted: TimelineEvent[],
  index: number,
  authority: GalleryAuthority,
  certRevokedById: Map<string, boolean>,
  meta: ArtworkMeta
): ReplayState {
  return replayPartial(sorted, index, authority, certRevokedById, meta).state;
}

export function validateProvenanceAndChain(
  ownershipRows: Array<{
    id: string;
    from_user_id: string | null;
    to_user_id: string | null;
  }>,
  artistId: string | null,
  errors: string[]
): void {
  if (ownershipRows.length === 0) {
    errors.push("provenance: no ownership_events — first ownership row is required");
    return;
  }

  const first = ownershipRows[0];
  const firstTo = normUuid(first.to_user_id);
  const ar = normUuid(artistId);
  if (ar && firstTo !== ar) {
    errors.push(
      `provenance: first ownership_events.to_user_id (${firstTo}) !== artworks.artist_id (${ar})`
    );
  }

  let prevTo = normUuid(first.to_user_id);
  for (let i = 1; i < ownershipRows.length; i++) {
    const row = ownershipRows[i];
    const from = normUuid(row.from_user_id);
    const to = normUuid(row.to_user_id);
    if (from != null && prevTo != null && from !== prevTo) {
      errors.push(
        `ownership chain: event ${row.id} from_user_id ${from} !== previous to_user_id ${prevTo}`
      );
    }
    if (to != null) prevTo = to;
  }
}

export function validateValueDeterminism(events: TimelineEvent[], errors: string[]): void {
  const byKey = new Map<string, Set<number>>();
  for (const e of events) {
    if (e.kind !== "value") continue;
    const cur = String(e.currency || "").toUpperCase();
    if (!cur) continue;
    const key = `${e.ts}\n${cur}`;
    let set = byKey.get(key);
    if (!set) {
      set = new Set();
      byKey.set(key, set);
    }
    set.add(Number(e.declared_value));
  }
  for (const [key, vals] of byKey) {
    if (vals.size <= 1) continue;
    const nl = key.indexOf("\n");
    const ts = key.slice(0, nl);
    const cur = key.slice(nl + 1);
    errors.push(
      `value determinism: currency ${cur} at timestamp ${ts} has conflicting declared_value for same (timestamp, currency)`
    );
  }
}

/** True if canonical (ts, id) ordering and second-bucket ordering produce different final replay state. */
export function replayOutcomeDiffersForSecondBucketOrder(
  events: TimelineEvent[],
  authority: GalleryAuthority,
  certRevokedById: Map<string, boolean>,
  meta: ArtworkMeta
): boolean {
  const full = sortEvents(events, "full");
  const bucket = sortEvents(events, "second_bucket");
  const sa = stateSignature(
    replayTimeline(full, authority, certRevokedById, meta).state
  );
  const sb = stateSignature(
    replayTimeline(bucket, authority, certRevokedById, meta).state
  );
  return sa !== sb;
}

export function permutationChangesOutcome(
  sortedByTsId: TimelineEvent[],
  authority: GalleryAuthority,
  certRevokedById: Map<string, boolean>,
  meta: ArtworkMeta
): boolean {
  const groups = groupContiguousByTs(sortedByTsId);
  const canonical = mergeContiguousGroups(groups);
  const refSig = stateSignature(
    replayTimeline(canonical, authority, certRevokedById, meta).state
  );

  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    if (g.length <= 1) continue;
    const perms = generatePermutationsDeterministic(g, REPLAY_PERMUTATION_CAP);
    for (let pi = 0; pi < perms.length; pi++) {
      const candidate = timelineWithPermutedGroup(groups, gi, perms[pi]);
      const sig = stateSignature(
        replayTimeline(candidate, authority, certRevokedById, meta).state
      );
      if (sig !== refSig) return true;
    }
  }
  return false;
}

export function runPermutationDriftTests(
  sortedByTsId: TimelineEvent[],
  authority: GalleryAuthority,
  certRevokedById: Map<string, boolean>,
  meta: ArtworkMeta,
  mismatches: string[]
): boolean {
  const groups = groupContiguousByTs(sortedByTsId);
  const canonical = mergeContiguousGroups(groups);
  const refSig = stateSignature(
    replayTimeline(canonical, authority, certRevokedById, meta).state
  );

  let drift = false;
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    if (g.length <= 1) continue;
    const perms = generatePermutationsDeterministic(g, REPLAY_PERMUTATION_CAP);
    for (let pi = 0; pi < perms.length; pi++) {
      const candidate = timelineWithPermutedGroup(groups, gi, perms[pi]);
      const sig = stateSignature(
        replayTimeline(candidate, authority, certRevokedById, meta).state
      );
      if (sig !== refSig) {
        drift = true;
        mismatches.push(
          `permutation drift: timestamp ${g[0].ts} group size ${g.length} — permuted order ${pi} yields different final state than canonical (ts,id) order`
        );
        break;
      }
    }
  }
  return drift;
}

/** Build TimelineEvent[] from wire payload (client). */
export function simulateMonthlySpacing(events: TimelineEvent[]): TimelineEvent[] {
  if (events.length === 0) return [];
  const sorted = sortEvents(events, "full");
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  return sorted.map((e, i) => ({
    ...e,
    ts: Date.UTC(2020, 0, 1) + i * monthMs,
  }));
}

export function simulateJitteredSpacing(events: TimelineEvent[]): TimelineEvent[] {
  if (events.length === 0) return [];
  const sorted = sortEvents(events, "full");
  let acc = Date.UTC(2021, 0, 1);
  return sorted.map((e) => {
    let h = 0;
    for (let i = 0; i < e.id.length; i++) h = (h * 31 + e.id.charCodeAt(i)) >>> 0;
    const jitter = (h % 501) * 60 * 1000;
    acc += 9 * 24 * 60 * 60 * 1000 + jitter;
    return { ...e, ts: acc };
  });
}

export function timelineFromWire(
  events: Array<{
    id: string;
    type: string;
    sortTs: number;
    data: Record<string, unknown>;
  }>
): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  for (const e of events) {
    const ts = e.sortTs;
    switch (e.type) {
      case "ownership":
        out.push({
          kind: "ownership",
          ts,
          id: e.id,
          from_user_id: (e.data.from_user_id as string | null) ?? null,
          to_user_id: (e.data.to_user_id as string | null) ?? null,
        });
        break;
      case "value":
        out.push({
          kind: "value",
          ts,
          id: e.id,
          currency: String(e.data.currency ?? ""),
          declared_value: Number(e.data.declared_value ?? 0),
        });
        break;
      case "verification":
        out.push({
          kind: "verification",
          ts,
          id: e.id,
          source: String(e.data.source ?? ""),
          source_id: (e.data.source_id as string | null) ?? null,
          status: String(e.data.status ?? ""),
        });
        break;
      case "certificate":
        out.push({
          kind: "certificate_issue",
          ts,
          id: e.id,
          snapshot: e.data.snapshot,
        });
        break;
      case "system":
        out.push({
          kind: "system",
          ts,
          id: e.id,
        });
        break;
      default:
        break;
    }
  }
  return out;
}
