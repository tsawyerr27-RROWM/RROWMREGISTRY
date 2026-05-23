import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Phase D: counterpart accepts or declines; optional proposed fields apply on accept. */
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

  const o = body as Record<string, unknown>;
  const amendmentId = String(o.amendment_id ?? o.amendmentId ?? "").trim();
  const accept = Boolean(o.accept);
  const resolutionNotes = o.resolution_notes != null ? String(o.resolution_notes) : null;

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

  const { error } = await supabase.rpc("resolve_representation_amendment", {
    p_amendment_id: amendmentId,
    p_accept: accept,
    p_resolution_notes: resolutionNotes,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" || lower.includes("only ") ? 403 : 400;
    return NextResponse.json(
      { error: msg || "Could not resolve amendment." },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
