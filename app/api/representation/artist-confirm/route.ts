import { NextResponse } from "next/server";

import { issueCertificateForVerifiedArtwork } from "@/lib/issue-certificate";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Phase C: artist confirms layered participation on an institution-filed work. */
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

  const { error } = await supabase.rpc("artist_confirm_representation_on_file", {
    p_artwork_id: artworkId,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" || lower.includes("not authorized") || lower.includes("not represented")
        ? 403
        : 400;
    return NextResponse.json(
      { error: msg || "Could not record confirmation." },
      { status }
    );
  }

  try {
    const service = createSupabaseServiceClient();
    await service
      .from("artworks")
      .update({ verification_status: "verified" })
      .eq("id", artworkId)
      .neq("verification_status", "verified");
  } catch {
    /* DB trigger handles certificate */
  }

  try {
    await issueCertificateForVerifiedArtwork(artworkId);
  } catch {
    /* best-effort */
  }

  return NextResponse.json({ ok: true });
}
