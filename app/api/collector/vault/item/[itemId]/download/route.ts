import { NextResponse } from "next/server";

import { COLLECTOR_VAULT_BUCKET } from "@/lib/collector-vault";
import { getCollectorVaultFlags } from "@/lib/collector-vault-access";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function GET(
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
    .select("id, artwork_id, storage_path, original_filename")
    .eq("id", itemId)
    .maybeSingle();

  if (selErr || !row?.id || !row.artwork_id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const path = row.storage_path ? String(row.storage_path).trim() : "";
  if (!path) {
    return NextResponse.json({ error: "No file attached." }, { status: 400 });
  }

  const flags = await getCollectorVaultFlags(supabase, String(row.artwork_id));
  if (!flags.canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createSupabaseServiceClient();
  const { data: signed, error: signErr } = await service.storage
    .from(COLLECTOR_VAULT_BUCKET)
    .createSignedUrl(path, 120);

  if (signErr || !signed?.signedUrl) {
    console.error("[collector/vault download]", signErr?.message);
    return NextResponse.json({ error: "Could not prepare download." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
