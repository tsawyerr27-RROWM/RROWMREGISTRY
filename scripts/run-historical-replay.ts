/**
 * Historical replay validator CLI.
 *
 *   DATABASE_URL=... REPLAY_ARTWORK_IDS=uuid,uuid npx tsx scripts/run-historical-replay.ts
 *
 * Exit 0 iff replay_pass.
 */

import { Pool } from "pg";
import { runHistoricalReplayValidator } from "../lib/historical-replay-validator";

async function main() {
  const url =
    process.env.VALIDATION_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  const raw = process.env.REPLAY_ARTWORK_IDS?.trim();
  if (!url || !raw) {
    console.log(
      JSON.stringify(
        {
          replay_pass: false,
          mismatches: [
            !url
              ? "Set DATABASE_URL or VALIDATION_DATABASE_URL"
              : "Set REPLAY_ARTWORK_IDS (comma-separated artwork uuids)",
          ],
          snapshot_errors: [],
          drift_detected: false,
          warnings: [],
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const artworkIds = raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    const report = await runHistoricalReplayValidator(client, artworkIds);
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.replay_pass ? 0 : 1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
