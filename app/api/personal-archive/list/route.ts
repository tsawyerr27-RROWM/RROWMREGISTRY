import { NextResponse } from "next/server";

import {
  archiveContinuitySummaryLine,
  type ArchivedArtworkRow,
  isPersonalArchiveSchemaError,
  PERSONAL_ARCHIVE_SCHEMA_UNAVAILABLE,
} from "@/lib/personal-archive";
import { getArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data: rows, error } = await service
    .from("artwork_archives")
    .select("id, artwork_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isPersonalArchiveSchemaError(error)) {
      return NextResponse.json(
        { error: PERSONAL_ARCHIVE_SCHEMA_UNAVAILABLE, schemaUnavailable: true, items: [] },
        { status: 503 }
      );
    }
    console.error("[personal-archive/list]", error);
    return NextResponse.json({ error: "Could not load archive." }, { status: 500 });
  }

  const archives = rows ?? [];
  if (archives.length === 0) {
    return NextResponse.json({ items: [] as ArchivedArtworkRow[] });
  }

  const artworkIds = archives.map((r) => String(r.artwork_id));

  const { data: artworks, error: artErr } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, image_url, verification_status, artist_id, catalogue_artist_name, created_at"
    )
    .in("id", artworkIds);

  if (artErr) {
    console.error("[personal-archive/list] artworks", artErr);
    return NextResponse.json({ error: "Could not load works." }, { status: 500 });
  }

  const artById = new Map(
    (artworks ?? []).map((a) => [String(a.id), a])
  );

  const artistIds = [
    ...new Set(
      (artworks ?? [])
        .map((a) => a.artist_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const artistNames = new Map<string, string>();
  if (artistIds.length > 0) {
    const { data: artists } = await service
      .from("artists")
      .select("id, display_name, full_name")
      .in("id", artistIds);
    for (const ar of artists ?? []) {
      const name =
        ar.display_name?.trim() || ar.full_name?.trim() || "Registered artist";
      artistNames.set(String(ar.id), name);
    }
  }

  const items: ArchivedArtworkRow[] = [];

  for (const row of archives) {
    const artworkId = String(row.artwork_id);
    const art = artById.get(artworkId);
    if (!art?.registry_id) continue;

    const artistId = art.artist_id ? String(art.artist_id) : null;
    const artistName =
      (artistId && artistNames.get(artistId)) ||
      String(art.catalogue_artist_name || "").trim() ||
      "Artist on file";

    let continuitySummary: string | null = null;
    try {
      const bundle = await getArchivalProvenanceBundle({
        supabase: service,
        artwork: {
          id: artworkId,
          registry_id: art.registry_id ? String(art.registry_id) : null,
          title: art.title ? String(art.title) : null,
          artist_id: artistId,
          created_at: String(art.created_at ?? new Date().toISOString()),
          verification_status: String(art.verification_status ?? ""),
        },
        artistName,
      });
      continuitySummary = archiveContinuitySummaryLine(bundle);
    } catch {
      continuitySummary = null;
    }

    items.push({
      archiveId: String(row.id),
      archivedAt: String(row.created_at),
      artworkId,
      title: String(art.title || "").trim() || "Untitled work",
      registryId: String(art.registry_id),
      imageUrl: art.image_url ? String(art.image_url) : null,
      artistName,
      verificationStatus: String(art.verification_status || "unverified"),
      continuitySummary,
    });
  }

  return NextResponse.json({ items });
}
