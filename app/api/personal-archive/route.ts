import { NextResponse } from "next/server";

import {
  archiveArtwork,
  getArtworkArchiveCount,
  isArtworkArchived,
  removeArtworkFromArchive,
} from "@/lib/personal-archive";
import { logActivityEvent } from "@/lib/log-activity";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const artworkId = String(url.searchParams.get("artwork_id") || "").trim();

  if (!/^[0-9a-f-]{36}$/i.test(artworkId)) {
    return NextResponse.json({ error: "Missing artwork_id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const count = await getArtworkArchiveCount(supabase, artworkId);
  let archived = false;
  if (user) {
    archived = await isArtworkArchived(supabase, artworkId, user.id);
  }

  return NextResponse.json({ archived, count });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const artworkId = String(rec.artwork_id ?? rec.artworkId ?? "").trim();
  const action = String(rec.action ?? "").trim().toLowerCase();

  if (!/^[0-9a-f-]{36}$/i.test(artworkId)) {
    return NextResponse.json({ error: "Missing artwork_id." }, { status: 400 });
  }
  if (action !== "archive" && action !== "remove") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await guardRegistryMutation(req, {
    actionKey: "personal_archive",
    subjectKey: user.id,
    maxAttempts: 120,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  const service = createSupabaseServiceClient();
  const { data: art } = await service
    .from("artworks")
    .select("id, title, registry_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (!art?.id) {
    return NextResponse.json({ error: "Work not found." }, { status: 404 });
  }

  const result =
    action === "archive"
      ? await archiveArtwork(service, artworkId, user.id)
      : await removeArtworkFromArchive(service, artworkId, user.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, schemaUnavailable: result.schemaUnavailable === true },
      { status: result.schemaUnavailable ? 503 : 400 }
    );
  }

  const title = String(art.title || "").trim() || "Artwork";
  const registryId = art.registry_id ? String(art.registry_id) : "";
  const regSuffix = registryId ? ` (${registryId})` : "";

  await logActivityEvent({
    userId: user.id,
    type:
      action === "archive" ? "personal_archive_added" : "personal_archive_removed",
    message:
      action === "archive"
        ? `Added to personal archive: ${title}${regSuffix}`
        : `Removed from personal archive: ${title}${regSuffix}`,
    artworkId,
    metadata: {
      title,
      registry_id: registryId || null,
    },
  });

  return NextResponse.json({
    ok: true,
    archived: result.archived,
    count: result.count,
  });
}
