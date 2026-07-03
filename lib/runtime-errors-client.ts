"use client";

/**
 * Client-side runtime error reporter. Fire-and-forget POST to /api/runtime-errors.
 */
export function reportClientRuntimeError(
  error: unknown,
  context?: { surface?: string; route?: string; metadata?: Record<string, unknown> }
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const body = {
    surface: context?.surface ?? "client",
    route:
      context?.route ??
      (typeof window !== "undefined" ? window.location.pathname : null),
    error_name: err.name || "Error",
    message: err.message || "Unknown error",
    stack: err.stack ?? null,
    metadata: context?.metadata ?? {},
  };

  try {
    const payload = JSON.stringify(body);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/runtime-errors", blob)) return;
    }
  } catch {
    // fall through
  }

  void fetch("/api/runtime-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}
