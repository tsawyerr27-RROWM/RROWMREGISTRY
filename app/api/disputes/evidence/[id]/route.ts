import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { shortHex } from "@/lib/hash";

export const runtime = "nodejs";

const BUCKET = "dispute-evidence";
const SIGNED_URL_TTL_SECONDS = 600;

/** Evidence list for a dispute (creator only). Includes signed URLs for private files. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const disputeId = String(id || "").trim();
  if (!disputeId) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Confirm the dispute belongs to the caller (RLS).
  const { data: disputeRow } = await supabase
    .from("disputes")
    .select("id")
    .eq("id", disputeId)
    .maybeSingle();
  if (!disputeRow?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: rows, error } = await supabase
    .from("dispute_evidence")
    .select(
      "id, created_at, dispute_id, type, file_url, file_hash, external_url, description, verified"
    )
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[disputes/evidence]", error.message);
    return NextResponse.json({ error: "Could not load evidence." }, { status: 500 });
  }

  const service = createSupabaseServiceClient();

  const evidenceIds = (rows || []).map((r) => String(r.id)).filter(Boolean);
  const { data: anchors } = evidenceIds.length
    ? await service
        .from("record_anchors")
        .select("record_id, hash")
        .eq("record_type", "evidence")
        .in("record_id", evidenceIds)
    : { data: [] as { record_id: string; hash: string }[] };

  const anchorByEvidenceId = new Map<string, string>();
  for (const a of anchors || []) {
    const rid = String((a as any).record_id || "");
    const h = String((a as any).hash || "");
    if (rid && h && !anchorByEvidenceId.has(rid)) anchorByEvidenceId.set(rid, h);
  }

  const evidence = await Promise.all(
    (rows || []).map(async (r) => {
      const fileUrl = r.file_url ? String(r.file_url) : null;
      let signedUrl: string | null = null;
      if (fileUrl) {
        const { data } = await service.storage
          .from(BUCKET)
          .createSignedUrl(fileUrl, SIGNED_URL_TTL_SECONDS);
        signedUrl = data?.signedUrl ?? null;
      }
      const recordHash =
        anchorByEvidenceId.get(String(r.id)) ||
        (r.file_hash ? String(r.file_hash) : null);

      return {
        id: r.id,
        created_at: r.created_at,
        dispute_id: r.dispute_id,
        type: r.type,
        file_url: fileUrl,
        file_hash: r.file_hash ? String(r.file_hash) : null,
        signed_url: signedUrl,
        external_url: r.external_url ? String(r.external_url) : null,
        description: r.description ? String(r.description) : null,
        verified: Boolean(r.verified),
        record_fingerprint: recordHash,
        record_fingerprint_short: recordHash ? shortHex(recordHash, 8, 8) : null,
      };
    })
  );

  return NextResponse.json({ ok: true, evidence });
}

