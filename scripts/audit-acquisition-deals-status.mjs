import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

for (const line of readFileSync(resolve(".env.local"), "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  process.env[trimmed.slice(0, eq).trim()] = val;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(`
  select d.id, d.status, d.type, d.artwork_id,
         der.status as exec_status,
         der.metadata->>'provenance_transfer_id' as transfer_id,
         pt.status as transfer_status
  from deals d
  left join deal_execution_records der on der.deal_id = d.id and der.kind = 'transfer'
  left join provenance_transfers pt on pt.id::text = der.metadata->>'provenance_transfer_id'
  where lower(coalesce(d.type,'')) = 'acquisition'
  order by d.updated_at desc
  limit 15
`);

console.log(JSON.stringify(rows, null, 2));
await pool.end();
