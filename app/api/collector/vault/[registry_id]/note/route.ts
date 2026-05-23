import { NextResponse } from "next/server";

import { isVaultCategory, textOnlyVaultCategories } from "@/lib/collector-vault";
import { vaultSessionContext } from "@/lib/collector-vault-api-helpers";

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const obj = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const categoryRaw = String(obj.category ?? "").trim();
  if (!isVaultCategory(categoryRaw)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!textOnlyVaultCategories().includes(categoryRaw)) {
    return NextResponse.json(
      { error: "Notes in this category use file upload." },
      { status: 400 }
    );
  }
  const notes = String(obj.notes ?? "").trim();
  if (!notes) {
    return NextResponse.json({ error: "Notes are required." }, { status: 400 });
  }
  const titleRaw = String(obj.title ?? "").trim();

  const { error: insErr } = await supabase.from("collector_vault_items").insert({
    artwork_id: artworkId,
    uploaded_by: user.id,
    category: categoryRaw,
    title: titleRaw ? titleRaw : null,
    notes,
    storage_path: null,
    original_filename: null,
    mime_type: null,
    byte_size: null,
  });

  if (insErr) {
    console.error("[collector/vault note]", insErr.message);
    return NextResponse.json({ error: "Could not save note." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
