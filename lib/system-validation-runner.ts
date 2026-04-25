/**
 * Deterministic system validation for RROWM registry (no UI).
 *
 * Direct Postgres URI (Supabase `postgres` role): DATABASE_URL or VALIDATION_DATABASE_URL.
 *
 * Required for flows:
 *   VALIDATION_ARTIST_USER_ID, VALIDATION_GALLERY_USER_ID, VALIDATION_SECOND_OWNER_USER_ID
 *
 * Input-driven (optional defaults):
 *   VALIDATION_DECLARED_VALUE, VALIDATION_CURRENCY, VALIDATION_VALUE_TYPE, VALIDATION_VISIBILITY_LEVEL
 *   VALIDATION_ARTWORK_YEAR, VALIDATION_ARTWORK_MEDIUM, VALIDATION_ARTWORK_DIMENSIONS,
 *   VALIDATION_ARTWORK_DESCRIPTION, VALIDATION_ARTWORK_TITLE (else auto-generated)
 *   VALIDATION_CONCURRENCY_DECLARED_VALUE — second value for concurrent value_events test (default: declared + 1)
 *
 * Flags:
 *   VALIDATION_SKIP_FLOWS=1
 *   VALIDATION_ROLLBACK=1 — single-client transaction; concurrency tests skipped (other pool conns cannot see uncommitted rows)
 *   VALIDATION_STRICT_REPRODUCIBILITY=1 — missing RPC names in supabase/migrations → FAIL gate
 *   VALIDATION_CHAIN_ARTWORK_ID — optional artwork uuid for ownership-only path
 *
 * Hardening / RLS probes (production guarantees):
 *   VALIDATION_NON_OWNER_USER_ID — uuid (auth.users) who is not current owner; used for ownership_events insert denial
 *   VALIDATION_GALLERY_STAFF_USER_ID — gallery member with role staff; galleries row update must not succeed for staff
 *   VALIDATION_STRICT_RLS=1 — FAIL if table-level RLS cannot be exercised (session role bypasses RLS)
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Pool, PoolClient } from "pg";

export const REQUIRED_RPC_NAMES = [
  "register_artwork_atomic",
  "add_value_event",
  "gallery_verify_artwork",
  "issue_certificate_for_verified_artwork",
  "compute_artwork_verification_status",
  "get_current_owner",
  "generate_certificate_hash",
  "verify_certificate",
] as const;

export type RequiredRpcName = (typeof REQUIRED_RPC_NAMES)[number];

export type RpcExistenceResult = {
  missing: string[];
  present: string[];
};

export type SchemaCheckResult = {
  pass: boolean;
  issues: string[];
};

export type RpcDefinedInRepo = Record<RequiredRpcName, boolean>;

export type FlowName =
  | "artwork_lifecycle"
  | "idempotency_register"
  | "concurrency"
  | "ownership_chain";

export type FlowResult = {
  name: FlowName;
  pass: boolean;
  errors: string[];
};

export type HardeningSection = {
  pass: boolean;
  errors: string[];
  skipped?: boolean;
  skip_reason?: string;
};

export type HardeningReport = {
  event_ordering: HardeningSection;
  ownership_duplication: HardeningSection;
  certificate_immutability: HardeningSection;
  registry_guarantees: HardeningSection;
  rls_permissions: HardeningSection;
  atomicity_register: HardeningSection;
  pass: boolean;
};

export type ValidationFlowContext = {
  artworkId?: string;
  registryId?: string;
  /** registry_id as returned by public.artworks after registration (authoritative). */
  registryIdFromDb?: string;
  metadataHash?: string;
  title?: string;
  /** certificate_snapshot::text at issuance; must not change after ownership transfers. */
  certificateSnapshotFrozen?: string;
  galleryIdForArtist?: string;
  registerArgs?: {
    artistId: string;
    title: string;
    year: string;
    medium: string;
    dimensions: string;
    description: string;
    imageUrl: string | null;
    registryId: string;
    metadataHash: string;
  };
};

export type ValidationInputs = {
  declaredValue: number;
  currency: string;
  valueType: string;
  visibilityLevel: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  concurrencyDeclaredValue: number;
};

export type SystemValidationReport = {
  warnings: string[];
  rpc_defined_in_repo: RpcDefinedInRepo;
  rpc_reproducibility_pass: boolean;
  rpc_check: { pass: boolean; missing: string[]; present: string[] };
  schema_check: SchemaCheckResult;
  flows: {
    artwork_lifecycle: FlowResult;
    idempotency_register: FlowResult;
    concurrency: FlowResult;
    ownership_chain: FlowResult;
  };
  integrity: { pass: boolean; report: unknown; errors: string[] };
  hardening: HardeningReport;
  pass: boolean;
  failure_reasons: string[];
};

function readValidationInputs(): ValidationInputs {
  const declaredRaw = process.env.VALIDATION_DECLARED_VALUE?.trim() ?? "1000";
  const declaredValue = Number(declaredRaw);
  if (!Number.isFinite(declaredValue)) {
    throw new Error(`VALIDATION_DECLARED_VALUE must be a number, got: ${declaredRaw}`);
  }
  const currency = (
    process.env.VALIDATION_CURRENCY?.trim() || "USD"
  ).toUpperCase();
  if (!currency) throw new Error("VALIDATION_CURRENCY is empty");

  const valueType = process.env.VALIDATION_VALUE_TYPE?.trim() || "initial";
  const visibilityLevel =
    process.env.VALIDATION_VISIBILITY_LEVEL?.trim() || "private";
  const year = process.env.VALIDATION_ARTWORK_YEAR?.trim() || "2026";
  const medium = process.env.VALIDATION_ARTWORK_MEDIUM?.trim() || "medium";
  const dimensions =
    process.env.VALIDATION_ARTWORK_DIMENSIONS?.trim() || "10x10";
  const description =
    process.env.VALIDATION_ARTWORK_DESCRIPTION?.trim() || "validation";

  let concurrencyDeclared: number;
  if (process.env.VALIDATION_CONCURRENCY_DECLARED_VALUE?.trim()) {
    concurrencyDeclared = Number(
      process.env.VALIDATION_CONCURRENCY_DECLARED_VALUE.trim()
    );
    if (!Number.isFinite(concurrencyDeclared)) {
      throw new Error("VALIDATION_CONCURRENCY_DECLARED_VALUE must be a number");
    }
  } else {
    concurrencyDeclared = declaredValue + 1;
  }

  return {
    declaredValue,
    currency,
    valueType,
    visibilityLevel,
    year,
    medium,
    dimensions,
    description,
    concurrencyDeclaredValue: concurrencyDeclared,
  };
}

function buildFailureReasons(
  r: Omit<SystemValidationReport, "pass" | "failure_reasons">
): string[] {
  const reasons: string[] = [];
  if (!r.rpc_check.pass) {
    reasons.push(`FAIL: missing RPCs: ${r.rpc_check.missing.join(", ")}`);
  }
  if (!r.rpc_reproducibility_pass) {
    reasons.push(
      `FAIL reproducibility (VALIDATION_STRICT_REPRODUCIBILITY=1): RPC(s) absent from repo migrations: ${REQUIRED_RPC_NAMES.filter((n) => !r.rpc_defined_in_repo[n]).join(", ")}`
    );
  }
  if (!r.schema_check.pass) {
    reasons.push(...r.schema_check.issues.map((i) => `FAIL schema: ${i}`));
  }
  for (const f of Object.values(r.flows)) {
    if (!f.pass) {
      reasons.push(`FAIL flow ${f.name}: ${f.errors.join(" | ")}`);
    }
  }
  if (!r.integrity.pass) {
    reasons.push(...r.integrity.errors.map((e) => `FAIL integrity: ${e}`));
  }
  if (!r.hardening.pass) {
    const sections: (keyof HardeningReport)[] = [
      "event_ordering",
      "ownership_duplication",
      "certificate_immutability",
      "registry_guarantees",
      "rls_permissions",
      "atomicity_register",
    ];
    for (const key of sections) {
      const s = r.hardening[key];
      if (s && typeof s === "object" && "pass" in s && !(s as HardeningSection).pass) {
        const sec = s as HardeningSection;
        const label = sec.skipped ? `${key} (skipped)` : key;
        reasons.push(
          `FAIL hardening ${label}: ${sec.errors.join(" | ") || "check failed"}`
        );
      }
    }
  }
  return reasons;
}

