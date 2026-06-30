/**
 * Static migration chain audit (no database required).
 * Usage: npx tsx scripts/migration-chain-audit.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "supabase/migrations");

type Result = { id: string; pass: boolean; detail: string };
const results: Result[] = [];

function pass(id: string, detail: string) {
  results.push({ id, pass: true, detail });
}

function fail(id: string, detail: string) {
  results.push({ id, pass: false, detail });
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  fail("MIG-00", "No migration files found");
} else {
  pass("MIG-00", `${files.length} migration files in chain`);
}

const versions = files.map((f) => f.split("_")[0] ?? f);
const dupes = versions.filter((v, i) => versions.indexOf(v) !== i);
if (dupes.length) {
  fail("MIG-01", `Duplicate migration version prefixes: ${[...new Set(dupes)].join(", ")}`);
} else {
  pass("MIG-01", "Migration version prefixes are unique");
}

const sprintMigrations = [
  "20260629000100_value_steward_authority.sql",
  "20260630000100_value_events_append_only.sql",
  "20260701000100_value_chronology_phase_model.sql",
  "20260702000100_value_chronology_sale_phase.sql",
  "20260703000100_genesis_backfill_chronology_correctness.sql",
  "20260626000100_backfill_genesis_ownership_events_pr_beta_7.sql",
];

for (const name of sprintMigrations) {
  const id = `MIG-file:${name}`;
  if (!files.includes(name)) {
    fail(id, "Missing expected migration");
    continue;
  }
  pass(id, "Present");
}

const orderedIndex = (name: string) => files.indexOf(name);
const orderingChecks: [string, string][] = [
  ["20260626000100_backfill_genesis_ownership_events_pr_beta_7.sql", "20260703000100_genesis_backfill_chronology_correctness.sql"],
  ["20260629000100_value_steward_authority.sql", "20260630000100_value_events_append_only.sql"],
  ["20260630000100_value_events_append_only.sql", "20260701000100_value_chronology_phase_model.sql"],
  ["20260701000100_value_chronology_phase_model.sql", "20260702000100_value_chronology_sale_phase.sql"],
];

for (const [before, after] of orderingChecks) {
  const id = `MIG-order:${before}->${after}`;
  const bi = orderedIndex(before);
  const ai = orderedIndex(after);
  if (bi < 0 || ai < 0) {
    fail(id, "File missing for ordering check");
  } else if (bi >= ai) {
    fail(id, `Expected ${before} before ${after}`);
  } else {
    pass(id, "Ordering OK");
  }
}

const rpcChecks: Record<string, string[]> = {
  "20260629000100_value_steward_authority.sql": ["can_record_value_event"],
  "20260630000100_value_events_append_only.sql": [
    "enforce_value_event_immutability",
    "references_event_id",
  ],
  "20260701000100_value_chronology_phase_model.sql": [
    "is_primary_market_value_phase",
    "is_manual_primary_value_type",
  ],
  "20260702000100_value_chronology_sale_phase.sql": [
    "has_completed_sale",
    "is_price_discovery_value_phase",
  ],
  "20260703000100_genesis_backfill_chronology_correctness.sql": [
    "ownership_events",
    "PR-BETA.7.2",
  ],
};

for (const [file, needles] of Object.entries(rpcChecks)) {
  const body = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  const missing = needles.filter((n) => !body.includes(n));
  const id = `MIG-content:${file}`;
  if (missing.length) {
    fail(id, `Missing expected symbols: ${missing.join(", ")}`);
  } else {
    pass(id, `Defines ${needles.join(", ")}`);
  }
}

const report = {
  gate: "migration-chain-audit",
  pass: results.every((r) => r.pass),
  passed: results.filter((r) => r.pass).length,
  failed: results.filter((r) => !r.pass).length,
  migrationCount: files.length,
  latest: files.at(-1) ?? null,
  results,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
