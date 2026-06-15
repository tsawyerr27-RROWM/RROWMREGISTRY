import { NextResponse } from "next/server";

import { notifyRegistryVerificationApproved } from "@/lib/notification-hooks/registry";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

type Body = {
  artwork_id?: string;
  artworkId?: string;
};

/** Gallery staff attestation: verify artwork on the Registry ledger. */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const artworkId = String(body.artwork_id ?? body.artworkId ?? "").trim();
  if (!artworkId) {
    return NextResponse.json({ error: "Missing artwork_id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: before, error: beforeError } = await supabase
    .from("artworks")
    .select("verification_status")
    .eq("id", artworkId)
    .maybeSingle();

  if (beforeError) {
    return NextResponse.json({ error: beforeError.message }, { status: 500 });
  }
  if (!before) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }

  const wasVerified =
    String(before.verification_status ?? "").toLowerCase() === "verified";

  const { error } = await supabase.rpc("gallery_verify_artwork", {
    p_artwork_id: artworkId,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" || lower.includes("not authorized") || lower.includes("not authorised")
        ? 403
        : 400;
    return NextResponse.json({ error: msg || "Verification failed." }, { status });
  }

  if (!wasVerified) {
    void notifyRegistryVerificationApproved({ artworkId });
  }

  return NextResponse.json({ ok: true });
}
