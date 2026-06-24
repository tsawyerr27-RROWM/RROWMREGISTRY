import { createHash } from "crypto";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/api-admin-auth";
import { logActivityEvent, logActivityForGalleryStaff } from "@/lib/log-activity";
import { notifyRegistryVerificationApproved } from "@/lib/notification-hooks/registry";

export const runtime = "nodejs";

function buildVerificationHash(artwork: {
  title: string | null;
  artist_id: string | null;
  registry_id: string | null;
  created_at: string;
}): string {
  const canonical = [
    String(artwork.title ?? ""),
    String(artwork.artist_id ?? ""),
    String(artwork.registry_id ?? ""),
    String(artwork.created_at ?? ""),
  ].join("|");

  return createHash("sha256").update(canonical).digest("hex");
}

/** Registry admin attestation for pending artworks (internal verify console). */
export async function POST(req: Request) {
  const admin = await requireAdminApi(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const artworkId = String(
    (body as { artwork_id?: string; artworkId?: string }).artwork_id ??
      (body as { artworkId?: string }).artworkId ??
      ""
  ).trim();

  if (!artworkId) {
    return NextResponse.json({ error: "Missing artwork_id." }, { status: 400 });
  }

  const { service } = admin.ctx;

  const { data: artwork, error: loadError } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, artist_id, created_at, verification_status"
    )
    .eq("id", artworkId)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 });
  }
  if (!artwork?.id) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }

  const wasVerified =
    String(artwork.verification_status ?? "").toLowerCase() === "verified";

  const { error: updateError } = await service
    .from("artworks")
    .update({
      verification_status: "verified",
      approved_by: null,
      approved_at: new Date().toISOString(),
      verification_hash: buildVerificationHash(artwork),
    })
    .eq("id", artworkId)
    .neq("verification_status", "verified");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await service.from("verification_events").insert({
    artwork_id: artworkId,
    source: "system",
    source_id: null,
    status: "confirmed",
    metadata: { via: "admin" },
    verification_method: "admin",
  });

  await service.rpc("refresh_artwork_verification_status", {
    p_artwork_id: artworkId,
  });

  if (!wasVerified) {
    void notifyRegistryVerificationApproved({
      artworkId,
      client: service,
    });

    const { data: fullArt } = await service
      .from("artworks")
      .select("title, registry_id, artist_id, filing_gallery_id")
      .eq("id", artworkId)
      .maybeSingle();

    if (fullArt?.artist_id) {
      const title = String(fullArt.title ?? "").trim() || "Artwork";
      const reg = fullArt.registry_id ? ` (${fullArt.registry_id})` : "";
      void logActivityEvent({
        userId: String(fullArt.artist_id),
        type: "artwork_verified",
        message: `Artwork verified: ${title}${reg}`,
        artworkId,
        metadata: {
          registry_id: fullArt.registry_id ?? null,
          via: "admin",
        },
      });
    }

    const filingGalleryId = fullArt?.filing_gallery_id
      ? String(fullArt.filing_gallery_id)
      : null;
    if (filingGalleryId) {
      const title = String(fullArt?.title ?? "").trim() || "Artwork";
      const reg = fullArt?.registry_id ? ` (${fullArt.registry_id})` : "";
      void logActivityForGalleryStaff({
        galleryId: filingGalleryId,
        type: "artwork_verified",
        message: `Artwork verified: ${title}${reg}`,
        artworkId,
        metadata: {
          registry_id: fullArt?.registry_id ?? null,
          title,
          via: "admin",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
