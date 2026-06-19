import { NextResponse } from "next/server";

import { mapDealMessageRow } from "@/lib/deals";
import { notifyDealMessageReceived } from "@/lib/notification-hooks/deals";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function previewBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137)}...`;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const dealId = String(id ?? "").trim();
  if (!dealId) return badRequest("Missing deal id.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  if (!body || typeof body !== "object") return badRequest("Invalid body");
  const o = body as Record<string, unknown>;

  const messageBody = String(o.body ?? o.message ?? "").trim();
  if (!messageBody) return badRequest("Missing message body.");
  if (messageBody.length > 4000) return badRequest("Message body too long.");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("deal_messages")
    .insert({
      deal_id: dealId,
      sender_user_id: user.id,
      body: messageBody,
      metadata: {},
    })
    .select("id, deal_id, sender_user_id, body, metadata, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create message." },
      { status: 400 }
    );
  }

  void notifyDealMessageReceived({
    dealId,
    senderUserId: user.id,
    preview: previewBody(messageBody),
  });

  return NextResponse.json({ message: mapDealMessageRow(data as Record<string, unknown>) });
}

