import { tryCreateSupabaseServiceClient } from "@/lib/supabase-service-role";

/** Canonical telemetry event names (Sprint 6C taxonomy). */
export const TELEMETRY_EVENTS = [
  // Auth
  "signup_started",
  "signup_completed",
  "login_started",
  "login_completed",
  "password_reset_requested",
  // Registry
  "artwork_register_started",
  "artwork_registered",
  "artwork_self_attested",
  "certificate_opened",
  "ledger_opened",
  // Verification
  "verification_queue_opened",
  "verification_started",
  "verification_completed",
  "amendment_requested",
  // Ownership / Deals
  "ownership_claim_started",
  "ownership_claim_completed",
  "transfer_started",
  "transfer_completed",
  "deal_opened",
  "deal_completed",
  // Studio
  "studio_opened",
  "studio_section_opened",
  "view_mode_changed",
  // Field
  "field_opened",
  "field_search",
  "field_record_opened",
  "opportunity_opened",
  "opportunity_applied",
] as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[number];

export type TelemetrySurface =
  | "auth"
  | "registry"
  | "verification"
  | "ownership"
  | "deals"
  | "studio"
  | "field"
  | "api"
  | "internal";

export type TelemetryActorRole =
  | "artist"
  | "collector"
  | "gallery"
  | "admin"
  | "anonymous";

const EVENT_SET = new Set<string>(TELEMETRY_EVENTS);

export function isTelemetryEventName(value: string): value is TelemetryEventName {
  return EVENT_SET.has(value);
}

export type WriteTelemetryInput = {
  eventName: TelemetryEventName;
  surface: TelemetrySurface;
  userId?: string | null;
  sessionId?: string | null;
  actorRole?: TelemetryActorRole | string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Server-side telemetry writer. Uses service role; never throws to callers.
 */
export async function writeTelemetryEvent(input: WriteTelemetryInput): Promise<void> {
  const service = tryCreateSupabaseServiceClient();
  if (!service) return;

  const metadata = sanitizeMetadata(input.metadata);

  try {
    const { error } = await service.from("telemetry_events").insert({
      event_name: input.eventName,
      surface: input.surface,
      user_id: input.userId ?? null,
      session_id: input.sessionId ?? null,
      actor_role: input.actorRole ?? null,
      metadata,
    });

    if (error) {
      console.error("[telemetry] insert failed", error.message);
    }
  } catch (err) {
    console.error("[telemetry] write failed", err);
  }
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    if (typeof value === "function") continue;
    try {
      JSON.stringify(value);
      out[key] = value;
    } catch {
      out[key] = String(value);
    }
  }
  return out;
}
