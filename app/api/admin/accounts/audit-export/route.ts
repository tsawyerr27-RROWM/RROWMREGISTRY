import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export async function GET(req: Request) {
  const admin = await requireAdminApi(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const url = new URL(req.url);
  const subjectUserId = url.searchParams.get("user_id")?.trim();

  const service = createSupabaseServiceClient();
  let query = service
    .from("account_audit_log")
    .select("id, subject_user_id, actor_user_id, event_type, ip, user_agent, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (subjectUserId) {
    query = query.eq("subject_user_id", subjectUserId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const header = [
    "id",
    "subject_user_id",
    "actor_user_id",
    "event_type",
    "ip",
    "user_agent",
    "created_at",
  ];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      header
        .map((k) => {
          const v = r[k as keyof typeof r];
          const s = v == null ? "" : String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="account-audit-export.csv"',
    },
  });
}
