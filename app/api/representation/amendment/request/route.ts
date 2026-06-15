import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { notifyRegistryAmendmentRequested } from "@/lib/notification-hooks/registry";

export const runtime = "nodejs";

function cleanJsonRecord(
  raw: unknown
): Record<string, string | number | boolean | null> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === null) out[k] = null;
    else if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    )
      out[k] = v;
    else out[k] = String(v);
  }
  return out;
}

const ALLOWED_KEYS = new Set([
  "title",
  "year",
  "medium",
  "dimensions",
  "description",
]);

function filterProposedChanges(
  proposed: Record<string, string | number | boolean | null>
): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(proposed)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (typeof v === "string" && v.trim()) filtered[k] = v.trim();
    else if (typeof v === "number" || typeof v === "boolean")
      filtered[k] = String(v);
  }
  return filtered;
}

/** Phase D: artist or institution requests a catalogue / representation amendment. */
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

  const o = body as Record<string, unknown>;
  const artworkId = String(o.artwork_id ?? o.artworkId ?? "").trim();
  const notes = String(o.notes ?? "").trim();
  const proposed = cleanJsonRecord(o.proposed_changes ?? o.proposedChanges);
  const filtered = filterProposedChanges(proposed);

  if (!artworkId) {
    return NextResponse.json({ error: "Missing artwork_id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: amendmentId, error } = await supabase.rpc(
    "request_representation_amendment",
    {
      p_artwork_id: artworkId,
      p_notes: notes,
      p_proposed_changes: filtered,
    }
  );

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const lower = msg.toLowerCase();
    const status =
      code === "42501" || lower.includes("not authorised") ? 403 : 400;
    return NextResponse.json(
      { error: msg || "Could not file amendment request." },
      { status }
    );
  }

  if (!amendmentId) {
    return NextResponse.json({ ok: true, amendmentId: null });
  }

  void notifyRegistryAmendmentRequested({
    artworkId,
    amendmentId: String(amendmentId),
    requesterUserId: user.id,
  });

  return NextResponse.json({ ok: true, amendmentId });
}
