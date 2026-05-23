import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

/**
 * Confirms the viewer may initiate a provenance continuation for this registry id.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const registryId = String(url.searchParams.get("registry_id") || "").trim();
  if (!registryId) {
    return NextResponse.json({ error: "Missing registry_id." }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data: art, error } = await service
    .from("artworks")
    .select("id, title, registry_id, verification_status, current_owner_id")
    .eq("registry_id", registryId)
    .maybeSingle();

  if (error || !art?.id) {
    return NextResponse.json({ error: "Work not found." }, { status: 404 });
  }
  if (String(art.verification_status || "") !== "verified") {
    return NextResponse.json(
      { eligible: false, reason: "not_verified" },
      { status: 200 }
    );
  }
  const ownerId = art.current_owner_id as string | null;
  if (!ownerId || ownerId !== user.id) {
    return NextResponse.json(
      { eligible: false, reason: "not_custodian" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    eligible: true,
    artwork_id: art.id,
    title: String(art.title || "").trim() || "Untitled work",
    registry_id: String(art.registry_id || "").trim(),
  });
}
