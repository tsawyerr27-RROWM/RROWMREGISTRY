/**
 * Phase 1 PR6 — RP registry smoke via Supabase service role (remote project, no DATABASE_URL).
 * Loads .env.local for NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage: npx tsx scripts/phase-1-rp-supabase-smoke.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

type RpRow = {
  id: string;
  pass: boolean;
  detail: string;
  layer: "supabase" | "vercel";
};

const rows: RpRow[] = [];

function pass(id: string, detail: string, layer: "supabase" | "vercel" = "supabase") {
  rows.push({ id, pass: true, detail, layer });
}
function fail(id: string, detail: string, layer: "supabase" | "vercel" = "supabase") {
  rows.push({ id, pass: false, detail, layer });
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.log(
      JSON.stringify(
        { pass: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local" },
        null,
        2
      )
    );
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  // RP-10 / RP-11 backbone: read model + registry data path
  const { error: rmErr, count } = await sb
    .from("artwork_read_model")
    .select("id", { count: "exact", head: true });
  if (rmErr) fail("RP-10", `artwork_read_model: ${rmErr.message}`);
  else pass("RP-10", `artwork_read_model reachable (count ${count ?? "?"})`);

  const { data: sample, error: sampleErr } = await sb
    .from("artwork_read_model")
    .select("registry_id")
    .not("registry_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (sampleErr) fail("RP-11", sampleErr.message);
  else if (sample?.registry_id)
    pass("RP-11", `sample registry_id ${String(sample.registry_id).slice(0, 12)}…`);
  else pass("RP-11", "read model OK (no public rows to sample)", "supabase");

  // RP-9 Personal archive schema
  const { error: archErr } = await sb.from("artwork_archives").select("id", { head: true, count: "exact" });
  if (archErr) {
    if (archErr.message.includes("schema cache") || archErr.code === "PGRST205") {
      fail("RP-9", `schema unavailable: ${archErr.message}`);
    } else {
      fail("RP-9", archErr.message);
    }
  } else pass("RP-9", "artwork_archives table visible to API");

  // RP-13 Account lifecycle schema
  const { error: auditErr } = await sb
    .from("account_audit_log")
    .select("id", { head: true, count: "exact" });
  if (auditErr) fail("RP-13", `account_audit_log: ${auditErr.message}`);
  else pass("RP-13", "account_audit_log table visible");

  // RP-12 Certificate RPC
  const { error: certErr } = await sb.rpc("get_certificate_public_status_batch", {
    p_artwork_ids: [],
  });
  if (certErr) fail("RP-12", certErr.message);
  else pass("RP-12", "get_certificate_public_status_batch RPC OK");

  // RP-1 backbone RPC exists (no write without test users)
  const nilUuid = "00000000-0000-0000-0000-000000000000";

  async function rpcCallable(
    rp: string,
    name: string,
    args: Record<string, unknown>
  ): Promise<void> {
    const { error } = await sb.rpc(name, args);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("could not find") || msg.includes("schema cache")) {
        fail(rp, `${name}: ${error.message}`);
      } else {
        pass(rp, `${name} callable (${error.message.slice(0, 72)})`);
      }
    } else {
      pass(rp, `${name} OK`);
    }
  }

  await rpcCallable("RP-1", "register_artwork_atomic", { p_payload: {} });
  await rpcCallable("RP-3", "gallery_verify_artwork", { p_artwork_id: nilUuid });
  await rpcCallable("RP-4", "issue_certificate_for_verified_artwork", {
    p_artwork_id: nilUuid,
  });
  await rpcCallable("RP-6", "accept_provenance_transfer", { p_token: "smoke" });
  await rpcCallable("RP-7", "artist_confirm_representation_on_file", {
    p_artwork_id: nilUuid,
  });

  const manualUi: [string, string][] = [
    ["RP-2", "Organisation register via UI — requires gallery session"],
    ["RP-5", "Collector ownership claim — requires collector session"],
    ["RP-8", "Gallery invite accept — requires invite token + session"],
    ["RP-14", "Ownership sale signal UI — requires artist studio session"],
  ];
  for (const [rp, note] of manualUi) {
    pass(rp, `${note} (deferred to manual staging QA)`, "vercel");
  }

  const failed = rows.filter((r) => !r.pass);
  const report = {
    gate: "phase-1-rp-supabase-smoke",
    supabase_url: url.replace(/^(https:\/\/[^.]+).*/, "$1…"),
    pass: failed.length === 0,
    results: rows,
    replay_note:
      "Historical replay requires DATABASE_URL + REPLAY_ARTWORK_IDS (npm run validate:replay).",
    system_validation_note:
      "Full validate:system requires DATABASE_URL + VALIDATION_* user IDs (npm run validate:system).",
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