function checkRpcDefinedInRepo(): RpcDefinedInRepo {
  const out = Object.fromEntries(
    REQUIRED_RPC_NAMES.map((n) => [n, false])
  ) as RpcDefinedInRepo;

  const migrationsDir = path.resolve(process.cwd(), "supabase", "migrations");
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".sql"))
      .map((d) => path.join(migrationsDir, d.name));
  } catch {
    return out;
  }

  for (const file of files) {
    let txt = "";
    try {
      txt = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const rpc of REQUIRED_RPC_NAMES) {
      if (out[rpc]) continue;
      if (txt.includes(rpc)) out[rpc] = true;
    }
  }

  return out;
}

function isRegistryIdValid(registryId: string | null | undefined): boolean {
  if (!registryId) return false;
  return registryId.startsWith("RROWM-");
}

async function currentSessionBypassesRls(client: PoolClient): Promise<boolean> {
  const { rows } = await client.query<{ b: boolean | null }>(
    `select rolbypassrls as b from pg_roles where rolname = current_user`
  );
  return rows[0]?.b === true;
}

async function verifyDeterministicEventOrdering(
  client: Pick<PoolClient, "query">,
  artworkId: string,
  table: "value_events" | "ownership_events",
  errors: string[],
  label: string
): Promise<void> {
  const { rows: r1 } = await client.query<{ id: string | null }>(
    `
    select id::text
    from public.${table}
    where artwork_id = $1::uuid
    order by created_at desc nulls last
    limit 1
    `,
    [artworkId]
  );
  const { rows: r2 } = await client.query<{ id: string | null }>(
    `
    select id::text
    from public.${table}
    where artwork_id = $1::uuid
    order by created_at desc nulls last, id desc
    limit 1
    `,
    [artworkId]
  );
  const idTs = r1[0]?.id ?? null;
  const idTie = r2[0]?.id ?? null;
  if (idTs !== idTie) {
    errors.push(
      `${label}: ambiguous "latest" — order by created_at desc (${idTs}) ≠ deterministic (created_at, id) (${idTie})`
    );
  }
  const { rows: ties } = await client.query<{ n: number }>(
    `
    with mx as (
      select max(created_at) as m from public.${table} where artwork_id = $1::uuid
    )
    select count(*)::int as n
    from public.${table}, mx
    where artwork_id = $1::uuid
      and created_at is not distinct from mx.m
    `,
    [artworkId]
  );
  const tieCount = ties[0]?.n ?? 0;
  if (tieCount > 1) {
    errors.push(
      `${label}: ${tieCount} rows share max(created_at) — timestamp-only ordering is ambiguous (requires id tie-break)`
    );
  }
}

async function verifyOwnershipDuplicateKeyGroups(
  client: Pick<PoolClient, "query">,
  artworkId: string,
  errors: string[]
): Promise<void> {
  const { rows } = await client.query<{ c: number }>(
    `
    select count(*)::int as c
    from (
      select 1
      from public.ownership_events
      where artwork_id = $1::uuid
      group by artwork_id, from_user_id, to_user_id, created_at
      having count(*) > 1
    ) d
    `,
    [artworkId]
  );
  if ((rows[0]?.c ?? 0) > 0) {
    errors.push(
      "ownership_events: duplicate rows for same (from_user_id, to_user_id, created_at) — concurrency must not double-insert"
    );
  }
}

async function verifyRegistryGuaranteesFromDb(
  client: Pick<PoolClient, "query">,
  ctx: ValidationFlowContext,
  errors: string[]
): Promise<void> {
  const artworkId = ctx.artworkId;
  const baseline = ctx.registryIdFromDb;
  if (!artworkId) {
    errors.push("registry: missing artwork id");
    return;
  }
  if (!baseline) {
    errors.push("registry: missing registryIdFromDb baseline");
    return;
  }
  const { rows } = await client.query<{
    registry_id: string | null;
  }>(
    `select registry_id from public.artworks where id = $1::uuid`,
    [artworkId]
  );
  const rid = rows[0]?.registry_id ?? null;
  if (!rid) {
    errors.push("registry: artworks.registry_id is null");
    return;
  }
  if (!isRegistryIdValid(rid)) {
    errors.push(`registry: format invalid (expected RROWM-*): ${rid}`);
  }
  if (rid !== baseline) {
    errors.push(`registry: immutability violated — was ${baseline}, now ${rid}`);
  }
  const { rows: cnt } = await client.query<{ n: number }>(
    `select count(*)::int as n from public.artworks where registry_id = $1`,
    [rid]
  );
  if ((cnt[0]?.n ?? 0) !== 1) {
    errors.push(`registry: uniqueness failed — ${cnt[0]?.n ?? 0} rows for registry_id ${rid}`);
  }
}

async function runRegisterAtomicFailureProbe(
  client: PoolClient,
  inputs: ValidationInputs
): Promise<HardeningSection> {
  const errors: string[] = [];
  const badArtist = "00000000-0000-0000-0000-000000000097";
  const fakeRegistry = `RROWM-VAL-FAIL-${createHash("sha256")
    .update(`${Date.now()}:${Math.random()}`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase()}`;

  const { rows: o0 } = await client.query<{ n: number }>(
    `
    select count(*)::int as n
    from public.ownership_events o
    where not exists (select 1 from public.artworks a where a.id = o.artwork_id)
    `
  );
  const orphansBefore = o0[0]?.n ?? 0;

  let threw = false;
  try {
    await setJwtSub(client, badArtist);
    await callRegisterAtomic(client, {
      artistId: badArtist,
      title: "validation atomicity probe",
      year: inputs.year,
      medium: inputs.medium,
      dimensions: inputs.dimensions,
      description: "probe",
      imageUrl: null,
      registryId: fakeRegistry,
      metadataHash: metadataHashPayload(badArtist, "validation atomicity probe"),
    });
  } catch {
    threw = true;
  } finally {
    await setJwtSub(client, null);
  }

  if (!threw) {
    errors.push(
      "register_artwork_atomic with non-existent artist id was expected to fail but succeeded"
    );
  }

  const { rows: cArt } = await client.query<{ n: number }>(
    `select count(*)::int as n from public.artworks where registry_id = $1`,
    [fakeRegistry]
  );
  if ((cArt[0]?.n ?? 0) !== 0) {
    errors.push(
      `partial create: artwork row exists for registry_id ${fakeRegistry} after failed register`
    );
  }

  const { rows: o1 } = await client.query<{ n: number }>(
    `
    select count(*)::int as n
    from public.ownership_events o
    where not exists (select 1 from public.artworks a where a.id = o.artwork_id)
    `
  );
  const orphansAfter = o1[0]?.n ?? 0;
  if (orphansAfter > orphansBefore) {
    errors.push(
      `partial create: orphan ownership_events increased (${orphansBefore} -> ${orphansAfter}) after failed register`
    );
  }

  return { pass: errors.length === 0, errors };
}

async function runRlsPermissionProbes(
  client: PoolClient,
  opts: {
    artworkId: string;
    artistId: string;
    galleryId: string;
    currentOwnerForChain: string;
    secondOwnerUserId: string;
  },
  warnings: string[]
): Promise<HardeningSection> {
  const errors: string[] = [];
  const strictRls = process.env.VALIDATION_STRICT_RLS === "1";
  const bypass = await currentSessionBypassesRls(client);
  let tableProbesSkipped = false;

  let artistVerifySucceeded = false;
  try {
    await setJwtSub(client, opts.artistId);
    await client.query(`select public.gallery_verify_artwork($1::uuid)`, [
      opts.artworkId,
    ]);
    artistVerifySucceeded = true;
  } catch {
    /* expected */
  }
  if (artistVerifySucceeded) {
    errors.push(
      "artist JWT could call gallery_verify_artwork — expected Not authorized for gallery verification"
    );
  }

  if (bypass) {
    tableProbesSkipped = true;
    const msg =
      "current database role bypasses RLS — galleries UPDATE and ownership_events INSERT probes were not exercised";
    if (strictRls) {
      errors.push(msg);
    } else {
      warnings.push(`hardening: ${msg}`);
    }
  } else {
    const staffId = process.env.VALIDATION_GALLERY_STAFF_USER_ID?.trim();
    if (staffId) {
      const { rows: st } = await client.query<{ role: string }>(
        `
        select gu.role::text as role
        from public.gallery_users gu
        where gu.user_id = $1::uuid and gu.gallery_id = $2::uuid
        `,
        [staffId, opts.galleryId]
      );
      if (!st.length) {
        warnings.push(
          "VALIDATION_GALLERY_STAFF_USER_ID is not in gallery_users for this gallery — staff UPDATE probe skipped"
        );
      } else if (String(st[0].role).toLowerCase() !== "staff") {
        warnings.push(
          `VALIDATION_GALLERY_STAFF_USER_ID role is "${st[0].role}" (expected staff) — probe skipped`
        );
      } else {
        await setJwtSub(client, staffId);
        const up = await client.query(
          `update public.galleries set name = name where id = $1::uuid`,
          [opts.galleryId]
        );
        if ((up.rowCount ?? 0) > 0) {
          errors.push(
            "non-admin gallery user updated galleries row (policy should restrict to admin)"
          );
        }
      }
    } else {
      warnings.push(
        "Set VALIDATION_GALLERY_STAFF_USER_ID (staff gallery_users.role) to validate gallery profile UPDATE denial"
      );
    }

    const nonOwner = process.env.VALIDATION_NON_OWNER_USER_ID?.trim();
    if (nonOwner) {
      await setJwtSub(client, nonOwner);
      let insOk = false;
      try {
        await client.query(
          `
          insert into public.ownership_events (
            artwork_id, transfer_type, from_user_id, to_user_id, created_at
          ) values (
            $1::uuid, 'transfer', $2::uuid, $3::uuid, now()
          )
          `,
          [opts.artworkId, opts.currentOwnerForChain, opts.secondOwnerUserId]
        );
        insOk = true;
      } catch {
        /* expected */
      }
      if (insOk) {
        errors.push(
          "non-owner JWT inserted ownership_events while impersonating non-current-owner (expected denial)"
        );
      }
    } else {
      warnings.push(
        "Set VALIDATION_NON_OWNER_USER_ID to validate ownership_events insert denial for non-owner"
      );
    }
  }

  await setJwtSub(client, null);

  return {
    pass: errors.length === 0,
    errors,
    skipped: tableProbesSkipped && !strictRls,
    skip_reason: tableProbesSkipped && !strictRls ? "RLS bypass role" : undefined,
  };
}

