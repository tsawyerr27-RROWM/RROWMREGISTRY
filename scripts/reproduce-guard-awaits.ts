/**
 * Reproduce StudioRouteGuard await chain with a real validation session.
 * Usage: npx tsx scripts/reproduce-guard-awaits.ts
 */

import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getOnboardingRedirectPath } from "../lib/onboarding";
import { studioRoleHomeMismatch } from "../lib/studio-route-access";

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

async function withTimeout<T>(
  label: string,
  ms: number,
  fn: () => Promise<T>
): Promise<{ label: string; ok: true; ms: number; result: T } | { label: string; ok: false; ms: number; hung: true }> {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms`)), ms);
      }),
    ]);
    return { label, ok: true, ms: Date.now() - start, result };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("TIMEOUT")) {
      return { label, ok: false, ms: Date.now() - start, hung: true };
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function buildAuthedClient(): Promise<{
  supabase: SupabaseClient;
  uid: string;
  email: string;
}> {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const artistId = process.env.VALIDATION_ARTIST_USER_ID?.trim();

  if (!url || !serviceKey || !anonKey || !artistId) {
    throw new Error("Missing env");
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(artistId);
  if (userErr || !userData.user?.email) {
    throw new Error(userErr?.message ?? "no user");
  }

  const email = userData.user.email;
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !linkData.properties?.email_otp) {
    throw new Error(linkErr?.message ?? "no otp");
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
    email,
    token: linkData.properties.email_otp,
    type: "email",
  });
  if (verifyErr || !verifyData.session?.user.id) {
    throw new Error(verifyErr?.message ?? "verify failed");
  }

  return { supabase, uid: verifyData.session.user.id, email };
}

async function main() {
  const pathname = "/studio/account";
  const { supabase, uid, email } = await buildAuthedClient();
  const steps: Array<
    | { step: string; ok: true; ms: number; detail?: unknown }
    | { step: string; ok: false; ms: number; hung: true }
    | { step: string; ok: false; ms: number; error: string }
  > = [];

  console.log("GUARD_STEP:start");

  const getSession = await withTimeout("getSession", 15_000, async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session ?? null;
  });
  console.log("GUARD_STEP:getSession");
  if (!getSession.ok) {
    steps.push({ step: "getSession", ...getSession });
    printReport(steps, email, uid);
    return;
  }
  if (!getSession.result) {
    steps.push({ step: "getSession", ok: false, ms: getSession.ms, error: "no session" });
    printReport(steps, email, uid);
    return;
  }
  steps.push({ step: "getSession", ok: true, ms: getSession.ms, detail: { hasSession: true } });

  const onboarding = await withTimeout("getOnboardingRedirectPath", 15_000, async () => {
    return getOnboardingRedirectPath(supabase, uid);
  });
  console.log("GUARD_STEP:getOnboardingRedirectPath");
  if (!onboarding.ok) {
    steps.push({ step: "getOnboardingRedirectPath", ...onboarding });
    printReport(steps, email, uid);
    return;
  }
  steps.push({
    step: "getOnboardingRedirectPath",
    ok: true,
    ms: onboarding.ms,
    detail: { onboardingPath: onboarding.result },
  });

  const getRole = await withTimeout("getRole", 15_000, async () => {
    return supabase.from("actor_profiles").select("role").eq("user_id", uid).maybeSingle();
  });
  console.log("GUARD_STEP:getRole");
  if (!getRole.ok) {
    steps.push({ step: "getRole", ...getRole });
    printReport(steps, email, uid);
    return;
  }
  steps.push({
    step: "getRole",
    ok: true,
    ms: getRole.ms,
    detail: { role: getRole.result.data?.role ?? null, error: getRole.result.error?.message ?? null },
  });

  const role = getRole.result.data?.role ?? null;
  const mismatch = studioRoleHomeMismatch(role, pathname);
  console.log("GUARD_STEP:ready");
  steps.push({
    step: "ready",
    ok: true,
    ms: 0,
    detail: { role, mismatch, wouldSetPhaseReady: !mismatch && Boolean(role) },
  });

  printReport(steps, email, uid);
}

function printReport(
  steps: Array<
    | { step: string; ok: true; ms: number; detail?: unknown }
    | { step: string; ok: false; ms: number; hung: true }
    | { step: string; ok: false; ms: number; error: string }
  >,
  email: string,
  uid: string
) {
  const completed = steps.filter((s) => s.ok);
  const lastOk = completed[completed.length - 1]?.step ?? null;
  const firstHung = steps.find((s) => !s.ok && "hung" in s && s.hung);
  const firstError = steps.find((s) => !s.ok && "error" in s);

  console.log(
    JSON.stringify(
      {
        email,
        uid,
        guardPath: steps.map((s) => s.step),
        lastSuccessfulStep: lastOk,
        firstNeverReached: firstHung
          ? firstHung.step
          : firstError
            ? firstError.step
            : null,
        hung: firstHung ? { step: firstHung.step, waitedMs: firstHung.ms } : null,
        error: firstError ?? null,
        steps,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error("GUARD_ERROR", e);
  process.exit(1);
});
