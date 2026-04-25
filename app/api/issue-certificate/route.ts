import { NextResponse } from "next/server";
import { issueCertificateForVerifiedArtwork } from "@/lib/issue-certificate";

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

    const result = await issueCertificateForVerifiedArtwork(String(artwork_id));

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
