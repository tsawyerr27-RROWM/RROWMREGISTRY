/**
 * Read Resend API key from env with common .env.local mistakes fixed
 * (leading/trailing whitespace, accidental wrapping quotes).
 */
export function readResendApiKey(): string {
  const raw = process.env.RESEND_API_KEY;
  if (!raw) return "";
  let t = raw.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}
