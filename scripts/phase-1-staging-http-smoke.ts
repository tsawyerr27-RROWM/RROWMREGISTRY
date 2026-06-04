/**
 * Phase 1 PR6 — staging HTTP smoke (no DB): public routes + redirect matrix on deployed host.
 * Usage: STAGING_URL=https://rrowm-registry.vercel.app npx tsx scripts/phase-1-staging-http-smoke.ts
 */

const base = (process.env.STAGING_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(
  /\/$/,
  ""
);

type Row = { id: string; pass: boolean; detail: string };

const results: Row[] = [];

function pass(id: string, detail: string) {
  results.push({ id, pass: true, detail });
}
function fail(id: string, detail: string) {
  results.push({ id, pass: false, detail });
}

async function head(path: string): Promise<{ status: number; location: string | null }> {
  const res = await fetch(`${base}${path}`, { method: "HEAD", redirect: "manual" });
  return {
    status: res.status,
    location: res.headers.get("location"),
  };
}

async function get(path: string): Promise<number> {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  return res.status;
}

async function main() {
  if (!base) {
    console.log(JSON.stringify({ pass: false, error: "Set STAGING_URL" }, null, 2));
    process.exit(1);
  }

  const redirects: [string, string][] = [
    ["/collector-studio", "/studio/collector"],
    ["/institutional-studio-dashboard", "/studio/organisation"],
    ["/account", "/studio/account"],
    ["/personal-archive", "/studio/archive"],
    ["/dashboard", "/studio/creative"],
    ["/gallery-dashboard", "/studio/organisation"],
  ];

  for (const [from, to] of redirects) {
    const { status, location } = await head(from);
    const loc = location?.replace(base, "") ?? location;
    if ((status === 308 || status === 307 || status === 301 || status === 302) && loc === to) {
      pass(`redirect:${from}`, `${status} → ${to}`);
    } else {
      fail(`redirect:${from}`, `status=${status} location=${loc ?? "none"} expected=${to}`);
    }
  }

  const { status: studioStatus, location: studioLoc } = await head("/studio");
  if (studioLoc?.includes("/studio/creative")) {
    pass("redirect:/studio", `→ ${studioLoc}`);
  } else if (studioStatus === 200) {
    pass("redirect:/studio", "200 (layout guard SSR; R-01 static)");
  } else {
    fail("redirect:/studio", `status=${studioStatus} location=${studioLoc ?? "none"}`);
  }

  const publicPaths = ["/registry", "/login", "/about"];
  for (const p of publicPaths) {
    const s = await get(p);
    if (s === 200) pass(`RP-public:${p}`, `GET ${s}`);
    else fail(`RP-public:${p}`, `GET ${s}`);
  }

  const slugPaths = [
    "/collector-studio/test-slug-smoke",
    "/artist/test-artist-smoke",
    "/institutional-studio/test-gallery-smoke",
  ];
  for (const p of slugPaths) {
    const s = await get(p);
    if (s === 200 || s === 404) {
      pass(`RP-public:${p}`, `GET ${s} (no erroneous /studio redirect)`);
    } else if (s >= 300 && s < 400) {
      const { location } = await head(p);
      if (location?.includes("/studio/")) {
        fail(`RP-public:${p}`, `unexpected studio redirect ${location}`);
      } else {
        pass(`RP-public:${p}`, `GET ${s} redirect ${location ?? ""}`);
      }
    } else {
      fail(`RP-public:${p}`, `GET ${s}`);
    }
  }

  const failed = results.filter((r) => !r.pass);
  const report = {
    staging_url: base,
    gate: "phase-1-staging-http-smoke",
    pass: failed.length === 0,
    results,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
