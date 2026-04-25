/**
 * Pre-launch gate: deterministic DB validation (RPCs, schema, flows, integrity).
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:...@db....supabase.co:5432/postgres" \
 *   VALIDATION_ARTIST_USER_ID=... VALIDATION_GALLERY_USER_ID=... VALIDATION_SECOND_OWNER_USER_ID=... \
 *   npx tsx scripts/run-system-validation.ts
 *
 * Optional:
 *   VALIDATION_ROLLBACK=1  — run flow steps in a transaction and ROLLBACK (integrity runs before rollback)
 *   VALIDATION_SKIP_FLOWS=1 — catalog + integrity only (no writes)
 *   VALIDATION_STRICT_RLS=1 — FAIL when the DB role bypasses RLS and table-level probes cannot be enforced
 *   VALIDATION_NON_OWNER_USER_ID, VALIDATION_GALLERY_STAFF_USER_ID — see lib/system-validation-runner.ts header
 */

import { Pool } from "pg";
import { runSystemValidation } from "../lib/system-validation-runner";

async function main() {
  const url =
    process.env.VALIDATION_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log(
      JSON.stringify(
        {
          pass: false,
          failure_reasons: [
            "Set DATABASE_URL or VALIDATION_DATABASE_URL (direct Postgres URI, typically Supabase postgres role).",
          ],
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    const rollback = process.env.VALIDATION_ROLLBACK === "1";
    if (rollback) {
      await client.query("BEGIN");
    }

    const report = await runSystemValidation(client, pool);

    if (rollback) {
      await client.query("ROLLBACK");
    }

    console.log(JSON.stringify(report, null, 2));
    process.exit(report.pass ? 0 : 1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
