/** Debug browser session visibility for guard capture. */
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

async function main() {
  const port = process.argv[2] ?? "3001";
  const target = `http://127.0.0.1:${port}/studio/account`;
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
  const storageKey = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: verifyData.session!.access_token,
    refresh_token: verifyData.session!.refresh_token,
    expires_at: verifyData.session!.expires_at,
    expires_in: verifyData.session!.expires_in,
    token_type: verifyData.session!.token_type,
    user: verifyData.session!.user,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(
    ({ storageKey, payload }) => {
      localStorage.setItem("rrowm_auth_storage_mode", "local");
      localStorage.setItem(storageKey, payload);
      const original = window.location.replace.bind(window.location);
      window.location.replace = ((href: string) => {
        console.log("GUARD_REDIRECT_BLOCKED", href);
      }) as typeof window.location.replace;
    },
    { storageKey, payload }
  );
  const page = await context.newPage();
  const logs: string[] = [];
  page.on("console", (m) => {
    const t = m.text();
    logs.push(t);
  });

  await page.goto(target, { waitUntil: "load", timeout: 120000 });

  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const body = await page.locator("body").innerText();
    if (body.includes("LOADING_SOURCE") || body.includes("GUARD_STEP")) break;
  }

  const diag = await page.evaluate(({ storageKey }) => {
    const stored = localStorage.getItem(storageKey);
    let parsedUserId: string | null = null;
    try {
      parsedUserId = stored ? JSON.parse(stored)?.user?.id ?? null : null;
    } catch {
      parsedUserId = null;
    }
    return {
      storedLen: stored?.length ?? 0,
      parsedUserId,
      bodyHasLoadingSource: document.body.innerText.includes("LOADING_SOURCE"),
      loadingSourceText: (document.body.innerText.match(/LOADING_SOURCE:[A-Za-z]+/) ?? [])[0] ?? null,
      url: location.href,
      title: document.title,
    };
  }, { storageKey });

  await browser.close();
  console.log(
    JSON.stringify(
      {
        diag,
        guardLogs: logs.filter((l) => l.startsWith("GUARD_")),
        allLogs: logs.slice(0, 50),
      },
      null,
      2
    )
  );
}

main().catch(console.error);
