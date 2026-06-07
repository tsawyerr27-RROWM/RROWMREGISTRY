/** Long-run guard step capture in real browser. */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function buildSession() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  const artistId = process.env.VALIDATION_ARTIST_USER_ID!.trim();
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData } = await admin.auth.admin.getUserById(artistId);
  const email = userData.user!.email!;
  const { data: linkData } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: verifyData } = await supabase.auth.verifyOtp({
    email,
    token: linkData.properties!.email_otp!,
    type: "email",
  });
  const ref = new URL(url).hostname.split(".")[0];
  return {
    email,
    uid: verifyData.session!.user.id,
    storageKey: `sb-${ref}-auth-token`,
    payload: JSON.stringify({
      access_token: verifyData.session!.access_token,
      refresh_token: verifyData.session!.refresh_token,
      expires_at: verifyData.session!.expires_at,
      expires_in: verifyData.session!.expires_in,
      token_type: verifyData.session!.token_type,
      user: verifyData.session!.user,
    }),
  };
}

async function main() {
  const port = process.argv[2] ?? "3001";
  const target = `http://127.0.0.1:${port}/studio/account`;
  const session = await buildSession();
  const timeline: Array<{ t: number; msg: string }> = [];
  const t0 = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(
    ({ storageKey, payload }) => {
      localStorage.setItem("rrowm_auth_storage_mode", "local");
      localStorage.setItem(storageKey, payload);
    },
    { storageKey: session.storageKey, payload: session.payload }
  );

  const page = await context.newPage();
  page.on("console", (m) => {
    const text = m.text();
    if (text.startsWith("GUARD_")) timeline.push({ t: Date.now() - t0, msg: text });
  });

  await page.goto(target, { waitUntil: "networkidle", timeout: 180000 });
  await page.waitForTimeout(45_000);

  const body = await page.locator("body").innerText();
  await browser.close();

  const steps = timeline.filter((e) => e.msg.startsWith("GUARD_STEP:"));
  console.log(
    JSON.stringify(
      {
        target,
        email: session.email,
        uid: session.uid,
        timeline,
        lastGuardStep: steps[steps.length - 1] ?? null,
        loadingSource: (body.match(/LOADING_SOURCE:[A-Za-z]+/) ?? [])[0] ?? null,
        phaseLogs: timeline.filter((e) => e.msg.startsWith("GUARD_PHASE")),
      },
      null,
      2
    )
  );
}

main().catch(console.error);
