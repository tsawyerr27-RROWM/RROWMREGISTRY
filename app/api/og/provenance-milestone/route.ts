import { NextResponse } from "next/server";

import { loadProvenanceMilestoneOgBundle } from "@/lib/provenance-milestone-og";
import { renderProvenanceMilestoneOgImage } from "@/lib/provenance-milestone-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const registryId = String(url.searchParams.get("registry_id") || "").trim();
  const eventId = String(url.searchParams.get("event_id") || "").trim();

  const supabase = await createSupabaseServerClient();
  const bundle = await loadProvenanceMilestoneOgBundle(
    supabase,
    registryId,
    eventId
  );

  try {
    return renderProvenanceMilestoneOgImage(bundle);
  } catch (error) {
    console.error("[api/og/provenance-milestone]", error);
    return NextResponse.json(
      { error: "Could not render provenance milestone image." },
      { status: 500 }
    );
  }
}
