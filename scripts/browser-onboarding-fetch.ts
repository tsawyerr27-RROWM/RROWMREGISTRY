/** Log onboarding sub-steps from browser context. */
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
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
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
  const uid = verifyData.session!.user.id;
  const accessToken = verifyData.session!.access_token;
  const ref = new URL(url).hostname.split(".")[0];
  const storageKey = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: accessToken,
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
    },
    { storageKey, payload }
  );
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3001/", { waitUntil: "domcontentloaded" });

  const result = await page.evaluate(
    async ({ url, anonKey, uid }) => {
      const timeline: string[] = [];
      const headers = {
        apikey: anonKey,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem(
          Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token")) ?? ""
        )!).access_token}`,
      };

      timeline.push("browserFetch:actor_profiles:start");
      const actorRes = await Promise.race([
        fetch(
          `${url}/rest/v1/actor_profiles?select=role,onboarding_complete&user_id=eq.${uid}`,
          { headers: { ...headers, Accept: "application/json" } }
        ),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT actor_profiles")), 15000)
        ),
      ]);
      timeline.push(`browserFetch:actor_profiles:${actorRes.status}`);

      timeline.push("browserFetch:artists:start");
      const artistRes = await Promise.race([
        fetch(`${url}/rest/v1/artists?select=id&id=eq.${uid}`, {
          headers: { ...headers, Accept: "application/json" },
        }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT artists")), 15000)
        ),
      ]);
      timeline.push(`browserFetch:artists:${artistRes.status}`);

      return timeline;
    },
    { url, anonKey, uid }
  );

  await browser.close();
  console.log(JSON.stringify({ uid, email, result }, null, 2));
}

main().catch(console.error);
