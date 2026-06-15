import { NextResponse } from "next/server";

import { resolveRegistryStewardInviteEligibility } from "@/lib/registry-steward-invite-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

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
  const artworkId = String(url.searchParams.get("artwork_id") || "").trim();
  const registryId = String(url.searchParams.get("registry_id") || "").trim();

  if (!artworkId && !registryId) {
    return NextResponse.json(
      { error: "Missing artwork_id or registry_id." },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();
  const eligibility = await resolveRegistryStewardInviteEligibility(
    supabase,
    service,
    {
      artworkId: artworkId || undefined,
      registryId: registryId || undefined,
      userId: user.id,
    }
  );

  if (!eligibility) {
    return NextResponse.json({ eligible: false, kinds: [] as const });
  }

  return NextResponse.json({
    eligible: true,
    ...eligibility,
  });
}
