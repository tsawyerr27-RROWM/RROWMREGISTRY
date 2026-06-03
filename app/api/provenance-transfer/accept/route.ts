import { NextResponse } from "next/server";

import { logActivityEvent } from "@/lib/log-activity";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const token =
    typeof (body as Record<string, unknown>).token === "string"
      ? String((body as Record<string, unknown>).token).trim()
      : "";
  if (token.length < 32) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
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
    actionKey: "provenance_accept",
    subjectKey: user.id,
    maxAttempts: 20,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  const { data, error } = await supabase.rpc("accept_provenance_transfer", {
    p_token: token,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" ||
      lower.includes("not authenticated") ||
      lower.includes("sign in with the email") ||
      lower.includes("custodian")
        ? 403
        : lower.includes("not found")
          ? 404
          : 400;
    return NextResponse.json({ error: msg || "Could not accept invitation." }, { status });
  }

  const row =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const artworkId = String(row.artwork_id ?? "");
  const oeId = String(row.ownership_event_id ?? "");

  if (artworkId) {
    const service = createSupabaseServiceClient();
    const { data: tr } = await service
      .from("provenance_transfers")
      .select("from_user_id")
      .eq("ownership_event_id", oeId)
      .maybeSingle();

    const { data: art } = await service
      .from("artworks")
      .select("title, registry_id")
      .eq("id", artworkId)
      .maybeSingle();
    const title = String(art?.title || "").trim() || "Artwork";
    const reg = art?.registry_id ? ` (${art.registry_id})` : "";
    const fromUserId = tr?.from_user_id ? String(tr.from_user_id) : "";

    await logActivityEvent({
      userId: user.id,
      type: "provenance_transfer_accepted",
      message: `Accepted continuity transfer: ${title}${reg}`,
      artworkId,
      metadata: {
        registry_id: art?.registry_id ?? null,
        ownership_event_id: oeId,
      },
    });

    if (fromUserId) {
      await logActivityEvent({
        userId: fromUserId,
        type: "provenance_transfer_completed",
        message: `Continuity transfer completed: ${title}${reg}`,
        artworkId,
        metadata: {
          registry_id: art?.registry_id ?? null,
          accepted_by: user.id,
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    ownership_event_id: oeId,
    artwork_id: artworkId,
  });
}
