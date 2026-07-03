"use client";

import { useCallback, useMemo } from "react";

import {
  type TelemetryEventName,
  type TelemetrySurface,
} from "@/lib/telemetry";

const SESSION_KEY = "rrowm_telemetry_session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "";
  }
}

export type TrackTelemetryInput = {
  eventName: TelemetryEventName;
  surface: TelemetrySurface;
  actorRole?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Client telemetry helper. Fire-and-forget POST to /api/telemetry.
 */
export function useTelemetry() {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const track = useCallback(
    (input: TrackTelemetryInput) => {
      const body = {
        event_name: input.eventName,
        surface: input.surface,
        session_id: sessionId || undefined,
        actor_role: input.actorRole ?? undefined,
        metadata: input.metadata ?? {},
      };

      try {
        const payload = JSON.stringify(body);
        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          const blob = new Blob([payload], { type: "application/json" });
          if (navigator.sendBeacon("/api/telemetry", blob)) return;
        }
      } catch {
        // fall through to fetch
      }

      void fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {
        // telemetry must never disrupt UX
      });
    },
    [sessionId]
  );

  return { track, sessionId };
}

/** One-shot track without hook (e.g. error boundaries). */
export function trackTelemetryEvent(input: TrackTelemetryInput): void {
  const sessionId = getOrCreateSessionId();
  const body = {
    event_name: input.eventName,
    surface: input.surface,
    session_id: sessionId || undefined,
    actor_role: input.actorRole ?? undefined,
    metadata: input.metadata ?? {},
  };

  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}
