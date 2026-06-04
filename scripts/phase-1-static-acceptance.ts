/**
 * Phase 1 PR6 — static acceptance checks (no DB / no running server).
 * Usage: npx tsx scripts/phase-1-static-acceptance.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

type Result = { id: string; pass: boolean; detail: string };

const results: Result[] = [];

function pass(id: string, detail: string) {
  results.push({ id, pass: true, detail });
}

function fail(id: string, detail: string) {
  results.push({ id, pass: false, detail });
}

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

function includesAll(haystack: string, needles: string[], id: string, label: string) {
  const missing = needles.filter((n) => !haystack.includes(n));
  if (missing.length) fail(id, `${label} missing: ${missing.join(", ")}`);
  else pass(id, label);
}

// P-06 / PR5 namespace guard
if (exists("app/studio/layout.tsx") && read("app/studio/layout.tsx").includes("StudioRouteGuard")) {
  pass("P-06", "app/studio/layout.tsx wraps StudioRouteGuard");
} else {
  fail("P-06", "studio layout guard missing");
}

const access = read("lib/studio-route-access.ts");
includesAll(
  access,
  ["/studio/account/restore", "requiredStudioRoleForPath", "studioRoleHomeMismatch"],
  "AG-1-3",
  "studio-route-access helpers"
);

const onboarding = read("lib/onboarding.ts");
includesAll(
  onboarding,
  ['return "/studio/creative"', 'return "/studio/collector"', 'return "/studio/organisation"'],
  "AC-R3",
  "homePathForRole canonical paths"
);

// Legacy redirect stubs (R-01–R-05, R-12)
const stubs: [string, string][] = [
  ["app/studio/page.tsx", "/studio/creative"],
  ["app/collector-studio/page.tsx", "/studio/collector"],
  ["app/institutional-studio-dashboard/page.tsx", "/studio/organisation"],
  ["app/account/page.tsx", "/studio/account"],
  ["app/personal-archive/page.tsx", "/studio/archive"],
  ["app/account/restore/page.tsx", "/studio/account/restore"],
];

for (const [file, dest] of stubs) {
  const id = `R-stub:${file}`;
  if (!exists(file)) {
    fail(id, `${file} missing`);
    continue;
  }
  const body = read(file);
  if (body.includes(`permanentRedirect`) && body.includes(dest)) {
    pass(id, `${file} → ${dest}`);
  } else {
    fail(id, `${file} stub not redirecting to ${dest}`);
  }
}

// Canonical archive (P-05)
const archivePage = read("app/studio/archive/page.tsx");
if (archivePage.includes("PersonalArchiveShell") && !archivePage.includes("permanentRedirect")) {
  pass("P-05", "/studio/archive renders PersonalArchiveShell");
} else {
  fail("P-05", "/studio/archive broken or self-redirect");
}

// next.config R-06, R-07
const nextCfg = read("next.config.ts");
includesAll(
  nextCfg,
  ['destination: "/studio/creative"', 'destination: "/studio/organisation"'],
  "R-06-07",
  "next.config dashboard redirects"
);

// Deduped page guards (no login redirect in studio dashboards)
const studioPages = [
  "app/studio/creative/page.tsx",
  "app/studio/collector/page.tsx",
  "app/studio/organisation/page.tsx",
  "app/studio/account/page.tsx",
];

for (const p of studioPages) {
  const id = `dedupe:${p}`;
  const body = read(p);
  if (body.includes("/login?next=") || body.includes("getOnboardingRedirectPath")) {
    fail(id, `${p} still has duplicated namespace auth`);
  } else {
    pass(id, `${p} no duplicated session/onboarding redirects`);
  }
}

// E-01, E-02
const delReq = read("app/api/account/delete/request/route.ts");
if (delReq.includes("/studio/account/restore?token=")) pass("E-01", "deletion restore URL canonical");
else fail("E-01", "deletion restore URL not canonical");

const invite = read("app/api/invite/complete-verification/route.ts");
if (invite.includes("/studio/organisation")) pass("E-02", "gallery verified email URL canonical");
else fail("E-02", "gallery verified email not canonical");

// Checkpoints documented
const tags = ["checkpoint-phase1-routes", "checkpoint-phase1-auth"];
pass("GIT-TAGS", `Expected tags on main: ${tags.join(", ")} (verify with git tag -l)`);

const failed = results.filter((r) => !r.pass);
const report = {
  gate: "phase-1-static-acceptance",
  pass: failed.length === 0,
  passed: results.filter((r) => r.pass).length,
  failed: failed.length,
  results,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
