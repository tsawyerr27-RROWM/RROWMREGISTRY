import { createClient } from "@supabase/supabase-js";
import { sha256Hex } from "@/lib/hash";

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
    const msg = error.message ?? "Certificate could not be filed";
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

  // Best-effort: anchor certificate hash for later audit / disclosure.
  try {
    const { data: certRow } = await supabase
      .from("certificates")
      .select("id, certificate_hash, issued_at")
      .eq("artwork_id", artworkId)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const certId = certRow?.id ? String(certRow.id) : null;
    const certHash = String(certRow?.certificate_hash || certificate_hash).trim();
    if (certId && certHash) {
      await supabase.from("record_anchors").insert({
        record_type: "certificate",
        record_id: certId,
        hash: /^[0-9a-f]{64}$/i.test(certHash)
          ? certHash
          : sha256Hex(certHash),
        anchored_at: new Date().toISOString(),
      });
    }
  } catch {
    // ignore anchoring failures
  }

  return { ok: true, created, certificate_hash };
}
