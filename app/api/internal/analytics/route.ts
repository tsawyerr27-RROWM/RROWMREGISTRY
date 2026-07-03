import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-admin-auth";

export const runtime = "nodejs";

type CountRow = { event_name: string; count: number };

function startOfTodayUtc(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
}

/** Internal analytics aggregates for /internal/analytics. */
export async function GET(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { service } = auth.ctx;
  const todayStart = startOfTodayUtc();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    eventCountsRes,
    signupsTodayRes,
    activeUsersRes,
    funnelRes,
    registryHealthRes,
    fieldUsageRes,
    dealsRes,
    errorsRes,
    recentErrorsRes,
  ] = await Promise.all([
    service
      .from("telemetry_events")
      .select("event_name")
      .gte("created_at", sevenDaysAgo),
    service
      .from("telemetry_events")
      .select("id", { count: "exact", head: true })
      .eq("event_name", "signup_completed")
      .gte("created_at", todayStart),
    service
      .from("telemetry_events")
      .select("user_id")
      .gte("created_at", sevenDaysAgo)
      .not("user_id", "is", null),
    service
      .from("telemetry_events")
      .select("event_name")
      .in("event_name", [
        "signup_started",
        "signup_completed",
        "artwork_registered",
        "artwork_self_attested",
        "verification_completed",
      ])
      .gte("created_at", sevenDaysAgo),
    service
      .from("artworks")
      .select("verification_status"),
    service
      .from("telemetry_events")
      .select("event_name")
      .in("event_name", [
        "field_search",
        "field_record_opened",
        "opportunity_opened",
        "opportunity_applied",
      ])
      .gte("created_at", sevenDaysAgo),
    Promise.all([
      service
        .from("deals")
        .select("id", { count: "exact", head: true })
        .in("status", ["proposed", "under_review", "countered", "accepted"]),
      service
        .from("provenance_transfers")
        .select("id", { count: "exact", head: true })
        .in("status", ["initiated", "pending_acceptance"]),
      service
        .from("ownership_events")
        .select("id", { count: "exact", head: true })
        .eq("transfer_type", "collector_claim")
        .eq("verification_status", "claimed"),
    ]),
    service
      .from("runtime_errors")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    service
      .from("runtime_errors")
      .select(
        "id, created_at, surface, route, error_name, message"
      )
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const eventCounts = new Map<string, number>();
  for (const row of eventCountsRes.data ?? []) {
    const name = String(row.event_name ?? "");
    eventCounts.set(name, (eventCounts.get(name) ?? 0) + 1);
  }

  const funnelCounts = new Map<string, number>();
  for (const row of funnelRes.data ?? []) {
    const name = String(row.event_name ?? "");
    funnelCounts.set(name, (funnelCounts.get(name) ?? 0) + 1);
  }

  const fieldCounts = new Map<string, number>();
  for (const row of fieldUsageRes.data ?? []) {
    const name = String(row.event_name ?? "");
    fieldCounts.set(name, (fieldCounts.get(name) ?? 0) + 1);
  }

  const uniqueUsers = new Set(
    (activeUsersRes.data ?? [])
      .map((r) => String(r.user_id ?? ""))
      .filter(Boolean)
  );

  const registryHealth = {
    filed: 0,
    self_attested: 0,
    verified: 0,
    pending_verification: 0,
  };
  for (const row of registryHealthRes.data ?? []) {
    const status = String(row.verification_status ?? "").toLowerCase();
    if (status === "filed") registryHealth.filed += 1;
    else if (status === "self_attested") registryHealth.self_attested += 1;
    else if (status === "verified") registryHealth.verified += 1;
  }
  registryHealth.pending_verification =
    registryHealth.filed + registryHealth.self_attested;

  const [dealsOpenRes, transfersActiveRes, claimsPendingRes] = dealsRes;

  const topEvents: CountRow[] = [...eventCounts.entries()]
    .map(([event_name, count]) => ({ event_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    signups_today: signupsTodayRes.count ?? 0,
    active_users_7d: uniqueUsers.size,
    top_events: topEvents,
    funnel: {
      signup_started: funnelCounts.get("signup_started") ?? 0,
      signup_completed: funnelCounts.get("signup_completed") ?? 0,
      artwork_registered: funnelCounts.get("artwork_registered") ?? 0,
      artwork_self_attested: funnelCounts.get("artwork_self_attested") ?? 0,
      verification_completed: funnelCounts.get("verification_completed") ?? 0,
    },
    registry_health: registryHealth,
    field_usage: {
      searches: fieldCounts.get("field_search") ?? 0,
      records_viewed: fieldCounts.get("field_record_opened") ?? 0,
      opportunities_viewed: fieldCounts.get("opportunity_opened") ?? 0,
      applications: fieldCounts.get("opportunity_applied") ?? 0,
    },
    deals: {
      open: dealsOpenRes.count ?? 0,
      transfers_active: transfersActiveRes.count ?? 0,
      claims_pending: claimsPendingRes.count ?? 0,
    },
    errors: {
      count_7d: errorsRes.count ?? 0,
      recent: recentErrorsRes.data ?? [],
    },
  });
}
