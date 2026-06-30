import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const DEAL_ID = "d233ab16-c387-40e8-bd01-3165722c7f1a";

const { createSupabaseServiceClient } = await import("../lib/supabase-service-role.ts");
const { resolveDealExecution } = await import("../lib/deal-execution.ts");
const { readAcquisitionLifecycle } = await import("../lib/acquisition-lifecycle.ts");

const s = createSupabaseServiceClient();
const { data } = await s
  .from("deals")
  .select("terms,status,type,artwork_id,participant_a_user_id,participant_b_user_id")
  .eq("id", DEAL_ID)
  .single();

const exec = await resolveDealExecution(s, { dealId: DEAL_ID, terms: data.terms });
const lifecycle = readAcquisitionLifecycle(data.terms);

const { data: transfersForDeal } = await s
  .from("provenance_transfers")
  .select("id,status,deal_id,artwork_id,from_user_id,recipient_user_id")
  .eq("deal_id", DEAL_ID);

const { data: transfersForArt } = await s
  .from("provenance_transfers")
  .select("id,status,deal_id,artwork_id")
  .eq("artwork_id", data.artwork_id);

console.log(
  JSON.stringify(
    {
      deal: data,
      lifecycle,
      executionFromTerms: exec,
      transfersForDeal,
      transfersForArtwork: transfersForArt,
    },
    null,
    2
  )
);
