import { tryCreateSupabaseServiceClient } from "@/lib/supabase-service-role";

export type CaptureRuntimeErrorInput = {
  error: unknown;
  surface?: string | null;
  route?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

function normalizeError(error: unknown): {
  errorName: string | null;
  message: string;
  stack: string | null;
} {
  if (error instanceof Error) {
    return {
      errorName: error.name || "Error",
      message: error.message || "Unknown error",
      stack: error.stack ?? null,
    };
  }
  if (typeof error === "string") {
    return { errorName: "Error", message: error, stack: null };
  }
  try {
    return {
      errorName: "Error",
      message: JSON.stringify(error),
      stack: null,
    };
  } catch {
    return { errorName: "Error", message: "Unknown error", stack: null };
  }
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    try {
      JSON.stringify(value);
      out[key] = value;
    } catch {
      out[key] = String(value);
    }
  }
  return out;
}

/**
 * Server-side runtime error capture. Never throws to callers.
 */
export async function captureRuntimeError(
  input: CaptureRuntimeErrorInput
): Promise<void> {
  const service = tryCreateSupabaseServiceClient();
  if (!service) return;

  const { errorName, message, stack } = normalizeError(input.error);
  const metadata = sanitizeMetadata(input.metadata);

  try {
    const { error } = await service.from("runtime_errors").insert({
      surface: input.surface ?? null,
      route: input.route ?? null,
      user_id: input.userId ?? null,
      error_name: errorName,
      message: message.slice(0, 4000),
      stack: stack ? stack.slice(0, 12000) : null,
      metadata,
    });

    if (error) {
      console.error("[runtime-errors] insert failed", error.message);
    }
  } catch (err) {
    console.error("[runtime-errors] capture failed", err);
  }
}