async function hasVerifyCertificateUuid(client: PoolClient): Promise<boolean> {
  const { rows } = await client.query<{ ok: boolean }>(
    `
    select exists(
      select 1
      from pg_proc p
      join pg_namespace n on p.pronamespace = n.oid
      where n.nspname = 'public'
        and p.proname = 'verify_certificate'
        and pg_get_function_identity_arguments(p.oid) = 'p_certificate_id uuid'
    ) as ok
    `
  );
  return Boolean(rows[0]?.ok);
}

export async function check_required_rpcs(client: PoolClient): Promise<RpcExistenceResult> {
  const { rows } = await client.query<{ proname: string }>(
    `
    select distinct p.proname::text as proname
    from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public'
      and p.proname = any($1::text[])
    `,
    [REQUIRED_RPC_NAMES as unknown as string[]]
  );
  const presentSet = new Set(rows.map((r) => r.proname));
  const present = REQUIRED_RPC_NAMES.filter((n) => presentSet.has(n)) as string[];
  const missing = REQUIRED_RPC_NAMES.filter((n) => !presentSet.has(n)) as string[];
  return { missing, present };
}

async function checkTables(client: PoolClient, issues: string[]): Promise<void> {
  const tables = [
    "artworks",
    "ownership_events",
    "value_events",
    "certificates",
    "verification_events",
    "galleries",
    "gallery_users",
    "artists",
  ];
  const { rows } = await client.query<{ t: string }>(
    `
    select table_name as t
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any($1::text[])
    `,
    [tables]
  );
  const have = new Set(rows.map((r) => r.t));
  for (const t of tables) {
    if (!have.has(t)) issues.push(`missing table public.${t}`);
  }
}

async function checkColumns(client: PoolClient, issues: string[]): Promise<void> {
  const required: { table: string; column: string }[] = [
    { table: "artworks", column: "current_owner_id" },
    { table: "artworks", column: "verification_status" },
    { table: "ownership_events", column: "to_user_id" },
    { table: "value_events", column: "currency" },
  ];
  for (const { table, column } of required) {
    const { rows } = await client.query(
      `
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = $1
        and column_name = $2
      limit 1
      `,
      [table, column]
    );
    if (rows.length === 0) issues.push(`missing column public.${table}.${column}`);
  }
}

async function checkTriggers(client: PoolClient, issues: string[]): Promise<void> {
  const required: { name: string; on: string }[] = [
    { name: "trg_ownership_events_sync_current_owner", on: "ownership_events" },
    { name: "trg_certificates_refresh_artwork_verified", on: "certificates" },
  ];
  for (const { name, on } of required) {
    const { rows } = await client.query(
      `
      select 1
      from pg_trigger t
      join pg_class c on t.tgrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      where n.nspname = 'public'
        and c.relname = $1
        and not t.tgisinternal
        and t.tgname = $2
      limit 1
      `,
      [on, name]
    );
    if (rows.length === 0) {
      issues.push(`missing trigger ${name} on public.${on}`);
    }
  }
}

export async function check_schema_dependencies(client: PoolClient): Promise<SchemaCheckResult> {
  const issues: string[] = [];
  await checkTables(client, issues);
  await checkColumns(client, issues);
  await checkTriggers(client, issues);
  return { pass: issues.length === 0, issues };
}

async function setJwtSub(client: PoolClient, userId: string | null): Promise<void> {
  if (userId) {
    await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
  } else {
    await client.query(`select set_config('request.jwt.claim.sub', '', true)`);
  }
}

function metadataHashPayload(artistId: string, title: string): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        artist_id: artistId,
        title,
        validation_runner: true,
        t: Date.now(),
      })
    )
    .digest("hex");
}

function asSnapshotObject(snap: unknown): Record<string, unknown> | null {
  if (snap && typeof snap === "object" && !Array.isArray(snap)) {
    return snap as Record<string, unknown>;
  }
  return null;
}

function validateCertificateSnapshot(
  snap: unknown,
  expected: {
    artworkId: string;
    artistId: string;
    ownerAtIssuance: string;
  },
  errors: string[]
): void {
  const o = asSnapshotObject(snap);
  if (!o) {
    errors.push("certificate_snapshot is not a JSON object");
    return;
  }

  const aid = o.artwork_id != null ? String(o.artwork_id) : "";
  if (aid !== expected.artworkId) {
    errors.push(
      `snapshot.artwork_id mismatch: expected ${expected.artworkId} got ${aid || "(missing)"}`
    );
  }

  const arid = o.artist_id != null ? String(o.artist_id) : "";
  if (arid !== expected.artistId) {
    errors.push(
      `snapshot.artist_id mismatch: expected ${expected.artistId} got ${arid || "(missing)"}`
    );
  }

  const ownerSnap =
    o.current_owner_id != null ? String(o.current_owner_id) : "";
  if (!ownerSnap) {
    errors.push("snapshot.current_owner_id missing");
  } else if (ownerSnap !== expected.ownerAtIssuance) {
    errors.push(
      `snapshot.current_owner_id mismatch vs canonical owner at issuance: expected ${expected.ownerAtIssuance} got ${ownerSnap}`
    );
  }

  if (o.issued_at == null || String(o.issued_at).trim() === "") {
    errors.push("snapshot.issued_at missing (timestamp required)");
  }
}

async function assertCrossEntityConsistency(
  client: Pick<PoolClient, "query">,
  artworkId: string,
  certSnapshotOwner: string | null,
  expectedOwner: string,
  errors: string[]
): Promise<void> {
  const { rows: arows } = await client.query<{ co: string | null }>(
    `select current_owner_id::text as co from public.artworks where id = $1::uuid`,
    [artworkId]
  );
  const cached = arows[0]?.co ?? null;

  const { rows: grow } = await client.query<{ o: string | null }>(
    `select public.get_current_owner($1::uuid)::text as o`,
    [artworkId]
  );
  const computed = grow[0]?.o ?? null;

  const { rows: oe } = await client.query<{ to: string | null }>(
    `
    select to_user_id::text as to
    from public.ownership_events
    where artwork_id = $1::uuid
    order by created_at desc nulls last, id desc
    limit 1
    `,
    [artworkId]
  );
  const latestTo = oe[0]?.to ?? null;

  if (cached !== expectedOwner) {
    errors.push(
      `cross-entity: artworks.current_owner_id ${cached} !== expected ${expectedOwner}`
    );
  }
  if (computed !== expectedOwner) {
    errors.push(
      `cross-entity: get_current_owner ${computed} !== expected ${expectedOwner}`
    );
  }
  if (latestTo !== expectedOwner) {
    errors.push(
      `cross-entity: latest ownership_events.to_user_id ${latestTo} !== expected ${expectedOwner}`
    );
  }
  if (certSnapshotOwner != null && certSnapshotOwner !== expectedOwner) {
    errors.push(
      `cross-entity: certificate snapshot owner ${certSnapshotOwner} !== expected ${expectedOwner}`
    );
  }
}

