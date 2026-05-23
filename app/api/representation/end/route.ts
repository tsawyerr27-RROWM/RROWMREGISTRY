import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Phase E: end active gallery ↔ artist representation; historical filings remain. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const artistId = String(o.artist_id ?? o.artistId ?? "").trim();
  const notes = o.notes != null ? String(o.notes) : null;

  if (!artistId) {
    return NextResponse.json({ error: "Missing artist_id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: result, error } = await supabase.rpc(
    "end_gallery_artist_representation",
    {
      p_artist_id: artistId,
      p_notes: notes,
    }
  );

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const status = code === "42501" ? 403 : 400;
    return NextResponse.json(
      { error: msg || "Could not end representation on file." },
      { status }
    );
  }

  return NextResponse.json({ ok: true, result: result ?? null });
}
