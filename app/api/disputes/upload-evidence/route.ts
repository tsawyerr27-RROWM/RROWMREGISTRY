import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

const BUCKET = "dispute-evidence";
const MAX_BYTES = 15 * 1024 * 1024; // 15MB (matches migration bucket limit)

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeFilename(raw: string): string {
  const base = String(raw || "file").trim() || "file";
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
  if (!cleaned || cleaned === "." || cleaned === "..") return "file";
  if (cleaned.includes("..")) return "file";
  return cleaned.replace(/^\.+/, "file");
}

/**
 * Uploads a file to private Supabase Storage (dispute-evidence bucket).
 * Returns an object path (file_url) to be attached via POST /api/disputes/add-evidence.
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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const disputeId = String(form.get("dispute_id") || "").trim();
  const file = form.get("file");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(disputeId)) {
    return NextResponse.json({ error: "Missing dispute_id." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const size = Number(file.size || 0);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }
  if (size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 15MB)." },
      { status: 413 }
    );
  }

  const mime = String(file.type || "").trim().toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      { error: "Unsupported file type." },
      { status: 415 }
    );
  }

  // Only the dispute creator may upload evidence.
  const { data: disputeRow, error: dErr } = await supabase
    .from("disputes")
    .select("id")
    .eq("id", disputeId)
    .maybeSingle();
  if (dErr || !disputeRow?.id) {
    return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = safeFilename(file.name);
  const objectPath = `${disputeId}/${crypto.randomUUID()}-${filename}`;

  const service = createSupabaseServiceClient();
  const { error: upErr } = await service.storage
    .from(BUCKET)
    .upload(objectPath, bytes, { contentType: mime, upsert: false });

  if (upErr) {
    console.error("[disputes/upload-evidence]", upErr.message);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    file_url: objectPath,
    content_type: mime,
    size,
    filename,
  });
}

