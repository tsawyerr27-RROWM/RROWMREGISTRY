/**
 * Temporary: capture StudioRouteGuard console logs on /studio/account.
 * Usage: npx tsx scripts/capture-guard-console.ts [port]
 */

import fs from "node:fs";
import path from "node:path";
import { chromium, type ConsoleMessage } from "playwright";
import { createClient } from "@supabase/supabase-js";

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

async function buildBrowserSession() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const artistId = process.env.VALIDATION_ARTIST_USER_ID?.trim();

  if (!url || !serviceKey || !anonKey || !artistId) {
    throw new Error("Missing Supabase env or VALIDATION_ARTIST_USER_ID");
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(artistId);
  if (userErr || !userData.user?.email) {
    throw new Error(`Could not load validation artist: ${userErr?.message ?? "no email"}`);
  }

  const email = userData.user.email;
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !linkData.properties?.email_otp) {
    throw new Error(`generateLink failed: ${linkErr?.message ?? "no otp"}`);
  }

  const browserAuth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: verifyData, error: verifyErr } = await browserAuth.auth.verifyOtp({
    email,
    token: linkData.properties.email_otp,
    type: "email",
  });
  if (verifyErr || !verifyData.session) {
    throw new Error(`verifyOtp failed: ${verifyErr?.message ?? "no session"}`);
  }

  const ref = new URL(url).hostname.split(".")[0];
  const storageKey = `sb-${ref}-auth-token`;
  const authModeKey = "rrowm_auth_storage_mode";

  return {
    storageKey,
    authModeKey,
    sessionPayload: JSON.stringify({
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token,
      expires_at: verifyData.session.expires_at,
      expires_in: verifyData.session.expires_in,
      token_type: verifyData.session.token_type,
      user: verifyData.session.user,
    }),
    email,
  };
}

async function main() {
  const port = process.argv[2] ?? "3000";
  const baseUrl = `http://127.0.0.1:${port}`;
  const target = `${baseUrl}/studio/account`;

  const { storageKey, authModeKey, sessionPayload, email } = await buildBrowserSession();
  const logs: string[] = [];
  const allConsole: string[] = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  await context.addInitScript(
    ({ storageKey, authModeKey, sessionPayload }) => {
      window.localStorage.setItem(authModeKey, "local");
      window.localStorage.setItem(storageKey, sessionPayload);
    },
    { storageKey, authModeKey, sessionPayload }
  );

  const page = await context.newPage();

  page.on("console", (msg: ConsoleMessage) => {
    const text = msg.text();
    allConsole.push(text);
    if (
      text.startsWith("GUARD_STEP:") ||
      text.startsWith("GUARD_PHASE") ||
      text.startsWith("GUARD_ERROR")
    ) {
      logs.push(text);
    }
  });

  await page.goto(target, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(20_000);

  const finalUrl = page.url();
  const bodyText = await page.locator("body").innerText();
  await browser.close();

  const guardSteps = logs.filter((l) => l.startsWith("GUARD_STEP:"));
  const lastStep = guardSteps[guardSteps.length - 1] ?? null;

  console.log(
    JSON.stringify(
      {
        target,
        email,
        finalUrl,
        guardLogs: logs,
        lastGuardStep: lastStep,
        guardPhaseLogs: logs.filter((l) => l.startsWith("GUARD_PHASE")),
        guardErrors: logs.filter((l) => l.startsWith("GUARD_ERROR")),
        bodySnippet: bodyText.slice(0, 800),
        allConsoleCount: allConsole.length,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
