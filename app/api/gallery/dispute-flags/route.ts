import { NextResponse } from "next/server";

import { hasAnyActiveDisputeForTargets } from "@/lib/disputes";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

type Body = {
  gallery_id?: string;
  invite_ids?: string[];
  artist_ids?: string[];
};

/**
 * Gallery members: which roster / invite rows have an active dispute flag.
 * Does not expose dispute authors or text.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rec = (body && typeof body === "object" ? body : {}) as Body;
  const galleryId = String(rec.gallery_id || "").trim();
  const inviteIds = Array.isArray(rec.invite_ids)
    ? rec.invite_ids.map((x) => String(x).trim()).filter(Boolean)
    : [];
  const artistIds = Array.isArray(rec.artist_ids)
    ? rec.artist_ids.map((x) => String(x).trim()).filter(Boolean)
    : [];

  if (!galleryId) {
    return NextResponse.json({ error: "Missing gallery_id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: mem, error: memErr } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("gallery_id", galleryId)
    .maybeSingle();

  if (memErr || !mem) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createSupabaseServiceClient();

  const pairs: { targetType: "gallery_relationship" | "artist"; targetId: string }[] =
    [];

  if (inviteIds.length) {
    const { data: rows } = await service
      .from("gallery_artist_invites")
      .select("id")
      .eq("gallery_id", galleryId)
      .in("id", [...new Set(inviteIds)]);
    const allowed = new Set((rows || []).map((r) => String(r.id)));
    for (const id of inviteIds) {
      if (allowed.has(id)) {
        pairs.push({ targetType: "gallery_relationship", targetId: id });
      }
    }
  }

  if (artistIds.length) {
    const { data: rows } = await service
      .from("artists")
      .select("id")
      .eq("gallery_id", galleryId)
      .in("id", [...new Set(artistIds)]);
    const allowed = new Set((rows || []).map((r) => String(r.id)));
    for (const id of artistIds) {
      if (allowed.has(id)) {
        pairs.push({ targetType: "artist", targetId: id });
      }
    }
  }

  const raw = await hasAnyActiveDisputeForTargets(service, pairs);
  const byInvite: Record<string, boolean> = {};
  const byArtist: Record<string, boolean> = {};
  for (const p of pairs) {
    const key = `${p.targetType}:${p.targetId}`;
    const v = raw[key] ?? false;
    if (p.targetType === "gallery_relationship") byInvite[p.targetId] = v;
    else byArtist[p.targetId] = v;
  }

  return NextResponse.json({
    byInviteId: byInvite,
    byArtistId: byArtist,
  });
}
