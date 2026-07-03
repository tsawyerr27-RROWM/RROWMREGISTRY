import { NextResponse } from "next/server";

import { isCurrentOwner } from "@/lib/canonical-ownership-engine";
import { canParticipateInOwnershipFlow } from "@/lib/artwork-trust-tier";
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
    .select("id, title, registry_id, verification_status")
    .eq("registry_id", registryId)
    .maybeSingle();

  if (error || !art?.id) {
    return NextResponse.json({ error: "Work not found." }, { status: 404 });
  }
  if (!canParticipateInOwnershipFlow(art.verification_status)) {
    return NextResponse.json(
      { eligible: false, reason: "trust_tier_insufficient" },
      { status: 200 }
    );
  }
  const isCustodian = await isCurrentOwner(service, user.id, String(art.id));
  if (!isCustodian) {
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