async function callRegisterAtomic(
  client: PoolClient,
  args: NonNullable<ValidationFlowContext["registerArgs"]>
) {
  await setJwtSub(client, args.artistId);
  return client.query(
    `
    select * from public.register_artwork_atomic(
      p_artist_id := $1::uuid,
      p_title := $2,
      p_year := $3,
      p_medium := $4,
      p_dimensions := $5,
      p_description := $6,
      p_image_url := $7,
      p_registry_id := $8,
      p_metadata_hash := $9
    )
    `,
    [
      args.artistId,
      args.title,
      args.year,
      args.medium,
      args.dimensions,
      args.description,
      args.imageUrl,
      args.registryId,
      args.metadataHash,
    ]
  );
}

async function resolveArtworkIdFromRegister(
  client: PoolClient,
  reg: { rows: unknown[] },
  registryId: string
): Promise<string | null> {
  const row0 = reg.rows[0] as { id?: string } | undefined;
  let artworkId = row0?.id as string | undefined;
  if (!artworkId) {
    const { rows: byReg } = await client.query<{ id: string }>(
      `select id from public.artworks where registry_id = $1 limit 1`,
      [registryId]
    );
    artworkId = byReg[0]?.id;
  }
  return artworkId ?? null;
}

async function assertPostRegisterInvariants(
  client: PoolClient,
  artworkId: string,
  artistId: string,
  registryId: string,
  errors: string[],
  ctx?: ValidationFlowContext
): Promise<void> {
  const { rows: awRows } = await client.query<{
    id: string;
    artist_id: string | null;
    registry_id: string | null;
    metadata_hash: string | null;
    current_owner_id: string | null;
  }>(
    `
    select
      id,
      artist_id::text,
      registry_id,
      metadata_hash,
      current_owner_id::text
    from public.artworks
    where id = $1::uuid
    `,
    [artworkId]
  );
  if (!awRows.length) {
    errors.push("artwork row not found after register_artwork_atomic");
    return;
  }

  const aw = awRows[0];
  if (!aw.registry_id) errors.push("artworks.registry_id is null");
  if (ctx && aw.registry_id) ctx.registryIdFromDb = aw.registry_id;
  if (!isRegistryIdValid(aw.registry_id)) {
    errors.push(
      `artworks.registry_id invalid format (expected prefix RROWM-): ${aw.registry_id}`
    );
  }
  if (aw.registry_id !== registryId) {
    errors.push(`registry_id mismatch: expected ${registryId}, got ${aw.registry_id}`);
  }
  if (!aw.metadata_hash) errors.push("artworks.metadata_hash is null");
  if (aw.artist_id !== artistId) {
    errors.push(`artworks.artist_id mismatch: expected ${artistId}, got ${aw.artist_id}`);
  }

  const { rows: oeCount } = await client.query<{ n: number }>(
    `select count(*)::int as n from public.ownership_events where artwork_id = $1::uuid`,
    [artworkId]
  );
  if ((oeCount[0]?.n ?? 0) < 1) {
    errors.push("ownership_events has 0 rows for newly registered artwork");
  }

  const { rows: oeLatest } = await client.query<{ to_user_id: string | null }>(
    `
    select to_user_id::text
    from public.ownership_events
    where artwork_id = $1::uuid
    order by created_at desc nulls last, id desc
    limit 1
    `,
    [artworkId]
  );
  const latestTo = oeLatest[0]?.to_user_id ?? null;
  if (latestTo !== artistId) {
    errors.push(
      `latest ownership_events.to_user_id mismatch: expected ${artistId}, got ${latestTo}`
    );
  }
  if (aw.current_owner_id !== artistId) {
    errors.push(
      `artworks.current_owner_id mismatch: expected ${artistId}, got ${aw.current_owner_id}`
    );
  }
}

async function runIdempotencyRegisterFlow(
  client: PoolClient,
  ctx: ValidationFlowContext,
  args: NonNullable<ValidationFlowContext["registerArgs"]>
): Promise<FlowResult> {
  const errors: string[] = [];
  const artworkId = ctx.artworkId;
  const registryId = ctx.registryId;
  if (!artworkId || !registryId) {
    errors.push("idempotency: missing artworkId/registryId from first register");
    return { name: "idempotency_register", pass: false, errors };
  }

  const { rows: beforeCount } = await client.query<{ n: number; roots: number }>(
    `
    select
      (select count(*)::int from public.artworks where registry_id = $1) as n,
      (select count(*)::int from public.ownership_events where artwork_id = $2::uuid) as roots
    `,
    [registryId, artworkId]
  );
  const artworksByRegBefore = beforeCount[0]?.n ?? 0;
  const oeBefore = beforeCount[0]?.roots ?? 0;

  if (artworksByRegBefore !== 1) {
    errors.push(
      `idempotency precheck: expected exactly 1 artwork for registry_id, got ${artworksByRegBefore}`
    );
    return { name: "idempotency_register", pass: false, errors };
  }

  let secondOk = false;
  try {
    await callRegisterAtomic(client, args);
    secondOk = true;
  } catch {
    secondOk = false;
  }

  const { rows: after } = await client.query<{
    art_count: number;
    distinct_art_ids: number;
    oe_count: number;
  }>(
    `
    select
      (select count(*)::int from public.artworks where registry_id = $1) as art_count,
      (select count(distinct id)::int from public.artworks where registry_id = $1) as distinct_art_ids,
      (select count(*)::int from public.ownership_events where artwork_id = $2::uuid) as oe_count
    `,
    [registryId, artworkId]
  );

  const artCount = after[0]?.art_count ?? 0;
  const distinctIds = after[0]?.distinct_art_ids ?? 0;
  const oeAfter = after[0]?.oe_count ?? 0;

  if (artCount !== 1 || distinctIds !== 1) {
    errors.push(
      `idempotency: expected exactly one artwork row per registry_id (count=${artCount}, distinct_ids=${distinctIds})`
    );
  }
  const { rows: idCheck } = await client.query<{ id: string }>(
    `select id::text from public.artworks where registry_id = $1 limit 2`,
    [registryId]
  );
  if (idCheck.length !== 1 || idCheck[0]?.id !== artworkId) {
    errors.push(
      `idempotency: registry_id must resolve only to artwork ${artworkId}, got ${JSON.stringify(idCheck.map((r) => r.id))}`
    );
  }
  if (oeAfter < oeBefore) {
    errors.push(
      `idempotency: ownership_events count decreased (${oeBefore} -> ${oeAfter})`
    );
  }
  if (secondOk && oeAfter > oeBefore) {
    errors.push(
      `idempotency: second register succeeded but added extra ownership row(s) (${oeBefore} -> ${oeAfter}) — duplicate ownership root risk`
    );
  }
  if (!secondOk && oeAfter > oeBefore) {
    errors.push(
      `idempotency: second register failed yet ownership_event count increased (${oeBefore} -> ${oeAfter})`
    );
  }

  return { name: "idempotency_register", pass: errors.length === 0, errors };
}

