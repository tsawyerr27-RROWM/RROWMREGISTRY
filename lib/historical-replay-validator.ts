/**
 * Historical Replay Validator — audit-grade rebuild of registry truth from events.
 *
 * Env (CLI): REPLAY_ARTWORK_IDS=comma-separated uuids
 *
 * Pure replay logic lives in ./artwork-replay-engine.ts (shared with Visual Replay Debugger).
 */

import type { PoolClient } from "pg";
import { parseArtworkTrustTier } from "@/lib/artwork-trust-tier";
import type { ArtworkMeta, GalleryAuthority, TimelineEvent } from "./artwork-replay-engine";
import {
  normUuid,
  replayTimeline,
  runPermutationDriftTests,
  simulateJitteredSpacing,
  simulateMonthlySpacing,
  sortEvents,
  stateSignature,
  validateProvenanceAndChain,
  validateValueDeterminism,
} from "./artwork-replay-engine";

export type HistoricalReplayReport = {
  replay_pass: boolean;
  mismatches: string[];
  snapshot_errors: string[];
  drift_detected: boolean;
  warnings: string[];
};

async function hasCertificatesRevokedAtColumn(client: PoolClient): Promise<boolean> {
  const { rows } = await client.query<{ ok: boolean }>(
    `
    select exists(
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'certificates'
        and column_name = 'revoked_at'
    ) as ok
    `
  );
  return rows[0]?.ok === true;
}

async function collectTimeline(
  client: PoolClient,
  artworkId: string
): Promise<{
  events: TimelineEvent[];
  certRevokedById: Map<string, boolean>;
  ownershipRows: Array<{
    id: string;
    from_user_id: string | null;
    to_user_id: string | null;
    created_at: Date;
  }>;
}> {
  const certRevokedById = new Map<string, boolean>();

  const { rows: oe } = await client.query<{
    id: string;
    from_user_id: string | null;
    to_user_id: string | null;
    created_at: Date;
  }>(
    `
    select id::text, from_user_id::text, to_user_id::text, created_at
    from public.ownership_events
    where artwork_id = $1::uuid
    order by created_at asc, id asc
    `,
    [artworkId]
  );

  const { rows: ve } = await client.query<{
    id: string;
    declared_value: string | number | null;
    currency: string | null;
    created_at: Date;
  }>(
    `
    select id::text, declared_value, currency, created_at
    from public.value_events
    where artwork_id = $1::uuid
    order by created_at asc, id asc
    `,
    [artworkId]
  );

  const { rows: ver } = await client.query<{
    id: string;
    source: string;
    source_id: string | null;
    status: string;
    created_at: Date;
  }>(
    `
    select id::text, source, source_id::text, status, created_at
    from public.verification_events
    where artwork_id = $1::uuid
    order by created_at asc, id asc
    `,
    [artworkId]
  );

  const { rows: ce } = await client.query<{
    id: string;
    issued_at: Date | null;
    created_at: Date;
    revoked: boolean | null;
    certificate_snapshot: unknown;
  }>(
    `
    select
      id::text,
      issued_at,
      created_at,
      coalesce(revoked, false) as revoked,
      certificate_snapshot
    from public.certificates
    where artwork_id = $1::uuid
    order by coalesce(issued_at, created_at) asc, id asc
    `,
    [artworkId]
  );

  const events: TimelineEvent[] = [];

  for (const r of oe) {
    events.push({
      kind: "ownership",
      ts: r.created_at.getTime(),
      id: r.id,
      from_user_id: r.from_user_id,
      to_user_id: r.to_user_id,
    });
  }
  for (const r of ve) {
    events.push({
      kind: "value",
      ts: r.created_at.getTime(),
      id: r.id,
      currency: String(r.currency || ""),
      declared_value: Number(r.declared_value ?? 0),
    });
  }
  for (const r of ver) {
    events.push({
      kind: "verification",
      ts: r.created_at.getTime(),
      id: r.id,
      source: r.source,
      source_id: r.source_id,
      status: r.status,
    });
  }
  for (const r of ce) {
    certRevokedById.set(r.id, r.revoked === true);
    const t = (r.issued_at ?? r.created_at).getTime();
    events.push({
      kind: "certificate_issue",
      ts: t,
      id: r.id,
      snapshot: r.certificate_snapshot,
    });
  }

  return { events, certRevokedById, ownershipRows: oe };
}

async function loadArtworkMeta(
  client: PoolClient,
  artworkId: string
): Promise<ArtworkMeta | null> {
  const { rows } = await client.query<{
    id: string;
    artist_id: string | null;
    registry_id: string | null;
  }>(
    `
    select id::text, artist_id::text, registry_id
    from public.artworks
    where id = $1::uuid
    `,
    [artworkId]
  );
  if (!rows.length) return null;
  return rows[0];
}

