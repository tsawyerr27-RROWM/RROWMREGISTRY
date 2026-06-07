/**
 * Capture guard logs without losing them on hardRedirect (override replace).
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
  if (!url || !serviceKey || !anonKey || !artistId) throw new Error("Missing env");

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData } = await admin.auth.admin.getUserById(artistId);
  const email = userData.user?.email;
  if (!email) throw new Error("no email");

  const { data: linkData } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const otp = linkData?.properties?.email_otp;
  if (!otp) throw new Error("no otp");

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: verifyData, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });
  if (error || !verifyData.session) throw new Error(error?.message ?? "verify failed");

  const ref = new URL(url).hostname.split(".")[0];
  return {
    email,
    storageKey: `sb-${ref}-auth-token`,
    authModeKey: "rrowm_auth_storage_mode",
    sessionPayload: JSON.stringify({
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token,
      expires_at: verifyData.session.expires_at,
      expires_in: verifyData.session.expires_in,
      token_type: verifyData.session.token_type,
      user: verifyData.session.user,
    }),
  };
}

async function main() {
  const port = process.argv[2] ?? "3000";
  const target = `http://127.0.0.1:${port}/studio/account`;
  const session = await buildBrowserSession();
  const logs: string[] = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(
    ({ storageKey, authModeKey, sessionPayload }) => {
      window.localStorage.setItem(authModeKey, "local");
      window.localStorage.setItem(storageKey, sessionPayload);
      const original = window.location.replace.bind(window.location);
      window.location.replace = ((href: string) => {
        console.log("GUARD_REDIRECT_BLOCKED", href);
      }) as typeof window.location.replace;
    },
    session
  );

  const page = await context.newPage();
  page.on("console", (msg: ConsoleMessage) => {
    const text = msg.text();
    if (text.startsWith("GUARD_")) logs.push(text);
  });

  await page.goto(target, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(25_000);

  const body = await page.locator("body").innerText();
  await browser.close();

  const steps = logs.filter((l) => l.startsWith("GUARD_STEP:"));
  console.log(
    JSON.stringify(
      {
        target,
        email: session.email,
        logs,
        lastGuardStep: steps[steps.length - 1] ?? null,
        bodySnippet: body.slice(0, 400),
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
