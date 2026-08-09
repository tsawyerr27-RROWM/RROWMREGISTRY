import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { authorizeCronRequest } from "@/lib/cron-auth";

/** Expire stale export download links. */
export async function POST(req: Request) {
  if (!authorizeCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("data_export_requests")
    .update({ status: "expired", export_payload: null })
    .eq("status", "ready")
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ expired: data?.length ?? 0 });
}

export async function GET(req: Request) {
  return POST(req);
}
