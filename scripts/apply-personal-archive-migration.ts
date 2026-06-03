/**
 * Apply Personal Archive DDL to the Postgres database behind your app.
 *
 * Usage (get URI from Supabase Dashboard → Project Settings → Database → Connection string):
 *   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-....pooler.supabase.com:6543/postgres" \
 *   npx tsx scripts/apply-personal-archive-migration.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const SQL_PATH = join(
  process.cwd(),
  "supabase/manual/apply_personal_archive.sql"
);

async function probeRest(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return;

  const res = await fetch(`${url}/rest/v1/artwork_archives?select=id&limit=1`, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
  });
  const body = await res.text();
  if (res.ok) {
    console.log("PostgREST: public.artwork_archives is visible (HTTP", res.status + ").");
    return;
  }
  console.warn(
    "PostgREST probe after DDL:",
    res.status,
    body.slice(0, 240)
  );
  console.warn(
    "If you still see PGRST205, run in SQL Editor: notify pgrst, 'reload schema';"
  );
}

async function main() {
  const dbUrl =
    process.env.DATABASE_URL?.trim() ||
    process.env.VALIDATION_DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error(
      "Set DATABASE_URL (Supabase direct Postgres URI) then re-run.\n" +
        "Dashboard → Project Settings → Database → Connection string → URI\n" +
        "Or paste supabase/manual/apply_personal_archive.sql into SQL Editor."
    );
    process.exit(1);
  }

  const sql = readFileSync(SQL_PATH, "utf8");
  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();

  try {
    const reg = await client.query<{ reg: string | null }>(
      "select to_regclass('public.artwork_archives')::text as reg"
    );
    if (reg.rows[0]?.reg) {
      console.log("Table already exists:", reg.rows[0].reg);
    } else {
      console.log("Applying personal archive migration…");
    }

    await client.query(sql);

    const check = await client.query<{ reg: string | null }>(
      "select to_regclass('public.artwork_archives')::text as reg"
    );
    if (!check.rows[0]?.reg) {
      throw new Error("artwork_archives table missing after migration.");
    }

    await client.query(
      "select public.get_artwork_archive_count('00000000-0000-0000-0000-000000000001'::uuid)"
    );

    console.log("Database migration OK:", check.rows[0].reg);
  } finally {
    client.release();
    await pool.end();
  }

  await probeRest();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