async function loadGalleryAuthority(
  client: PoolClient,
  artworkId: string
): Promise<GalleryAuthority> {
  const { rows } = await client.query<{ id: string; verified: boolean | null }>(
    `
    select distinct g.id::text, g.verified
    from public.verification_events ve
    join public.galleries g on g.id = ve.source_id
    where ve.artwork_id = $1::uuid
      and ve.source = 'gallery'
    `,
    [artworkId]
  );
  const m: GalleryAuthority = new Map();
  for (const r of rows) {
    m.set(r.id.toLowerCase(), r.verified === true);
  }
  const { rows: rows2 } = await client.query<{ id: string; verified: boolean | null }>(
    `
    select g.id::text, g.verified
    from public.artworks a
    join public.artists ar on ar.id = a.artist_id
    join public.galleries g on g.id = ar.gallery_id
    where a.id = $1::uuid
    `,
    [artworkId]
  );
  for (const r of rows2) {
    const k = r.id.toLowerCase();
    if (!m.has(k)) m.set(k, r.verified === true);
  }
  return m;
}

async function hasGalleryVerificationEvents(
  client: PoolClient,
  artworkId: string
): Promise<boolean> {
  const { rows } = await client.query<{ n: number }>(
    `
    select count(*)::int as n
    from public.verification_events
    where artwork_id = $1::uuid
      and source = 'gallery'
    `,
    [artworkId]
  );
  return (rows[0]?.n ?? 0) > 0;
}

async function fetchDbLatestValues(
  client: PoolClient,
  artworkId: string
): Promise<Record<string, number>> {
  const { rows } = await client.query<{
    currency: string;
    declared_value: string | number | null;
  }>(
    `
    select distinct on (upper(trim(coalesce(currency, ''))))
      upper(trim(coalesce(currency, ''))) as currency,
      declared_value
    from public.value_events
    where artwork_id = $1::uuid
      and trim(coalesce(currency, '')) <> ''
    order by upper(trim(coalesce(currency, ''))), created_at desc, id desc
    `,
    [artworkId]
  );
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (!r.currency) continue;
    out[r.currency] = Number(r.declared_value ?? 0);
  }
  return out;
}

async function validateCertificateSnapshotDuplicates(
  client: PoolClient,
  artworkId: string,
  errors: string[]
): Promise<void> {
  const { rows } = await client.query<{ c: number; snap: string | null }>(
    `
    select count(*)::int as c, certificate_snapshot::text as snap
    from public.certificates
    where artwork_id = $1::uuid
      and coalesce(revoked, false) = false
      and certificate_snapshot is not null
    group by certificate_snapshot
    having count(*) > 1
    `,
    [artworkId]
  );
  for (const r of rows) {
    errors.push(
      `certificates: ${r.c} live rows share identical certificate_snapshot (potential unintended duplicate)`
    );
  }
}

type OneArtworkResult = {
  replay_pass: boolean;
  mismatches: string[];
  snapshot_errors: string[];
  drift_detected: boolean;
  warnings: string[];
};

