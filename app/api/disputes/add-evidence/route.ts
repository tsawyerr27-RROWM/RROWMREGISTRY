import { NextResponse } from "next/server";

import { sha256Hex } from "@/lib/hash";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

const EVIDENCE_TYPES = ["document", "image", "certificate", "external_link"] as const;
type EvidenceType = (typeof EVIDENCE_TYPES)[number];
const BUCKET = "dispute-evidence";

function isEvidenceType(v: string): v is EvidenceType {
  return (EVIDENCE_TYPES as readonly string[]).includes(v);
}

function isHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Append-only evidence metadata attachment to a dispute.
 * - For external_link: requires external_url
 * - For file types: requires file_url (object path in dispute-evidence bucket)
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const disputeId = String(rec.dispute_id ?? rec.disputeId ?? "").trim();
  const typeRaw = String(rec.type ?? "").trim().toLowerCase();
  const fileUrl = typeof rec.file_url === "string" ? rec.file_url.trim() : "";
  const externalUrl =
    typeof rec.external_url === "string" ? rec.external_url.trim() : "";
  const description =
    typeof rec.description === "string" ? rec.description.trim().slice(0, 2000) : null;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(disputeId)) {
    return NextResponse.json({ error: "Missing dispute_id." }, { status: 400 });
  }
  if (!isEvidenceType(typeRaw)) {
    return NextResponse.json({ error: "Invalid evidence type." }, { status: 400 });
  }

  if (typeRaw === "external_link") {
    if (!externalUrl || !isHttpUrl(externalUrl)) {
      return NextResponse.json(
        { error: "Provide a valid external_url (http/https)." },
        { status: 400 }
      );
    }
  } else {
    if (!fileUrl || fileUrl.includes("..")) {
      return NextResponse.json(
        { error: "Missing file_url." },
        { status: 400 }
      );
    }
    if (!fileUrl.startsWith(`${disputeId}/`)) {
      return NextResponse.json(
        { error: "Invalid file_url for this dispute." },
        { status: 400 }
      );
    }
  }

  // Only the dispute creator may attach evidence (per RLS).
  const { data: disputeRow, error: dErr } = await supabase
    .from("disputes")
    .select("id")
    .eq("id", disputeId)
    .maybeSingle();
  if (dErr || !disputeRow?.id) {
    return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
  }

  const service = createSupabaseServiceClient();

  let fileHash: string | null = null;
  if (typeRaw !== "external_link") {
    const { data: dl, error: dlErr } = await service.storage
      .from(BUCKET)
      .download(fileUrl);
    if (dlErr || !dl) {
      return NextResponse.json(
        { error: "Could not read uploaded file." },
        { status: 400 }
      );
    }
    const bytes = Buffer.from(await dl.arrayBuffer());
    fileHash = sha256Hex(bytes);
  }

  const { data: row, error: insErr } = await supabase
    .from("dispute_evidence")
    .insert({
      dispute_id: disputeId,
      submitted_by: user.id,
      type: typeRaw,
      file_url: typeRaw === "external_link" ? null : fileUrl,
      file_hash: typeRaw === "external_link" ? null : fileHash,
      external_url: typeRaw === "external_link" ? externalUrl : null,
      description: description && description.length > 0 ? description : null,
      verified: false,
    })
    .select(
      "id, created_at, dispute_id, type, file_url, file_hash, external_url, description, verified"
    )
    .single();

  if (insErr || !row) {
    console.error("[disputes/add-evidence]", insErr);
    return NextResponse.json({ error: "Could not attach evidence." }, { status: 500 });
  }

  const anchorHash =
    typeRaw === "external_link"
      ? sha256Hex(
          JSON.stringify({
            type: "external_link",
            external_url: externalUrl,
            description: description && description.length > 0 ? description : null,
          })
        )
      : (fileHash as string);

  // Best-effort: anchor row (service role only; no public disclosure).
  const { error: aErr } = await service
    .from("record_anchors")
    .insert({
      record_type: "evidence",
      record_id: row.id,
      hash: anchorHash,
      anchored_at: new Date().toISOString(),
    });
  if (aErr) {
    console.warn("[disputes/add-evidence] anchor", aErr.message);
  }

  return NextResponse.json({ ok: true, evidence: row });
}

