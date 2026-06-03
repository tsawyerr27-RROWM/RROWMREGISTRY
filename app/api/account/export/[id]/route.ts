import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/account-lifecycle/auth-verify";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const service = createSupabaseServiceClient();

  const { data: row } = await service
    .from("data_export_requests")
    .select("id, user_id, status, export_payload, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.user_id !== auth.user.id) {
    return NextResponse.json({ error: "Export not found." }, { status: 404 });
  }

  if (row.status !== "ready" || !row.export_payload) {
    return NextResponse.json({ error: "Export not ready." }, { status: 400 });
  }

  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Export expired." }, { status: 410 });
  }

  const payload = row.export_payload as {
    json?: unknown;
    csv?: Record<string, string>;
  };

  return NextResponse.json({
    exportId: row.id,
    data: payload.json ?? null,
    csv: payload.csv ?? {},
    expiresAt: row.expires_at,
  });
}
