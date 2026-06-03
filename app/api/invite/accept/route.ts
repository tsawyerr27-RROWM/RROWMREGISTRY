import { NextResponse } from "next/server";

import { getArtistTier } from "@/lib/artist-tier";
import { logActivityEvent } from "@/lib/log-activity";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

/** Single-use token acceptance: bind invite to the authenticated user (same email). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token =
    body && typeof body === "object"
      ? String(
          (body as { token?: unknown; invite_token?: unknown }).token ??
            (body as { invite_token?: unknown }).invite_token ??
            ""
        ).trim()
      : "";

  if (!token || token.length < 32) {
    return NextResponse.json(
      { error: "Invalid invitation. The link may be incomplete or edited." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        error:
          "Please sign in (or verify your email) before accepting this invitation.",
      },
      { status: 401 }
    );
  }

  const blocked = await guardRegistryMutation(req, {
    actionKey: "invite_accept",
    subjectKey: user.id,
    maxAttempts: 20,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  const { data, error } = await supabase.rpc("accept_gallery_artist_invite", {
    p_token: token,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" || lower.includes("sign in with the invited")
        ? 403
        : lower.includes("not found")
          ? 404
          : lower.includes("expired") || lower.includes("no longer")
            ? 410
            : 400;
    return NextResponse.json(
      { error: msg || "Could not accept this invitation." },
      { status }
    );
  }

  const galleryId =
    data && typeof data === "object"
      ? String((data as { gallery_id?: unknown }).gallery_id ?? "")
      : "";

  const service = createSupabaseServiceClient();
  const { data: artistRow } = await service
    .from("artists")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const tier = getArtistTier(
    { visibility_status: "pending", status: "accepted" },
    artistRow
      ? { id: user.id, shown_on_institutional_public: false }
      : null
  );

  await logActivityEvent({
    userId: user.id,
    type: "gallery_invite_accepted",
    message: "Gallery invitation accepted",
    metadata: { gallery_id: galleryId || null },
  });

  return NextResponse.json(
    {
      ok: true,
      galleryId: galleryId || null,
      tier,
      message:
        "Invitation accepted. Finish artist onboarding. The gallery will be notified once your profile is complete.",
    },
    { status: 200 }
  );
}
