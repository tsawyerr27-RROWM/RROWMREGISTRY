/**
 * Run all unit tests under lib/ via node:test.
 * Usage: npx tsx scripts/run-unit-tests.ts
 */

import { spawnSync } from "node:child_process";
import { globSync } from "glob";

const files = globSync("lib/**/*.test.ts").sort();

if (files.length === 0) {
  console.error("No test files found under lib/");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...files],
  { stdio: "inherit" }
);

process.exit(result.status ?? 1);
