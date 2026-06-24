import { loadCertificateOgBundle } from "@/lib/certificate-og";
import {
  renderCertificateOgFallbackImage,
  renderCertificateOgImage,
} from "@/lib/certificate-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const registryId = String(url.searchParams.get("registry_id") || "").trim();

  const supabase = await createSupabaseServerClient();
  const bundle = await loadCertificateOgBundle(supabase, registryId);

  try {
    const imageResponse = bundle
      ? renderCertificateOgImage(bundle)
      : renderCertificateOgFallbackImage();

    const safeId = registryId.replace(/[^a-zA-Z0-9_-]+/g, "-") || "certificate";
    const headers = new Headers(imageResponse.headers);
    headers.set(
      "Content-Disposition",
      `attachment; filename="rrowm-certificate-${safeId}.png"`
    );

    return new Response(imageResponse.body, {
      status: imageResponse.status,
      statusText: imageResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error("[api/og/certificate]", error);
    return new Response("Could not render certificate image.", { status: 500 });
  }
}
