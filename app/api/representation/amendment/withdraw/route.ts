import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Phase D: requester withdraws a pending amendment. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const amendmentId = String(
    (body as { amendment_id?: unknown; amendmentId?: unknown }).amendment_id ??
      (body as { amendmentId?: unknown }).amendmentId ??
      ""
  ).trim();

  if (!amendmentId) {
    return NextResponse.json({ error: "Missing amendment_id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.rpc("withdraw_representation_amendment", {
    p_amendment_id: amendmentId,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const status = code === "42501" ? 403 : 400;
    return NextResponse.json(
      { error: msg || "Could not withdraw amendment." },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
