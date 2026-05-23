import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

type Body = {
  gallery_id?: string;
  title?: string;
  year?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  description?: string | null;
  image_url?: string | null;
  registry_id?: string;
  metadata_hash?: string;
  catalogue_artist_name?: string | null;
  artist_id?: string | null;
  pending_artist_email?: string | null;
};

/** Institution catalogue registration — canonical record + filing in one RPC. */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const galleryId = String(body.gallery_id ?? "").trim();
  const title = String(body.title ?? "").trim();
  const registryId = String(body.registry_id ?? "").trim();
  const metadataHash = String(body.metadata_hash ?? "").trim();

  if (!galleryId || !title || !registryId || !metadataHash) {
    return NextResponse.json(
      { error: "Missing gallery_id, title, registry_id, or metadata_hash." },
      { status: 400 }
    );
  }

  const artistId = body.artist_id ? String(body.artist_id).trim() : null;
  const catalogueName = String(body.catalogue_artist_name ?? "").trim();

  if (!artistId && !catalogueName) {
    return NextResponse.json(
      { error: "Artist name is required when no roster artist is linked." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("register_institution_artwork_atomic", {
    p_gallery_id: galleryId,
    p_title: title,
    p_year: body.year ?? null,
    p_medium: body.medium ?? null,
    p_dimensions: body.dimensions ?? null,
    p_description: body.description ?? null,
    p_image_url: body.image_url ?? null,
    p_registry_id: registryId,
    p_metadata_hash: metadataHash,
    p_catalogue_artist_name: catalogueName || null,
    p_artist_id: artistId,
    p_pending_artist_email: body.pending_artist_email
      ? String(body.pending_artist_email).trim().toLowerCase()
      : null,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();

    let status = 500;
    if (code === "42501" || lower.includes("not authorised")) status = 403;
    else if (
      code === "PGRST202" ||
      code === "42883" ||
      lower.includes("register_institution_artwork_atomic") ||
      lower.includes("could not find")
    ) {
      status = 503;
    } else if (lower.includes("migration") || lower.includes("catalogue columns")) {
      status = 503;
    } else if (code === "P0001" || lower.includes("artist name is required")) {
      status = 400;
    }

    return NextResponse.json(
      {
        error:
          msg ||
          "Could not register work on file. Ensure migration 20260513120000 (and 20260513140000 fix) are applied in Supabase.",
      },
      { status }
    );
  }

  const row =
    data && typeof data === "object"
      ? Array.isArray(data)
        ? (data[0] as { id?: string } | undefined)
        : (data as { id?: string })
      : null;

  return NextResponse.json({
    ok: true,
    artwork: row ?? data ?? null,
    artwork_id: row?.id ?? null,
  });
}
