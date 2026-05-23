import { NextResponse } from "next/server";

import { isDisputeStatus } from "@/lib/disputes";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

async function assertArtistAdmin(
  service: ReturnType<typeof createSupabaseServiceClient>,
  userId: string
): Promise<boolean> {
  const { data } = await service
    .from("artists")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.is_admin);
}

/** Manual dispute status updates (registry admin). */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: disputeId } = await ctx.params;
  const cleanId = disputeId?.trim();
  if (!cleanId) {
    return NextResponse.json({ error: "Missing dispute id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rec = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const statusRaw =
    typeof rec.status === "string" ? rec.status.trim().toLowerCase() : "";
  const resolution =
    typeof rec.resolution === "string" ? rec.resolution.trim() : null;

  if (!isDisputeStatus(statusRaw)) {
    return NextResponse.json(
      { error: "Invalid status." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const isAdmin = await assertArtistAdmin(service, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isTerminal = statusRaw === "resolved" || statusRaw === "rejected";

  const patch: Record<string, unknown> = {
    status: statusRaw,
    resolution: resolution && resolution.length > 0 ? resolution : null,
    resolved_at: isTerminal ? new Date().toISOString() : null,
  };

  const { data: row, error: updErr } = await service
    .from("disputes")
    .update(patch)
    .eq("id", cleanId)
    .select("id, status, resolution, resolved_at, target_type, target_id")
    .maybeSingle();

  if (updErr || !row) {
    console.error("[admin/disputes]", updErr);
    return NextResponse.json(
      { error: "Dispute not found or could not update." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, dispute: row });
}