async function runConcurrencyValueEvents(
  pool: Pool,
  artistId: string,
  artworkId: string,
  inputs: ValidationInputs
): Promise<FlowResult> {
  const errors: string[] = [];
  const c1 = await pool.connect();
  const c2 = await pool.connect();
  try {
    const p1 = (async () => {
      await setJwtSub(c1, artistId);
      return c1.query(
        `
        select * from public.add_value_event(
          p_artwork_id := $1::uuid,
          p_declared_value := $2,
          p_currency := $3,
          p_value_type := $4,
          p_visibility_level := $5,
          p_note := 'validation runner concurrent A'
        )
        `,
        [
          artworkId,
          inputs.declaredValue,
          inputs.currency,
          inputs.valueType,
          inputs.visibilityLevel,
        ]
      );
    })();
    const p2 = (async () => {
      await setJwtSub(c2, artistId);
      return c2.query(
        `
        select * from public.add_value_event(
          p_artwork_id := $1::uuid,
          p_declared_value := $2,
          p_currency := $3,
          p_value_type := $4,
          p_visibility_level := $5,
      p_note := 'validation runner concurrent B'
        )
        `,
        [
          artworkId,
          inputs.concurrencyDeclaredValue,
          inputs.currency,
          inputs.valueType,
          inputs.visibilityLevel,
        ]
      );
    })();
    const results = await Promise.allSettled([p1, p2]);
    const rejected = results.filter((r) => r.status === "rejected");
    if (rejected.length === 2) {
      errors.push("concurrency: both add_value_event calls failed");
    }

    const { rows: latest } = await pool.query<{
      declared_value: number | null;
      currency: string | null;
    }>(
      `
      select declared_value, currency
      from public.value_events
      where artwork_id = $1::uuid
      order by created_at desc nulls last, id desc
      limit 1
      `,
      [artworkId]
    );
    const lastVal = Number(latest[0]?.declared_value);
    const lastCur = (latest[0]?.currency || "").toUpperCase();
    const allowed = new Set([inputs.declaredValue, inputs.concurrencyDeclaredValue]);
    if (!Number.isFinite(lastVal) || !allowed.has(lastVal)) {
      errors.push(
        `concurrency: latest value_events.declared_value unexpected: ${lastVal} (allowed ${[...allowed].join(", ")})`
      );
    }
    if (lastCur !== inputs.currency) {
      errors.push(
        `concurrency: latest value_events.currency mismatch: ${lastCur} vs ${inputs.currency}`
      );
    }

    const { rows: tot } = await pool.query<{ n: number }>(
      `select count(*)::int as n from public.value_events where artwork_id = $1::uuid`,
      [artworkId]
    );
    if ((tot[0]?.n ?? 0) < 3) {
      errors.push(
        `concurrency: expected primary + 2 concurrent value_events (>=3 rows), got ${tot[0]?.n ?? 0}`
      );
    }
    const { rows: cntPrimary } = await pool.query<{ n: number }>(
      `
      select count(*)::int as n from public.value_events
      where artwork_id = $1::uuid
        and declared_value::numeric = $2::numeric
        and upper(trim(coalesce(currency,''))) = $3
      `,
      [artworkId, inputs.declaredValue, inputs.currency]
    );
    const { rows: cntAlt } = await pool.query<{ n: number }>(
      `
      select count(*)::int as n from public.value_events
      where artwork_id = $1::uuid
        and declared_value::numeric = $2::numeric
        and upper(trim(coalesce(currency,''))) = $3
      `,
      [artworkId, inputs.concurrencyDeclaredValue, inputs.currency]
    );
    if ((cntPrimary[0]?.n ?? 0) < 2) {
      errors.push(
        `concurrency: expected >=2 value rows with declared_value=${inputs.declaredValue} (primary + concurrent), got ${cntPrimary[0]?.n ?? 0}`
      );
    }
    if ((cntAlt[0]?.n ?? 0) < 1) {
      errors.push(
        `concurrency: expected >=1 value row with declared_value=${inputs.concurrencyDeclaredValue}, got ${cntAlt[0]?.n ?? 0}`
      );
    }

    const { rows: own } = await pool.query<{ co: string | null; g: string | null }>(
      `
      select
        a.current_owner_id::text as co,
        public.get_current_owner($1::uuid)::text as g
      from public.artworks a
      where a.id = $1::uuid
      `,
      [artworkId]
    );
    if (own[0]?.co !== own[0]?.g) {
      errors.push(
        `concurrency: ownership drift after value events: cache ${own[0]?.co} vs get_current_owner ${own[0]?.g}`
      );
    }
  } finally {
    c1.release();
    c2.release();
  }
  return { name: "concurrency", pass: errors.length === 0, errors };
}

async function runConcurrencyOwnershipEvents(
  pool: Pool,
  artworkId: string,
  fromUser: string,
  toUser: string
): Promise<void> {
  const c1 = await pool.connect();
  const c2 = await pool.connect();
  try {
    await Promise.allSettled([
      (async () => {
        return c1.query(
          `
          insert into public.ownership_events (
            artwork_id, transfer_type, from_user_id, to_user_id, created_at
          ) values (
            $1::uuid, 'transfer', $2::uuid, $3::uuid, now()
          )
          `,
          [artworkId, fromUser, toUser]
        );
      })(),
      (async () => {
        return c2.query(
          `
          insert into public.ownership_events (
            artwork_id, transfer_type, from_user_id, to_user_id, created_at
          ) values (
            $1::uuid, 'transfer', $2::uuid, $3::uuid, now()
          )
          `,
          [artworkId, fromUser, toUser]
        );
      })(),
    ]);
  } finally {
    c1.release();
    c2.release();
  }
}

