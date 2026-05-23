import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

/**
 * Resolve a single verified artwork for the collector claim wizard.
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

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (String(actor?.role || "").toLowerCase() !== "collector") {
    return NextResponse.json(
      { error: "Collector accounts only." },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const registryId = String(url.searchParams.get("registry_id") || "").trim();
  const id = String(url.searchParams.get("id") || "").trim();

  const service = createSupabaseServiceClient();
  let q = service
    .from("artworks")
    .select(
      "id, title, registry_id, image_url, year, medium, verification_status, artist_id"
    )
    .eq("verification_status", "verified");

  if (registryId) {
    q = q.eq("registry_id", registryId);
  } else if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    q = q.eq("id", id);
  } else {
    return NextResponse.json(
      { error: "Provide registry_id or id." },
      { status: 400 }
    );
  }

  const { data: art, error } = await q.maybeSingle();
  if (error) {
    console.error("[collector/claim-artwork]", error);
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
  if (!art?.id) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }

  let artistName: string | null = null;
  if (art.artist_id) {
    const { data: ar } = await service
      .from("artists")
      .select("display_name")
      .eq("id", art.artist_id as string)
      .maybeSingle();
    artistName = (ar?.display_name as string | null)?.trim() || null;
  }

  return NextResponse.json({
    artwork: {
      id: art.id as string,
      title: (art.title as string | null) ?? null,
      registry_id: (art.registry_id as string | null) ?? null,
      image_url: (art.image_url as string | null) ?? null,
      year: (art.year as string | null) ?? null,
      medium: (art.medium as string | null) ?? null,
      artist_display_name: artistName,
    },
  });
}
