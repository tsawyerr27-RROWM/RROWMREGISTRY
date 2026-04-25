/**
 * Supabase RPC errors often stringify poorly in devtools / Turbopack (e.g. `{}`).
 * Prefer message, code, details, hint for actionable logs.
 */
/** True when PostgREST/Postgres reports unique_violation (HTTP 409 for duplicates). */
export function isPostgresUniqueViolation(error: unknown): boolean {
  if (error == null || typeof error !== "object") return false;
  const c = (error as Record<string, unknown>).code;
  return c === "23505" || c === 23505;
}

export function summarizeRpcError(error: unknown): string {
  if (error == null) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error !== "object") return String(error);
  const e = error as Record<string, unknown>;
  const parts = [e.message, e.code, e.details, e.hint].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  if (parts.length) return parts.join(" | ");
  try {
    const s = JSON.stringify(error);
    return s === "{}" ? "RPC error (no enumerable fields)" : s;
  } catch {
    return String(error);
  }
}

/** Log RPC failures in development only; avoids noisy `{}` in the console. */
export function warnSupabaseRpc(scope: string, error: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  const msg = summarizeRpcError(error);
  if (!msg) return;
  console.warn(`[${scope}]`, msg);
}
