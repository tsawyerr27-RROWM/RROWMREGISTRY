import { NextResponse } from "next/server";

import { isDealType } from "@/lib/deal-status";
import { normalizeUuid } from "@/lib/deal-permissions";
import { counterpartyUserIdForDeal, resolveDealParticipantLabels } from "@/lib/deal-participant-labels";
import { mapDealRow } from "@/lib/deals";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("deals")
    .select(
      "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
    )
    .or(`participant_a_user_id.eq.${user.id},participant_b_user_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deals = (data ?? []).map((row) => mapDealRow(row as Record<string, unknown>));

  const counterpartyIds = deals
    .map((deal) => counterpartyUserIdForDeal(user.id, deal))
    .filter((id): id is string => Boolean(id));

  const counterpartyLabels = await resolveDealParticipantLabels(
    supabase,
    counterpartyIds
  );

  return NextResponse.json({ deals, counterpartyLabels });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  if (!body || typeof body !== "object") return badRequest("Invalid body");
  const o = body as Record<string, unknown>;

  const participantAUserId = normalizeUuid(o.participant_a_user_id ?? o.participantAUserId);
  const participantBUserId = normalizeUuid(o.participant_b_user_id ?? o.participantBUserId);
  const type = String(o.type ?? "").trim();
  const title = o.title != null ? String(o.title).trim() : null;
  const artworkId = normalizeUuid(o.artwork_id ?? o.artworkId);
  const galleryId = normalizeUuid(o.gallery_id ?? o.galleryId);
  const terms =
    o.terms && typeof o.terms === "object" && !Array.isArray(o.terms)
      ? (o.terms as Record<string, unknown>)
      : {};

  if (!participantAUserId || !participantBUserId) {
    return badRequest("participant_a_user_id and participant_b_user_id are required.");
  }
  if (participantAUserId === participantBUserId) {
    return badRequest("Participants must be different users.");
  }
  if (!isDealType(type)) {
    return badRequest("Invalid deal type.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.id !== participantAUserId && user.id !== participantBUserId) {
    return NextResponse.json(
      { error: "You must be a participant to create a deal." },
      { status: 403 }
    );
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("deals")
    .insert({
      created_by_user_id: user.id,
      participant_a_user_id: participantAUserId,
      participant_b_user_id: participantBUserId,
      type,
      status: "draft",
      title,
      artwork_id: artworkId,
      gallery_id: galleryId,
      terms,
      updated_at: now,
    })
    .select(
      "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create deal." },
      { status: 400 }
    );
  }

  return NextResponse.json({ deal: mapDealRow(data as Record<string, unknown>) });
}

