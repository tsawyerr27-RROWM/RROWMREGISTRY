import { NextResponse } from "next/server";

import {
  markNotificationRead,
  NOTIFICATIONS_SCHEMA_UNAVAILABLE,
} from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const notificationId = String(id ?? "").trim();
  if (!notificationId) {
    return NextResponse.json({ error: "Missing notification id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await markNotificationRead(supabase, {
    userId: user.id,
    notificationId,
  });

  if (!result.ok) {
    if (result.error === "Notification not found.") {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    if (result.error.toLowerCase().includes("notifications")) {
      return NextResponse.json(
        { error: NOTIFICATIONS_SCHEMA_UNAVAILABLE, schemaUnavailable: true },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ notification: result.notification });
}
