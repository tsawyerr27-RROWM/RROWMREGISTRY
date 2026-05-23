import { NextResponse } from "next/server";

import {
  COLLECTOR_VAULT_BUCKET,
  COLLECTOR_VAULT_ALLOWED_MIME,
  COLLECTOR_VAULT_MAX_BYTES,
  isVaultCategory,
  safeVaultFilename,
  textOnlyVaultCategories,
} from "@/lib/collector-vault";
import { vaultSessionContext } from "@/lib/collector-vault-api-helpers";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ registry_id: string }> }
) {
  const { registry_id } = await ctx.params;
  const { supabase, user, artworkId, flags } = await vaultSessionContext(registry_id);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!artworkId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!flags.canWrite) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const categoryRaw = String(form.get("category") || "").trim();
  if (!isVaultCategory(categoryRaw)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (textOnlyVaultCategories().includes(categoryRaw)) {
    return NextResponse.json(
      { error: "Use the note endpoint for this category." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const size = Number(file.size || 0);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }
  if (size > COLLECTOR_VAULT_MAX_BYTES) {
    return NextResponse.json({ error: "File too large." }, { status: 413 });
  }

  const mime = String(file.type || "").trim().toLowerCase();
  if (!COLLECTOR_VAULT_ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  }

  const titleRaw = String(form.get("title") || "").trim();
  const notesRaw = String(form.get("notes") || "").trim();
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = safeVaultFilename(file.name);
  const objectPath = `${artworkId}/${crypto.randomUUID()}-${filename}`;

  const service = createSupabaseServiceClient();
  const { error: upErr } = await service.storage
    .from(COLLECTOR_VAULT_BUCKET)
    .upload(objectPath, bytes, { contentType: mime, upsert: false });

  if (upErr) {
    console.error("[collector/vault upload]", upErr.message);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("collector_vault_items").insert({
    artwork_id: artworkId,
    uploaded_by: user.id,
    category: categoryRaw,
    title: titleRaw ? titleRaw : null,
    notes: notesRaw ? notesRaw : null,
    storage_path: objectPath,
    original_filename: file.name,
    mime_type: mime,
    byte_size: size,
  });

  if (insErr) {
    console.error("[collector/vault insert]", insErr.message);
    await service.storage.from(COLLECTOR_VAULT_BUCKET).remove([objectPath]);
    return NextResponse.json({ error: "Could not save vault entry." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
