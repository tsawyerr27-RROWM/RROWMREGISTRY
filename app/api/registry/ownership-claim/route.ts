import { NextResponse } from "next/server";

import {
  canUserSubmitOwnershipClaim,
  isOwnershipClaimNoteValid,
  resolveOwnershipClaimPath,
} from "@/lib/ownership-claim-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  createSupabaseServiceClient,
  tryCreateSupabaseServiceClient,
} from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const artworkId = String(url.searchParams.get("artwork_id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(artworkId)) {
    return badRequest("Missing or invalid artwork_id.");
  }

  const service = tryCreateSupabaseServiceClient();
  const pathOptions = service
    ? {
        reader: service,
        userEmail: String(user.email ?? "").trim().toLowerCase() || null,
      }
    : {
        userEmail: String(user.email ?? "").trim().toLowerCase() || null,
      };

  const path = await resolveOwnershipClaimPath(supabase, user.id, artworkId, pathOptions);
  return NextResponse.json({ path });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON.");
  }

  if (!body || typeof body !== "object") return badRequest("Invalid body.");
  const o = body as Record<string, unknown>;

  const artworkId = String(o.artwork_id ?? o.artworkId ?? "").trim();
  const note = String(o.note ?? "").trim();

  if (!/^[0-9a-f-]{36}$/i.test(artworkId)) {
    return badRequest("Missing or invalid artwork_id.");
  }

  if (!isOwnershipClaimNoteValid(note)) {
    return badRequest(
      "Please add a short explanation (at least 12 characters) for the artist to review."
    );
  }

  const service = tryCreateSupabaseServiceClient();
  const pathOptions = service
    ? {
        reader: service,
        userEmail: String(user.email ?? "").trim().toLowerCase() || null,
      }
    : {
        userEmail: String(user.email ?? "").trim().toLowerCase() || null,
      };

  const path = await resolveOwnershipClaimPath(supabase, user.id, artworkId, pathOptions);

  if (path.kind === "already_owner") {
    return NextResponse.json(
      { error: "You already hold stewardship for this work on the registry ledger." },
      { status: 409 }
    );
  }
  if (path.kind === "provenance_accept") {
    return NextResponse.json(
      {
        error: path.message,
        code: "use_provenance_accept",
        accept_href: path.accept_href,
        deal_id: path.deal_id,
      },
      { status: 409 }
    );
  }
  if (path.kind === "blocked") {
    return NextResponse.json({ error: path.reason }, { status: 403 });
  }

  const eligible = await canUserSubmitOwnershipClaim(
    supabase,
    user.id,
    artworkId,
    pathOptions
  );
  if (!eligible) {
    return NextResponse.json(
      { error: "You are not eligible to claim ownership for this work." },
      { status: 403 }
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("ownership_claims")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("collector_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    return NextResponse.json(
      { error: "You already have a pending claim for this work." },
      { status: 409 }
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("ownership_claims")
    .insert({
      artwork_id: artworkId,
      collector_id: user.id,
      note,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    console.error("[registry/ownership-claim] insert", insertError);
    return NextResponse.json(
      { error: insertError?.message ?? "Could not submit ownership claim." },
      { status: 400 }
    );
  }

  void supabase.rpc("ownership_certificate_verify", {
    p_artwork_id: artworkId,
  });

  return NextResponse.json({ ok: true, claim_id: inserted.id });
}
