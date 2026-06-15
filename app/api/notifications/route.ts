import { NextResponse } from "next/server";

import {
  listNotifications,
  markAllNotificationsRead,
  NOTIFICATIONS_DEFAULT_LIMIT,
  NOTIFICATIONS_MAX_LIMIT,
  NOTIFICATIONS_SCHEMA_UNAVAILABLE,
} from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function parseLimit(raw: string | null): number {
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return NOTIFICATIONS_DEFAULT_LIMIT;
  }
  return Math.min(parsed, NOTIFICATIONS_MAX_LIMIT);
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = parseLimit(url.searchParams.get("limit"));

  const result = await listNotifications(supabase, user.id, { limit });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    notifications: result.notifications,
    unreadCount: result.unreadCount,
  });
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await markAllNotificationsRead(supabase, user.id);
  if (!result.ok) {
    if (result.error.toLowerCase().includes("notifications")) {
      return NextResponse.json(
        { error: NOTIFICATIONS_SCHEMA_UNAVAILABLE, schemaUnavailable: true },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ updatedCount: result.updatedCount });
}
