import { NextResponse } from "next/server";

import {
  isDisputeTargetType,
  userHasDisputeStake,
  validateDisputeTarget,
} from "@/lib/disputes";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const targetTypeRaw =
    typeof rec.target_type === "string"
      ? rec.target_type.trim().toLowerCase()
      : typeof rec.targetType === "string"
        ? rec.targetType.trim().toLowerCase()
        : "";
  const targetId =
    typeof rec.target_id === "string"
      ? rec.target_id.trim()
      : typeof rec.targetId === "string"
        ? rec.targetId.trim()
        : "";
  const reason =
    typeof rec.reason === "string" ? rec.reason.trim() : "";
  const details =
    typeof rec.details === "string" ? rec.details.trim() : "";

  if (!isDisputeTargetType(targetTypeRaw)) {
    return NextResponse.json(
      {
        error:
          "Invalid target_type. Use ownership, artist, or gallery_relationship.",
      },
      { status: 400 }
    );
  }

  if (!targetId) {
    return NextResponse.json({ error: "Missing target_id." }, { status: 400 });
  }

  if (reason.length < 4) {
    return NextResponse.json(
      { error: "Reason must be at least a few characters." },
      { status: 400 }
    );
  }
  if (details.length < 12) {
    return NextResponse.json(
      { error: "Please add more detail (at least 12 characters)." },
      { status: 400 }
    );
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
    actionKey: "dispute_create",
    subjectKey: user.id,
    maxAttempts: 10,
    windowSeconds: 86400,
  });
  if (blocked) return blocked;

  const service = createSupabaseServiceClient();
  const okTarget = await validateDisputeTarget(
    service,
    targetTypeRaw,
    targetId
  );
  if (!okTarget) {
    return NextResponse.json(
      { error: "Target record was not found." },
      { status: 404 }
    );
  }

  const hasStake = await userHasDisputeStake(
    supabase,
    user.id,
    targetTypeRaw,
    targetId
  );
  if (!hasStake) {
    return NextResponse.json(
      {
        error:
          "You may only dispute records you are party to (ownership, representation, or invite).",
      },
      { status: 403 }
    );
  }

  const { data: row, error: insErr } = await supabase
    .from("disputes")
    .insert({
      created_by: user.id,
      target_type: targetTypeRaw,
      target_id: targetId,
      reason,
      details,
      status: "pending",
    })
    .select("id, created_at, target_type, target_id, status")
    .single();

  if (insErr) {
    const code = (insErr as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json(
        {
          error:
            "An open dispute already exists for this record. Wait for review or contact support.",
        },
        { status: 409 }
      );
    }
    console.error("[disputes/create]", insErr);
    return NextResponse.json(
      { error: "Could not submit dispute." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    dispute: row,
  });
}
