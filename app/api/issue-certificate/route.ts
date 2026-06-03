import { NextResponse } from "next/server";

import { requireAdminApi, createUserSupabaseClient } from "@/lib/api-admin-auth";
import { authorizeCertificateIssuance } from "@/lib/certificate-issue-auth";
import { issueCertificateForVerifiedArtwork } from "@/lib/issue-certificate";
import { logActivityEvent } from "@/lib/log-activity";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

/**
 * Force Node runtime (not Edge).
 * Service role key requires Node environment.
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing service role key" },
        { status: 500 }
      );
    }

    const { artwork_id } = await req.json();

    if (!artwork_id) {
      return NextResponse.json({ error: "Missing artwork_id" }, { status: 400 });
    }

    const artworkId = String(artwork_id);
    let activityUserId: string | null = null;

    const admin = await requireAdminApi(req);
    if (!admin.ok) {
      const supabase = await createUserSupabaseClient(req);
      if (!supabase) {
        return NextResponse.json(
          { error: "Server misconfiguration" },
          { status: 500 }
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const blocked = await guardRegistryMutation(req, {
        actionKey: "issue_certificate",
        subjectKey: user.id,
        maxAttempts: 40,
        windowSeconds: 3600,
      });
      if (blocked) return blocked;

      const authz = await authorizeCertificateIssuance(
        supabase,
        user.id,
        artworkId
      );
      if (!authz.authorized) {
        return NextResponse.json({ error: authz.reason }, { status: 403 });
      }
      activityUserId = user.id;
    }

    const result = await issueCertificateForVerifiedArtwork(artworkId);

    if (!result.ok) {
      const status =
        result.code === "not_found"
          ? 404
          : result.code === "not_verified" || result.code === "no_registry_id"
            ? 400
            : result.code === "missing_rpc"
              ? 500
              : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    if (activityUserId && result.created) {
      const service = createSupabaseServiceClient();
      const { data: art } = await service
        .from("artworks")
        .select("title, registry_id")
        .eq("id", artworkId)
        .maybeSingle();
      const title = String(art?.title || "").trim() || "Artwork";
      const registryId = art?.registry_id ? String(art.registry_id) : "";
      const regSuffix = registryId ? ` (${registryId})` : "";

      await logActivityEvent({
        userId: activityUserId,
        type: "certificate_issued",
        message: `Certificate issued: ${title}${regSuffix}`,
        artworkId,
        metadata: { title, registry_id: registryId || null },
      });
    }

    return NextResponse.json({
      success: true,
      created: result.created,
      certificate_hash: result.certificate_hash,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