async function runArtworkLifecycleFlow(
  client: PoolClient,
  pool: Pool,
  ctx: ValidationFlowContext,
  inputs: ValidationInputs,
  skipPoolConcurrency: boolean
): Promise<{
  lifecycle: FlowResult;
  idempotency: FlowResult;
  concurrency: FlowResult;
}> {
  const lifecycleErrors: string[] = [];
  const artistId = process.env.VALIDATION_ARTIST_USER_ID?.trim();
  const galleryUserId = process.env.VALIDATION_GALLERY_USER_ID?.trim();

  let idempotency: FlowResult = {
    name: "idempotency_register",
    pass: false,
    errors: ["not run"],
  };
  let concurrency: FlowResult = {
    name: "concurrency",
    pass: false,
    errors: ["not run"],
  };

  if (!artistId || !galleryUserId) {
    lifecycleErrors.push(
      "Set VALIDATION_ARTIST_USER_ID and VALIDATION_GALLERY_USER_ID (Scenario A prerequisites)."
    );
    return {
      lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
      idempotency,
      concurrency,
    };
  }

  try {
    const { rows: pre } = await client.query<{
      gallery_id: string | null;
      gverified: boolean | null;
    }>(
      `
      select ar.gallery_id::text, g.verified as gverified
      from public.artists ar
      left join public.galleries g on g.id = ar.gallery_id
      where ar.id = $1::uuid
      `,
      [artistId]
    );
    if (!pre.length) {
      lifecycleErrors.push(`artist ${artistId} not found in public.artists`);
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }
    ctx.galleryIdForArtist = pre[0].gallery_id ?? undefined;
    if (!pre[0].gallery_id) {
      lifecycleErrors.push(
        "artist has no gallery_id — gallery cannot verify per gallery_verify_artwork rules"
      );
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }
    if (!pre[0].gverified) {
      lifecycleErrors.push(
        "gallery is not verified (galleries.verified = false) — gallery_verify_artwork will reject"
      );
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }

    const { rows: mem } = await client.query(
      `
      select 1 from public.gallery_users gu
      where gu.user_id = $1::uuid and gu.gallery_id = $2::uuid
      limit 1
      `,
      [galleryUserId, pre[0].gallery_id]
    );
    if (!mem.length) {
      lifecycleErrors.push(
        "VALIDATION_GALLERY_USER_ID is not a member of the artist's gallery"
      );
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }

    const title =
      process.env.VALIDATION_ARTWORK_TITLE?.trim() ||
      `Validation runner ${Date.now()}`;
    const registryId = `RROWM-VAL-${Date.now().toString(36).toUpperCase()}-${createHash(
      "sha256"
    )
      .update(String(Date.now()))
      .digest("hex")
      .slice(0, 8)
      .toUpperCase()}`;
    const metaHash = metadataHashPayload(artistId, title);

    const registerArgs: NonNullable<ValidationFlowContext["registerArgs"]> = {
      artistId,
      title,
      year: inputs.year,
      medium: inputs.medium,
      dimensions: inputs.dimensions,
      description: inputs.description,
      imageUrl: null,
      registryId,
      metadataHash: metaHash,
    };
    ctx.registerArgs = registerArgs;
    ctx.registryId = registryId;
    ctx.metadataHash = metaHash;
    ctx.title = title;

    const reg = await callRegisterAtomic(client, registerArgs);
    let artworkId = await resolveArtworkIdFromRegister(client, reg, registryId);
    if (!artworkId) {
      lifecycleErrors.push(
        "register_artwork_atomic did not yield an artwork id (no return row and no registry_id match)"
      );
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }
    ctx.artworkId = artworkId;

    await assertPostRegisterInvariants(
      client,
      artworkId,
      artistId,
      registryId,
      lifecycleErrors,
      ctx
    );
    if (lifecycleErrors.length) {
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }

    idempotency = await runIdempotencyRegisterFlow(client, ctx, registerArgs);
    if (!idempotency.pass) {
      return {
        lifecycle: {
          name: "artwork_lifecycle",
          pass: false,
          errors: [
            ...lifecycleErrors,
            "downstream blocked: idempotency_register failed",
          ],
        },
        idempotency,
        concurrency,
      };
    }

    await setJwtSub(client, artistId);
    await client.query(
      `
      select * from public.add_value_event(
        p_artwork_id := $1::uuid,
        p_declared_value := $2,
        p_currency := $3,
        p_value_type := $4,
        p_visibility_level := $5,
        p_note := 'validation runner primary'
      )
      `,
      [
        artworkId,
        inputs.declaredValue,
        inputs.currency,
        inputs.valueType,
        inputs.visibilityLevel,
      ]
    );

    const { rows: ve } = await client.query<{
      id: string;
      artwork_id: string;
      declared_value: number | null;
      currency: string | null;
      value_type: string | null;
    }>(
      `
      select id, artwork_id::text, declared_value, currency, value_type
      from public.value_events
      where artwork_id = $1::uuid
      order by created_at desc nulls last, id desc
      limit 1
      `,
      [artworkId]
    );
    if (!ve.length) {
      lifecycleErrors.push("value_events row not found after add_value_event");
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }
    const v = ve[0];
    if (v.artwork_id !== artworkId) lifecycleErrors.push("value_events.artwork_id mismatch");
    if (Number(v.declared_value) !== Number(inputs.declaredValue)) {
      lifecycleErrors.push(
        `value_events.declared_value mismatch: expected ${inputs.declaredValue} got ${v.declared_value}`
      );
    }
    if (!v.currency) lifecycleErrors.push("value_events.currency is null");
    if (v.currency && v.currency !== v.currency.toUpperCase()) {
      lifecycleErrors.push(`value_events.currency not uppercase: ${v.currency}`);
    }
    if (String(v.currency || "").toUpperCase() !== inputs.currency) {
      lifecycleErrors.push(
        `value_events.currency mismatch: expected ${inputs.currency} got ${v.currency}`
      );
    }
    if (v.value_type !== inputs.valueType) {
      lifecycleErrors.push(
        `value_events.value_type mismatch: expected ${inputs.valueType} got ${v.value_type}`
      );
    }
    if (lifecycleErrors.length) {
      return {
        lifecycle: { name: "artwork_lifecycle", pass: false, errors: lifecycleErrors },
        idempotency,
        concurrency,
      };
    }

    if (skipPoolConcurrency) {
      concurrency = { name: "concurrency", pass: true, errors: [] };
    } else {
      concurrency = await runConcurrencyValueEvents(pool, artistId, artworkId, inputs);
    }

    if (!concurrency.pass) {
      return {
        lifecycle: {
          name: "artwork_lifecycle",
          pass: false,
          errors: [
            ...lifecycleErrors,
            ...concurrency.errors.map((e) => `concurrency: ${e}`),
          ],
        },
        idempotency,
        concurrency,
      };
    }

    await setJwtSub(client, galleryUserId);
    await client.query(`select public.gallery_verify_artwork($1::uuid)`, [artworkId]);

    const { rows: vrows } = await client.query<{ verification_status: string | null }>(
      `select verification_status from public.artworks where id = $1::uuid`,
      [artworkId]
    );
    if ((vrows[0]?.verification_status || "").toLowerCase() !== "verified") {
      lifecycleErrors.push(
        `expected artworks.verification_status = verified after gallery_verify_artwork; got ${vrows[0]?.verification_status}`
      );
    }

    const expectedStatusRows = await client.query<{ s: string | null }>(
      `select public.compute_artwork_verification_status($1::uuid) as s`,
      [artworkId]
    );
    const expectedStatus = expectedStatusRows.rows[0]?.s;
    if (
      expectedStatus &&
      (vrows[0]?.verification_status || "") !== expectedStatus
    ) {
      lifecycleErrors.push(
        `verification mismatch: column=${vrows[0]?.verification_status} compute_artwork_verification_status=${expectedStatus}`
      );
    }

    const { rows: ownerAtIssuanceRows } = await client.query<{ co: string | null; g: string | null }>(
      `
      select
        a.current_owner_id::text as co,
        public.get_current_owner($1::uuid)::text as g
      from public.artworks a
      where a.id = $1::uuid
      `,
      [artworkId]
    );
    const co0 = ownerAtIssuanceRows[0]?.co;
    const g0 = ownerAtIssuanceRows[0]?.g;
    const ownerAtIssuance = co0 || g0 || artistId;
    if (co0 && g0 && co0 !== g0) {
      lifecycleErrors.push(
        `pre-cert: current_owner_id ${co0} != get_current_owner ${g0}`
      );
    }

    const iss = await client.query(
      `select * from public.issue_certificate_for_verified_artwork($1::uuid)`,
      [artworkId]
    );
    const ir = iss.rows[0] as { certificate_hash?: string } | undefined;
    if (!ir?.certificate_hash) {
      lifecycleErrors.push(
        "issue_certificate_for_verified_artwork did not return certificate_hash"
      );
    }

    const { rows: certRows } = await client.query<{
      id: string;
      certificate_hash: string | null;
      certificate_snapshot: unknown;
      revoked: boolean | null;
    }>(
      `
      select id, certificate_hash, certificate_snapshot, revoked
      from public.certificates
      where artwork_id = $1::uuid
      order by issued_at desc nulls last, id desc
      limit 1
      `,
      [artworkId]
    );
    if (!certRows.length) lifecycleErrors.push("no certificate row for artwork");
    else {
      const snap = certRows[0].certificate_snapshot;
      if (certRows[0].revoked !== false) {
        lifecycleErrors.push(
          `certificate.revoked expected false, got ${String(certRows[0].revoked)}`
        );
      }
      const { rows: h } = await client.query<{ h: string }>(
        `select public.generate_certificate_hash($1::jsonb) as h`,
        [snap as object]
      );
      const expectedHash = h[0]?.h;
      const stored = (certRows[0].certificate_hash || "").trim();
      if (!snap) lifecycleErrors.push("certificate_snapshot is null");
      else if (stored !== expectedHash) {
        lifecycleErrors.push(
          `certificate hash mismatch: stored=${stored} expected=${expectedHash}`
        );
      }

      validateCertificateSnapshot(
        snap,
        {
          artworkId,
          artistId,
          ownerAtIssuance,
        },
        lifecycleErrors
      );

      const { rows: snapFrozenRows } = await client.query<{ t: string | null }>(
        `
        select certificate_snapshot::text as t
        from public.certificates
        where artwork_id = $1::uuid
        order by issued_at desc nulls last, id desc
        limit 1
        `,
        [artworkId]
      );
      if (snapFrozenRows[0]?.t) {
        ctx.certificateSnapshotFrozen = snapFrozenRows[0].t;
      }

      const snapOwner =
        asSnapshotObject(snap)?.current_owner_id != null
          ? String(asSnapshotObject(snap)!.current_owner_id)
          : null;

      await assertCrossEntityConsistency(
        client,
        artworkId,
        snapOwner,
        artistId,
        lifecycleErrors
      );

      const hasUuid = await hasVerifyCertificateUuid(client);
      if (hasUuid) {
        const vrf = await client.query(
          `select public.verify_certificate($1::uuid) as v`,
          [certRows[0].id]
        );
        const vr = vrf.rows[0]?.v as { valid?: boolean } | null;
        if (vr?.valid !== true) {
          lifecycleErrors.push(
            `verify_certificate(uuid) expected valid=true; got ${JSON.stringify(vr)}`
          );
        }
      }
    }

    const co = await client.query<{ o: string | null }>(
      `select public.get_current_owner($1::uuid)::text as o`,
      [artworkId]
    );
    if (!co.rows[0]?.o) {
      lifecycleErrors.push(
        "get_current_owner returned null after registration (expected artist or initial owner)"
      );
    } else if (co.rows[0].o !== artistId) {
      lifecycleErrors.push(`get_current_owner mismatch: expected ${artistId} got ${co.rows[0].o}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    lifecycleErrors.push(`exception: ${msg}`);
  }

  return {
    lifecycle: {
      name: "artwork_lifecycle",
      pass: lifecycleErrors.length === 0,
      errors: lifecycleErrors,
    },
    idempotency,
    concurrency,
  };
}

async function runOwnershipChainFlow(
  client: PoolClient,
  pool: Pool,
  lifecycle: FlowResult,
  ctx: ValidationFlowContext,
  expectedArtistId: string,
  skipPoolConcurrency: boolean
): Promise<{
  chain: FlowResult;
  concurrentOwnershipErrors: string[];
  certificateImmutabilityErrors: string[];
}> {
  const errors: string[] = [];
  const concurrentOwnershipErrors: string[] = [];
  const certificateImmutabilityErrors: string[] = [];
  const second = process.env.VALIDATION_SECOND_OWNER_USER_ID?.trim();
  if (!second) {
    errors.push(
      "Set VALIDATION_SECOND_OWNER_USER_ID (uuid in auth.users) for Scenario B."
    );
    return {
      chain: { name: "ownership_chain", pass: false, errors },
      concurrentOwnershipErrors,
      certificateImmutabilityErrors,
    };
  }

  const manualArtworkId = process.env.VALIDATION_CHAIN_ARTWORK_ID?.trim();
  const artworkId = manualArtworkId || ctx.artworkId;

  if (!artworkId) {
    errors.push(
      "no artwork id: complete artwork_lifecycle or set VALIDATION_CHAIN_ARTWORK_ID"
    );
    return {
      chain: { name: "ownership_chain", pass: false, errors },
      concurrentOwnershipErrors,
      certificateImmutabilityErrors,
    };
  }

  if (!lifecycle.pass && !manualArtworkId) {
    errors.push("skipped because artwork_lifecycle failed");
    return {
      chain: { name: "ownership_chain", pass: false, errors },
      concurrentOwnershipErrors,
      certificateImmutabilityErrors,
    };
  }

  try {
    const { rows: cur } = await client.query<{ uid: string | null; co: string | null }>(
      `
      select a.artist_id::text as uid, a.current_owner_id::text as co
      from public.artworks a where a.id = $1::uuid
      `,
      [artworkId]
    );
    const artistUserId = cur[0]?.uid;
    const prevOwner = cur[0]?.co || artistUserId;
    if (!prevOwner) {
      errors.push("could not resolve previous owner for chain test");
      return {
        chain: { name: "ownership_chain", pass: false, errors },
        concurrentOwnershipErrors,
        certificateImmutabilityErrors,
      };
    }
    if (expectedArtistId && artistUserId !== expectedArtistId) {
      errors.push(
        `ownership_chain: artwork.artist_id ${artistUserId} !== expected ${expectedArtistId}`
      );
    }

    await client.query(
      `
      insert into public.ownership_events (
        artwork_id, transfer_type, from_user_id, to_user_id, created_at
      ) values (
        $1::uuid, 'transfer', $2::uuid, $3::uuid, now()
      )
      `,
      [artworkId, prevOwner, second]
    );

    if (ctx.certificateSnapshotFrozen) {
      const { rows: certSnapAfter } = await client.query<{ t: string | null }>(
        `
        select certificate_snapshot::text as t
        from public.certificates
        where artwork_id = $1::uuid
        order by issued_at desc nulls last, id desc
        limit 1
        `,
        [artworkId]
      );
      if (certSnapAfter[0]?.t !== ctx.certificateSnapshotFrozen) {
        certificateImmutabilityErrors.push(
          "certificate_snapshot changed after ownership transfer — issuance snapshot must remain immutable (e.g. current_owner_id must not follow new owner)"
        );
      }
      let parsed: unknown = null;
      if (certSnapAfter[0]?.t) {
        try {
          parsed = JSON.parse(certSnapAfter[0].t as string);
        } catch {
          certificateImmutabilityErrors.push(
            "certificate_snapshot after transfer is not valid JSON"
          );
        }
      }
      const so = asSnapshotObject(parsed);
      if (so && String(so.current_owner_id ?? "") === second) {
        certificateImmutabilityErrors.push(
          "certificate_snapshot.current_owner_id reflects post-transfer owner — snapshot must preserve issuance owner only"
        );
      }
    }

    const go = await client.query<{ o: string | null }>(
      `select public.get_current_owner($1::uuid)::text as o`,
      [artworkId]
    );
    if (go.rows[0]?.o !== second) {
      errors.push(
        `get_current_owner after transfer: expected ${second}, got ${go.rows[0]?.o}`
      );
    }

    const { rows: aco } = await client.query<{ co: string | null }>(
      `select current_owner_id::text as co from public.artworks where id = $1::uuid`,
      [artworkId]
    );
    if (aco[0]?.co !== second) {
      errors.push(
        `artworks.current_owner_id cache expected ${second}, got ${aco[0]?.co}`
      );
    }

    await assertCrossEntityConsistency(client, artworkId, null, second, errors);

    if (!skipPoolConcurrency && artistUserId) {
      const { rows: oeBeforeRace } = await pool.query<{ n: number }>(
        `select count(*)::int as n from public.ownership_events where artwork_id = $1::uuid`,
        [artworkId]
      );
      const nRaceBefore = oeBeforeRace[0]?.n ?? 0;
      await runConcurrencyOwnershipEvents(pool, artworkId, second, artistUserId);
      const { rows: oeAfterRace } = await pool.query<{ n: number }>(
        `select count(*)::int as n from public.ownership_events where artwork_id = $1::uuid`,
        [artworkId]
      );
      const nRaceAfter = oeAfterRace[0]?.n ?? 0;
      if (nRaceAfter - nRaceBefore !== 1) {
        concurrentOwnershipErrors.push(
          `parallel identical ownership transfers (second→artist): expected exactly +1 row, delta ${nRaceAfter - nRaceBefore} (before ${nRaceBefore} after ${nRaceAfter})`
        );
      }
      const { rows: afterRace } = await pool.query<{ o: string | null }>(
        `select public.get_current_owner($1::uuid)::text as o`,
        [artworkId]
      );
      if (afterRace[0]?.o !== artistUserId) {
        concurrentOwnershipErrors.push(
          `after parallel transfer back: get_current_owner expected ${artistUserId} got ${afterRace[0]?.o}`
        );
      }
      await assertCrossEntityConsistency(
        pool as unknown as PoolClient,
        artworkId,
        null,
        artistUserId,
        concurrentOwnershipErrors
      );
    }

    const badFrom = "00000000-0000-4000-8000-000000000001";
    let rejected = false;
    try {
      await client.query(
        `
        insert into public.ownership_events (
          artwork_id, transfer_type, from_user_id, to_user_id, created_at
        ) values (
          $1::uuid, 'transfer', $2::uuid, $3::uuid, now()
        )
        `,
        [artworkId, badFrom, second]
      );
    } catch {
      rejected = true;
    }
    if (!rejected) {
      errors.push(
        "expected invalid ownership_events insert (from_user_id mismatch) to be rejected"
      );
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }

  return {
    chain: { name: "ownership_chain", pass: errors.length === 0, errors },
    concurrentOwnershipErrors,
    certificateImmutabilityErrors,
  };
}

async function runIntegrityReport(client: PoolClient): Promise<{
  pass: boolean;
  report: unknown;
  errors: string[];
}> {
  const errors: string[] = [];
  try {
    const { rows } = await client.query(`select public.system_integrity_report() as r`);
    const report = rows[0]?.r;
    if (!report || typeof report !== "object") {
      errors.push("system_integrity_report() returned empty or non-object");
      return { pass: false, report, errors };
    }
    const o = report as Record<string, unknown>;
    const keys = [
      "ownership_mismatches",
      "unresolved_sales",
      "invalid_certificates",
      "verification_mismatches",
    ] as const;
    for (const k of keys) {
      const arr = o[k];
      if (!Array.isArray(arr)) {
        errors.push(`report.${k} is not an array`);
      } else if (arr.length > 0) {
        errors.push(`report.${k} has ${arr.length} issue(s): ${JSON.stringify(arr).slice(0, 500)}`);
      }
    }
    return { pass: errors.length === 0, report, errors };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`system_integrity_report() failed: ${msg}`);
    return { pass: false, report: null, errors };
  }
}

function skippedHardeningSkip(reason: string): HardeningReport {
  const s: HardeningSection = {
    pass: true,
    errors: [],
    skipped: true,
    skip_reason: reason,
  };
  return {
    event_ordering: { ...s },
    ownership_duplication: { ...s },
    certificate_immutability: { ...s },
    registry_guarantees: { ...s },
    rls_permissions: { ...s },
    atomicity_register: { ...s },
    pass: true,
  };
}

export async function runSystemValidation(
  client: PoolClient,
  pool: Pool
): Promise<SystemValidationReport> {
  const warnings: string[] = [];

  let inputs: ValidationInputs;
  try {
    inputs = readValidationInputs();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      warnings: [],
      rpc_defined_in_repo: checkRpcDefinedInRepo(),
      rpc_reproducibility_pass: false,
      rpc_check: { pass: false, missing: [...REQUIRED_RPC_NAMES], present: [] },
      schema_check: { pass: false, issues: [msg] },
      flows: {
        artwork_lifecycle: { name: "artwork_lifecycle", pass: false, errors: [msg] },
        idempotency_register: {
          name: "idempotency_register",
          pass: false,
          errors: ["not run"],
        },
        concurrency: { name: "concurrency", pass: false, errors: ["not run"] },
        ownership_chain: { name: "ownership_chain", pass: false, errors: ["not run"] },
      },
      integrity: { pass: false, report: null, errors: ["not run"] },
      hardening: skippedHardeningSkip(`invalid inputs: ${msg}`),
      pass: false,
      failure_reasons: [`FAIL: invalid inputs: ${msg}`],
    };
  }

  const rpc_defined_in_repo = checkRpcDefinedInRepo();
  const missingInRepo = REQUIRED_RPC_NAMES.filter((n) => !rpc_defined_in_repo[n]);
  const strictRepo = process.env.VALIDATION_STRICT_REPRODUCIBILITY === "1";
  const rpc_reproducibility_pass = strictRepo ? missingInRepo.length === 0 : true;

  if (missingInRepo.length && !strictRepo) {
    warnings.push(
      `HIGH RISK: RPC(s) not found in supabase/migrations/*.sql (environment may be unreproducible): ${missingInRepo.join(
        ", "
      )}`
    );
  }

  const rpc = await check_required_rpcs(client);
  const rpc_pass = rpc.missing.length === 0;

  const schema = await check_schema_dependencies(client);

  const skipFlows = process.env.VALIDATION_SKIP_FLOWS === "1";
  const rollback = process.env.VALIDATION_ROLLBACK === "1";
  const flowCtx: ValidationFlowContext = {};
  const artistId = process.env.VALIDATION_ARTIST_USER_ID?.trim() || "";
  const galleryUserId = process.env.VALIDATION_GALLERY_USER_ID?.trim() || "";

  let atomicity_register: HardeningSection = {
    pass: true,
    errors: [],
    skipped: true,
    skip_reason: "RPC or schema gate not satisfied / flows skipped",
  };
  if (rpc_pass && schema.pass && !skipFlows) {
    atomicity_register = await runRegisterAtomicFailureProbe(client, inputs);
  }

  let lifecycle: FlowResult;
  let idempotency: FlowResult;
  let concurrency: FlowResult;
  let chain: FlowResult;
  let chainOutcome: Awaited<ReturnType<typeof runOwnershipChainFlow>> | null =
    null;

  if (!rpc_pass) {
    lifecycle = {
      name: "artwork_lifecycle",
      pass: false,
      errors: ["skipped: required RPCs missing"],
    };
    idempotency = {
      name: "idempotency_register",
      pass: false,
      errors: ["skipped: required RPCs missing"],
    };
    concurrency = {
      name: "concurrency",
      pass: false,
      errors: ["skipped: required RPCs missing"],
    };
    chain = {
      name: "ownership_chain",
      pass: false,
      errors: ["skipped: required RPCs missing"],
    };
  } else if (skipFlows) {
    lifecycle = { name: "artwork_lifecycle", pass: true, errors: [] };
    idempotency = { name: "idempotency_register", pass: true, errors: [] };
    concurrency = { name: "concurrency", pass: true, errors: [] };
    chain = { name: "ownership_chain", pass: true, errors: [] };
  } else {
    if (rollback) {
      warnings.push(
        "VALIDATION_ROLLBACK=1: value_events and ownership concurrent tests that use separate pool connections are skipped (uncommitted work is not visible across connections)."
      );
    }
    const suite = await runArtworkLifecycleFlow(
      client,
      pool,
      flowCtx,
      inputs,
      rollback
    );
    lifecycle = suite.lifecycle;
    idempotency = suite.idempotency;
    concurrency = suite.concurrency;
    chainOutcome = await runOwnershipChainFlow(
      client,
      pool,
      lifecycle,
      flowCtx,
      artistId,
      rollback
    );
    chain = chainOutcome.chain;
    if (chainOutcome.certificateImmutabilityErrors.length) {
      chain = {
        name: "ownership_chain",
        pass:
          chain.pass && chainOutcome.certificateImmutabilityErrors.length === 0,
        errors: [
          ...chain.errors,
          ...chainOutcome.certificateImmutabilityErrors.map(
            (e) => `certificate_immutability: ${e}`
          ),
        ],
      };
    }
    if (chainOutcome.concurrentOwnershipErrors.length) {
      const aug = chainOutcome.concurrentOwnershipErrors.map(
        (e) => `ownership_concurrency: ${e}`
      );
      concurrency = {
        name: "concurrency",
        pass: concurrency.pass && chainOutcome.concurrentOwnershipErrors.length === 0,
        errors: [...concurrency.errors, ...aug],
      };
    }
  }

  let event_ordering: HardeningSection;
  let ownership_duplication: HardeningSection;
  let registry_guarantees: HardeningSection;
  const certificate_immutability: HardeningSection = {
    pass: (chainOutcome?.certificateImmutabilityErrors.length ?? 0) === 0,
    errors: [...(chainOutcome?.certificateImmutabilityErrors ?? [])],
  };

  if (!rpc_pass || skipFlows) {
    const skip: HardeningSection = {
      pass: true,
      errors: [],
      skipped: true,
      skip_reason: "flows not run",
    };
    event_ordering = { ...skip };
    ownership_duplication = { ...skip };
    registry_guarantees = { ...skip };
    certificate_immutability.skipped = true;
    certificate_immutability.skip_reason = "flows not run";
  } else if (flowCtx.artworkId) {
    const ordErr: string[] = [];
    await verifyDeterministicEventOrdering(
      client,
      flowCtx.artworkId,
      "value_events",
      ordErr,
      "value_events"
    );
    await verifyDeterministicEventOrdering(
      client,
      flowCtx.artworkId,
      "ownership_events",
      ordErr,
      "ownership_events"
    );
    event_ordering = { pass: ordErr.length === 0, errors: ordErr };

    const dupErr: string[] = [];
    await verifyOwnershipDuplicateKeyGroups(client, flowCtx.artworkId, dupErr);
    ownership_duplication = { pass: dupErr.length === 0, errors: dupErr };

    const regErr: string[] = [];
    await verifyRegistryGuaranteesFromDb(client, flowCtx, regErr);
    registry_guarantees = { pass: regErr.length === 0, errors: regErr };
  } else {
    const msg =
      "no artwork id in context — event ordering / ownership duplication / registry checks require successful lifecycle";
    event_ordering = { pass: false, errors: [msg] };
    ownership_duplication = { pass: false, errors: [msg] };
    registry_guarantees = { pass: false, errors: [msg] };
  }

  let rls_permissions: HardeningSection = {
    pass: true,
    errors: [],
    skipped: true,
    skip_reason: "flows not run",
  };
  const secondOwner = process.env.VALIDATION_SECOND_OWNER_USER_ID?.trim();
  if (
    rpc_pass &&
    !skipFlows &&
    flowCtx.artworkId &&
    flowCtx.galleryIdForArtist &&
    artistId &&
    galleryUserId &&
    secondOwner
  ) {
    rls_permissions = await runRlsPermissionProbes(
      client,
      {
        artworkId: flowCtx.artworkId,
        artistId,
        galleryId: flowCtx.galleryIdForArtist,
        currentOwnerForChain: artistId,
        secondOwnerUserId: secondOwner,
      },
      warnings
    );
  } else if (rpc_pass && !skipFlows) {
    rls_permissions = {
      pass: true,
      errors: [],
      skipped: true,
      skip_reason:
        "missing VALIDATION_GALLERY_USER_ID / gallery context / SECOND_OWNER — RLS probes partial",
    };
    warnings.push(
      "hardening: RLS permission suite incomplete (need gallery id on artist, VALIDATION_GALLERY_USER_ID, VALIDATION_SECOND_OWNER_USER_ID)"
    );
  }

  const hardening: HardeningReport = {
    event_ordering,
    ownership_duplication,
    certificate_immutability,
    registry_guarantees,
    rls_permissions,
    atomicity_register,
    pass: true,
  };

  hardening.pass =
    hardening.event_ordering.pass &&
    hardening.ownership_duplication.pass &&
    hardening.certificate_immutability.pass &&
    hardening.registry_guarantees.pass &&
    hardening.rls_permissions.pass &&
    hardening.atomicity_register.pass;

  const integrity = await runIntegrityReport(client);

  const flowsPass =
    skipFlows ||
    (lifecycle.pass &&
      idempotency.pass &&
      concurrency.pass &&
      chain.pass);
  const pass =
    rpc_pass &&
    rpc_reproducibility_pass &&
    schema.pass &&
    flowsPass &&
    integrity.pass &&
    hardening.pass;

  const base = {
    warnings,
    rpc_defined_in_repo,
    rpc_reproducibility_pass,
    rpc_check: { pass: rpc_pass, missing: rpc.missing, present: rpc.present },
    schema_check: schema,
    flows: {
      artwork_lifecycle: lifecycle,
      idempotency_register: idempotency,
      concurrency,
      ownership_chain: chain,
    },
    integrity,
    hardening,
  };

  const failure_reasons = buildFailureReasons(base);
  return { ...base, pass, failure_reasons };
}

