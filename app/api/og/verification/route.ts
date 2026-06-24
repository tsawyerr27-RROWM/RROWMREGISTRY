import { loadVerificationOgBundle } from "@/lib/verification-og";
import {
  renderVerificationOgFallbackImage,
  renderVerificationOgImage,
} from "@/lib/verification-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const registryId = String(url.searchParams.get("registry_id") || "").trim();

  const supabase = await createSupabaseServerClient();
  const bundle = await loadVerificationOgBundle(supabase, registryId);

  try {
    const imageResponse = bundle
      ? renderVerificationOgImage(bundle)
      : renderVerificationOgFallbackImage();

    const safeId = registryId.replace(/[^a-zA-Z0-9_-]+/g, "-") || "verification";
    const headers = new Headers(imageResponse.headers);
    headers.set(
      "Content-Disposition",
      `attachment; filename="rrowm-verification-${safeId}.png"`
    );

    return new Response(imageResponse.body, {
      status: imageResponse.status,
      statusText: imageResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error("[api/og/verification]", error);
    return new Response("Could not render verification image.", { status: 500 });
  }
}
