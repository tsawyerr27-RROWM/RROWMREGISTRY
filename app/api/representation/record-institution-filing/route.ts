import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Records institution-filed representation after gallery registers a represented work. */
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

  if (!artworkId) {
    return NextResponse.json({ error: "Missing artwork_id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: relationshipId, error } = await supabase.rpc(
    "record_institution_artwork_filing",
    { p_artwork_id: artworkId }
  );

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const status =
      code === "42501" || msg.toLowerCase().includes("not authorised") ? 403 : 500;
    return NextResponse.json(
      { error: msg || "Could not record institution filing." },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    relationshipId: relationshipId ?? null,
  });
}
