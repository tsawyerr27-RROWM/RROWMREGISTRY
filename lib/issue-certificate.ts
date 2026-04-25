import { createClient } from "@supabase/supabase-js";

/**
 * Server-only: issues a `certificates` row for a verified artwork (idempotent).
 * Call when `verification_status === "verified"` — same rules as POST /api/issue-certificate.
 */
export type IssueCertificateResult =
  | { ok: true; created: boolean; certificate_hash: string }
  | {
      ok: false;
      error: string;
      code:
        | "config"
        | "not_found"
        | "not_verified"
        | "no_registry_id"
        | "missing_rpc"
        | "db";
    };

export async function issueCertificateForVerifiedArtwork(
  artworkId: string
): Promise<IssueCertificateResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return {
      ok: false,
      error: "Server misconfiguration: missing Supabase credentials",
      code: "config",
    };
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase.rpc(
    "issue_certificate_for_verified_artwork",
    { p_artwork_id: artworkId }
  );

  if (error) {
    const msg = error.message ?? "Failed to issue certificate";
    if (String(error.code) === "PGRST202") {
      return { ok: false, error: msg, code: "missing_rpc" };
    }
    if (msg.toLowerCase().includes("not found")) {
      return { ok: false, error: msg, code: "not_found" };
    }
    if (msg.toLowerCase().includes("not verified")) {
      return { ok: false, error: msg, code: "not_verified" };
    }
    if (msg.toLowerCase().includes("registry id")) {
      return { ok: false, error: msg, code: "no_registry_id" };
    }
    return { ok: false, error: msg, code: "db" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const created = Boolean(row?.created);
  const certificate_hash = String(row?.certificate_hash ?? "");
  if (!certificate_hash) {
    return {
      ok: false,
      error: "Certificate issuance succeeded but hash was missing",
      code: "db",
    };
  }

  return { ok: true, created, certificate_hash };
}
