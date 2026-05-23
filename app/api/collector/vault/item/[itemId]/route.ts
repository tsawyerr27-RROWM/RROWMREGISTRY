import { NextResponse } from "next/server";

import { COLLECTOR_VAULT_BUCKET } from "@/lib/collector-vault";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await ctx.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: row, error: selErr } = await supabase
    .from("collector_vault_items")
    .select("id, storage_path")
    .eq("id", itemId)
    .maybeSingle();

  if (selErr || !row?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const path = row.storage_path ? String(row.storage_path).trim() : "";

  const { error: delErr } = await supabase.from("collector_vault_items").delete().eq("id", itemId);
  if (delErr) {
    console.error("[collector/vault delete row]", delErr.message);
    const forbidden =
      delErr.code === "42501" ||
      /permission denied|rls|policy/i.test(delErr.message || "");
    return NextResponse.json(
      { error: "Could not remove entry." },
      { status: forbidden ? 403 : 500 }
    );
  }

  if (path) {
    try {
      const service = createSupabaseServiceClient();
      await service.storage.from(COLLECTOR_VAULT_BUCKET).remove([path]);
    } catch (e) {
      console.error("[collector/vault delete storage]", e);
    }
  }

  return NextResponse.json({ ok: true });
}
