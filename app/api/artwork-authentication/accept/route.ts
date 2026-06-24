import { NextResponse } from "next/server";

import { logActivityEvent, logActivityForGalleryStaff } from "@/lib/log-activity";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(
    (body as { token?: string }).token ?? ""
  ).trim();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("accept_artwork_authentication_invite", {
    p_token: token,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const status =
      code === "42501" || msg.toLowerCase().includes("not authenticated")
        ? 403
        : 400;
    return NextResponse.json({ error: msg || "Could not complete authentication." }, { status });
  }

  const o =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const artworkId = String(o.artwork_id ?? "");

  if (artworkId && !o.already_authenticated) {
    const service = createSupabaseServiceClient();
    const { data: art } = await service
      .from("artworks")
      .select("title, registry_id, filing_gallery_id")
      .eq("id", artworkId)
      .maybeSingle();
    const title = String(art?.title || "").trim() || "Artwork";
    const reg = art?.registry_id ? ` (${art.registry_id})` : "";

    await logActivityEvent({
      userId: user.id,
      type: "artwork_authenticated",
      message: `Authenticated authorship: ${title}${reg}`,
      artworkId,
      metadata: { registry_id: art?.registry_id ?? null },
    });

    const filingGalleryId = art?.filing_gallery_id
      ? String(art.filing_gallery_id)
      : null;
    if (filingGalleryId) {
      await logActivityForGalleryStaff({
        galleryId: filingGalleryId,
        type: "artwork_authenticated",
        message: `Authenticated authorship: ${title}${reg}`,
        artworkId,
        metadata: { registry_id: art?.registry_id ?? null, title },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    artwork_id: artworkId || null,
    already_authenticated: Boolean(o.already_authenticated),
  });
}
