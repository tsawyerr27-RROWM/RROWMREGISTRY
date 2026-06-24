import { NextResponse } from "next/server";

import { getCanonicalOwner } from "@/lib/canonical-ownership-engine";
import { logActivityEvent } from "@/lib/log-activity";
import {
  buildOwnershipClaimNotes,
  isAcquisitionType,
  type OwnershipAcquisitionType,
} from "@/lib/collector-ownership-claim";
import { notifyRegistryTransferRecorded } from "@/lib/notification-hooks/registry";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

const BUCKET = "dispute-evidence";
const MAX_FILES = 5;
const MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeFilename(raw: string): string {
  const base = String(raw || "file").trim() || "file";
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
  if (!cleaned || cleaned === "." || cleaned === "..") return "file";
  return cleaned.replace(/^\.+/, "file");
}

/**
 * Records a collector ownership declaration as a provenance ledger row
 * (transfer_type collector_claim, verification_status recorded via trigger).
 * Optional files are stored privately under dispute-evidence/ownership-declaration/…
 * and paths are appended to notes for audit.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (String(actor?.role || "").toLowerCase() !== "collector") {
    return NextResponse.json(
      { error: "Collector accounts only." },
      { status: 403 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const artworkId = String(form.get("artwork_id") || "").trim();
  const acquisitionTypeRaw = String(form.get("acquisition_type") || "").trim();
  const acquisitionDate = String(form.get("acquisition_date") || "").trim();

  if (!/^[0-9a-f-]{36}$/i.test(artworkId)) {
    return NextResponse.json({ error: "Missing artwork_id." }, { status: 400 });
  }

  if (!isAcquisitionType(acquisitionTypeRaw)) {
    return NextResponse.json({ error: "Invalid acquisition_type." }, { status: 400 });
  }
  const acquisitionType = acquisitionTypeRaw as OwnershipAcquisitionType;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(acquisitionDate)) {
    return NextResponse.json(
      { error: "acquisition_date must be YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();

  const { data: art, error: artErr } = await service
    .from("artworks")
    .select("id, title, registry_id, verification_status")
    .eq("id", artworkId)
    .maybeSingle();

  if (artErr || !art?.id) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  if (String(art.verification_status || "") !== "verified") {
    return NextResponse.json(
      { error: "Only verified registry works can be declared." },
      { status: 400 }
    );
  }

  const canonicalOwner = await getCanonicalOwner(service, artworkId);
  const custodianId = canonicalOwner.userId;
  if (custodianId && custodianId !== user.id) {
    return NextResponse.json(
      {
        error:
          "Another custodian is already recorded for this work. Use a continuity transfer or contact support.",
      },
      { status: 403 }
    );
  }

  const files = form.getAll("files").filter((x) => x instanceof File) as File[];
  if (files.length === 0) {
    return NextResponse.json(
      {
        error:
          "Upload at least one supporting document (invoice, receipt, or custody record).",
      },
      { status: 400 }
    );
  }

  const { data: dup } = await service
    .from("ownership_events")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("to_user_id", user.id)
    .eq("transfer_type", "collector_claim")
    .eq("verification_status", "recorded")
    .limit(1)
    .maybeSingle();

  if (dup?.id) {
    return NextResponse.json(
      {
        error:
          "You already have a recorded declaration for this work. Contact registry support if you need to amend it.",
      },
      { status: 409 }
    );
  }

  const notes = buildOwnershipClaimNotes({
    acquisitionType,
    acquisitionDate,
    storagePaths: [],
  });

  const { data: inserted, error: insErr } = await service
    .from("ownership_events")
    .insert({
      artwork_id: artworkId,
      transfer_type: "collector_claim",
      from_user_id: custodianId,
      to_user_id: user.id,
      created_by: user.id,
      notes,
    })
    .select("id")
    .single();

  if (insErr || !inserted?.id) {
    console.error("[collector/ownership-claim] insert", insErr);
    return NextResponse.json(
      { error: insErr?.message || "Could not record declaration." },
      { status: 400 }
    );
  }

  const eventId = String(inserted.id);
  const storagePaths: string[] = [];

  const bounded = files.slice(0, MAX_FILES);

  for (const file of bounded) {
    const size = Number(file.size || 0);
    if (!Number.isFinite(size) || size <= 0) continue;
    if (size > MAX_BYTES) {
      await service.from("ownership_events").delete().eq("id", eventId);
      return NextResponse.json(
        { error: "One or more files exceed the size limit (15MB)." },
        { status: 413 }
      );
    }
    const mime = String(file.type || "").trim().toLowerCase();
    if (!ALLOWED_MIME.has(mime)) {
      await service.from("ownership_events").delete().eq("id", eventId);
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 415 }
      );
    }

    const name = safeFilename(file.name);
    const objectPath = `ownership-declaration/${eventId}/${crypto.randomUUID()}-${name}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await service.storage
      .from(BUCKET)
      .upload(objectPath, buf, {
        contentType: mime,
        upsert: false,
      });

    if (upErr) {
      console.error("[collector/ownership-claim] storage", upErr);
      await service.from("ownership_events").delete().eq("id", eventId);
      return NextResponse.json(
        { error: "Could not store supporting files." },
        { status: 500 }
      );
    }
    storagePaths.push(objectPath);
  }

  if (storagePaths.length > 0) {
    const merged = buildOwnershipClaimNotes({
      acquisitionType,
      acquisitionDate,
      storagePaths,
    });
    const { error: upNotesErr } = await service
      .from("ownership_events")
      .update({ notes: merged })
      .eq("id", eventId);
    if (upNotesErr) {
      console.error("[collector/ownership-claim] notes update", upNotesErr);
    }
  }

  const title = String(art.title || "").trim() || "Artwork";
  const registryId = art.registry_id ? String(art.registry_id) : "";
  const regSuffix = registryId ? ` (${registryId})` : "";

  await logActivityEvent({
    userId: user.id,
    type: "collector_ownership_declared",
    message: `Ownership declaration recorded: ${title}${regSuffix}`,
    artworkId,
    metadata: {
      title,
      registry_id: registryId || null,
      acquisition_type: acquisitionType,
    },
  });

  void notifyRegistryTransferRecorded({
    artworkId,
    fromUserId: custodianId,
    toUserId: user.id,
  });

  return NextResponse.json({
    ok: true,
    ownership_event_id: eventId,
    registry_id: (art.registry_id as string | null) ?? null,
  });
}
