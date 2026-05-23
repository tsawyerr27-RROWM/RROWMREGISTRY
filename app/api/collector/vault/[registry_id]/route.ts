import { NextResponse } from "next/server";

import {
  isVaultCategory,
  vaultCategoryLabel,
  type CollectorVaultCategory,
} from "@/lib/collector-vault";
import { vaultSessionContext } from "@/lib/collector-vault-api-helpers";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
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
  if (!flags.canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from("collector_vault_items")
    .select(
      "id, category, title, notes, storage_path, original_filename, mime_type, byte_size, created_at, uploaded_by"
    )
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[collector/vault list]", error.message);
    return NextResponse.json({ error: "Could not load vault." }, { status: 500 });
  }

  const items = (rows || []).map((r: Record<string, unknown>) => {
    const cat = isVaultCategory(r.category) ? r.category : "other";
    const path = r.storage_path ? String(r.storage_path) : "";
    const hasFile = Boolean(path?.trim());
    return {
      id: String(r.id),
      category: cat,
      categoryLabel: vaultCategoryLabel(cat as CollectorVaultCategory),
      title: r.title != null ? String(r.title) : null,
      notes: r.notes != null ? String(r.notes) : null,
      hasFile,
      originalFilename: r.original_filename != null ? String(r.original_filename) : null,
      mimeType: r.mime_type != null ? String(r.mime_type) : null,
      byteSize: r.byte_size != null ? Number(r.byte_size) : null,
      createdAt: String(r.created_at || ""),
      deletable:
        flags.canWrite &&
        String(r.uploaded_by || "") === user.id,
    };
  });

  return NextResponse.json({ ok: true, canWrite: flags.canWrite, items });
}
