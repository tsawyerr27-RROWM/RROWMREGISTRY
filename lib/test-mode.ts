/**
 * Pre-launch QA only. When disabled (default), test APIs and UI stay off in production.
 */
export function testModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === "true";
}
