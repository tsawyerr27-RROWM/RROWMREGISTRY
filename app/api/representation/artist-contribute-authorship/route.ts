import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Archival authorship contribution — append-only chronology, not record overwrite. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const artworkId =
    body && typeof body === "object"
      ? String(
          (body as { artwork_id?: unknown; artworkId?: unknown }).artwork_id ??
            (body as { artworkId?: unknown }).artworkId ??
            ""
        ).trim()
      : "";

  const authorshipStatement =
    body && typeof body === "object"
      ? String(
          (body as { authorship_statement?: unknown }).authorship_statement ??
            (body as { authorshipStatement?: unknown }).authorshipStatement ??
            ""
        ).trim()
      : "";

  const chronologyContribution =
    body && typeof body === "object"
      ? String(
          (body as { chronology_contribution?: unknown }).chronology_contribution ??
            (body as { chronologyContribution?: unknown }).chronologyContribution ??
            ""
        ).trim()
      : "";

  if (!artworkId) {
    return NextResponse.json({ error: "Missing artwork_id" }, { status: 400 });
  }

  if (!authorshipStatement && !chronologyContribution) {
    return NextResponse.json(
      { error: "Add an authorship statement or chronology contribution." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.rpc("artist_contribute_authorship_on_file", {
    p_artwork_id: artworkId,
    p_authorship_statement: authorshipStatement || null,
    p_chronology_contribution: chronologyContribution || null,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" || lower.includes("not authorized")
        ? 403
        : 400;
    return NextResponse.json(
      { error: msg || "Could not record contribution." },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
