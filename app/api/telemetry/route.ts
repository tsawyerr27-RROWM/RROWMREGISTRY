import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  isTelemetryEventName,
  type TelemetrySurface,
  writeTelemetryEvent,
} from "@/lib/telemetry";

export const runtime = "nodejs";

type TelemetryBody = {
  event_name?: string;
  surface?: string;
  session_id?: string | null;
  actor_role?: string | null;
  metadata?: Record<string, unknown>;
};

const SURFACES = new Set<string>([
  "auth",
  "registry",
  "verification",
  "ownership",
  "deals",
  "studio",
  "field",
  "api",
  "internal",
]);

function isSurface(value: string): value is TelemetrySurface {
  return SURFACES.has(value);
}

/** Client telemetry ingestion — fire-and-forget, always returns 204. */
export async function POST(req: Request) {
  let body: TelemetryBody;
  try {
    body = (await req.json()) as TelemetryBody;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const eventName = String(body.event_name ?? "").trim();
  const surface = String(body.surface ?? "").trim();

  if (!isTelemetryEventName(eventName) || !isSurface(surface)) {
    return new NextResponse(null, { status: 400 });
  }

  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // anonymous telemetry is allowed
  }

  void writeTelemetryEvent({
    eventName,
    surface,
    userId,
    sessionId: body.session_id ?? null,
    actorRole: body.actor_role ?? null,
    metadata: body.metadata,
  });

  return new NextResponse(null, { status: 204 });
}