async function validateOneArtwork(
  client: PoolClient,
  artworkId: string,
  authority: GalleryAuthority
): Promise<OneArtworkResult> {
  const mismatches: string[] = [];
  const snapshot_errors: string[] = [];
  const warnings: string[] = [];

  const meta = await loadArtworkMeta(client, artworkId);
  if (!meta) {
    return {
      replay_pass: false,
      mismatches: [`artwork ${artworkId} not found`],
      snapshot_errors: [],
      drift_detected: false,
      warnings,
    };
  }

  if (await hasGalleryVerificationEvents(client, artworkId)) {
    warnings.push(
      "Verification depends on mutable external state (galleries.verified)"
    );
  }

  const { events, certRevokedById, ownershipRows } = await collectTimeline(
    client,
    artworkId
  );

  validateProvenanceAndChain(ownershipRows, meta.artist_id, mismatches);
  validateValueDeterminism(events, mismatches);
  await validateCertificateSnapshotDuplicates(client, artworkId, mismatches);

  const sortedFull = sortEvents(events, "full");
  const sortedBucket = sortEvents(events, "second_bucket");

  const r1 = replayTimeline(sortedFull, authority, certRevokedById, meta);
  const r2 = replayTimeline(sortedBucket, authority, certRevokedById, meta);
  let drift_detected = stateSignature(r1.state) !== stateSignature(r2.state);

  const permDrift = runPermutationDriftTests(
    sortedFull,
    authority,
    certRevokedById,
    meta,
    mismatches
  );
  if (permDrift) drift_detected = true;

  const spaced = simulateMonthlySpacing(events);
  const r3 = replayTimeline(
    sortEvents(spaced, "full"),
    authority,
    certRevokedById,
    meta
  );
  if (stateSignature(r1.state) !== stateSignature(r3.state)) {
    mismatches.push(
      "time simulation: replay diverged after month spacing (final state must not depend on absolute timestamps)"
    );
  }

  const jittered = simulateJitteredSpacing(events);
  const r4 = replayTimeline(
    sortEvents(jittered, "full"),
    authority,
    certRevokedById,
    meta
  );
  if (stateSignature(r1.state) !== stateSignature(r4.state)) {
    mismatches.push(
      "time simulation: replay diverged after jittered gaps — logic must not depend on tight timing"
    );
  }

  snapshot_errors.push(...r1.snapshot_errors);

  const { rows: aw } = await client.query<{
    co: string | null;
    vs: string | null;
  }>(
    `
    select current_owner_id::text, verification_status::text
    from public.artworks
    where id = $1::uuid
    `,
    [artworkId]
  );

  const dbOwner = normUuid(aw[0]?.co ?? null);
  const dbTier = parseArtworkTrustTier(aw[0]?.vs ?? null);
  const rpOwner = normUuid(r1.state.current_owner_id);
  const rpTier = r1.state.trust_tier;

  if (dbOwner !== rpOwner) {
    mismatches.push(
      `current_owner_id: db=${dbOwner ?? "null"} replay=${rpOwner ?? "null"} (exactly one canonical owner expected)`
    );
  }
  if (dbTier !== rpTier) {
    mismatches.push(
      `trust_tier: db=${dbTier} replay=${rpTier} — event-derived vs cache`
    );
  }

  const dbVals = await fetchDbLatestValues(client, artworkId);
  for (const c of Object.keys({ ...dbVals, ...r1.state.value_by_currency })) {
    const a = r1.state.value_by_currency[c];
    const b = dbVals[c];
    if (a === undefined && b === undefined) continue;
    if (a === undefined || b === undefined || Number(a) !== Number(b)) {
      mismatches.push(
        `value tail currency ${c}: replay=${a ?? "∅"} db_latest=${b ?? "∅"}`
      );
    }
  }

  return {
    replay_pass:
      mismatches.length === 0 &&
      snapshot_errors.length === 0 &&
      !drift_detected,
    mismatches,
    snapshot_errors,
    drift_detected,
    warnings,
  };
}

async function validateBatchRegistryIds(
  client: PoolClient,
  artworkIds: string[],
  mismatches: string[]
): Promise<void> {
  if (artworkIds.length < 2) return;
  const { rows } = await client.query<{ registry_id: string; n: number }>(
    `
    select registry_id, count(*)::int as n
    from public.artworks
    where id = any($1::uuid[])
      and registry_id is not null
      and trim(registry_id) <> ''
    group by registry_id
    having count(*) > 1
    `,
    [artworkIds]
  );
  for (const r of rows) {
    if (r.registry_id)
      mismatches.push(
        `system invariant: registry_id ${r.registry_id} maps to ${r.n} artworks in this batch`
      );
  }
}

/**
 * Run historical replay validation for one or more artworks (isolated state per id).
 */
export async function runHistoricalReplayValidator(
  client: PoolClient,
  artworkIds: string[]
): Promise<HistoricalReplayReport> {
  const ids = [...new Set(artworkIds.map((x) => x.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return {
      replay_pass: false,
      mismatches: ["no artwork ids provided"],
      snapshot_errors: [],
      drift_detected: false,
      warnings: [],
    };
  }

  const revocationTimeAuditable = await hasCertificatesRevokedAtColumn(client);

  const allM: string[] = [];
  const allS: string[] = [];
  const allW: string[] = [];
  let drift = false;
  let pass = true;

  const batchM: string[] = [];
  await validateBatchRegistryIds(client, ids, batchM);
  for (const m of batchM) allM.push(m);
  if (batchM.length) pass = false;

  if (!revocationTimeAuditable) {
    allW.push(
      "Certificates have no revoked_at column — revocation is not fully time-auditable"
    );
  }

  for (const id of ids) {
    const authority = await loadGalleryAuthority(client, id);
    const r = await validateOneArtwork(client, id, authority);
    const prefix = `[${id}] `;
    if (!r.replay_pass) pass = false;
    if (r.drift_detected) drift = true;
    for (const m of r.mismatches) allM.push(prefix + m);
    for (const s of r.snapshot_errors) allS.push(prefix + s);
    for (const w of r.warnings) allW.push(prefix + w);
  }

  return {
    replay_pass: pass,
    mismatches: allM,
    snapshot_errors: allS,
    drift_detected: drift,
    warnings: allW,
  };
}
