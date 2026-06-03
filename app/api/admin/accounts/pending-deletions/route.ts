import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export async function GET(req: Request) {
  const admin = await requireAdminApi(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("actor_profiles")
    .select(
      "user_id, role, display_name, account_status, deletion_scheduled_at, deletion_reason, deletion_notification_email, deactivated_at, deleted_at"
    )
    .in("account_status", ["pending_deletion", "deactivated"])
    .order("deletion_scheduled_at", { ascending: true, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
