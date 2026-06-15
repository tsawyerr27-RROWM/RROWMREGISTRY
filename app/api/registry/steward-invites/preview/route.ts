import { NextResponse } from "next/server";

import { loadRegistryStewardInvitePreview } from "@/lib/registry-steward-invite-preview";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  if (!token || token.length < 32) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const preview = await loadRegistryStewardInvitePreview(service, token);

  if (!preview) {
    return NextResponse.json({ status: "invalid" }, { status: 404 });
  }

  return NextResponse.json(preview);
}
