import { NextResponse } from "next/server";

import { captureRuntimeError } from "@/lib/runtime-errors";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type RuntimeErrorBody = {
  surface?: string | null;
  route?: string | null;
  error_name?: string | null;
  message?: string;
  stack?: string | null;
  metadata?: Record<string, unknown>;
};

/** Client runtime error ingestion — fire-and-forget, always returns 204. */
export async function POST(req: Request) {
  let body: RuntimeErrorBody;
  try {
    body = (await req.json()) as RuntimeErrorBody;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) {
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
    // anonymous error reports allowed
  }

  void captureRuntimeError({
    error: {
      name: body.error_name ?? "Error",
      message,
      stack: body.stack ?? undefined,
    },
    surface: body.surface ?? "client",
    route: body.route ?? null,
    userId,
    metadata: body.metadata,
  });

  return new NextResponse(null, { status: 204 });
}
