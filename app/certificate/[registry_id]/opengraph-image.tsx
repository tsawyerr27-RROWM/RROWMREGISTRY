import {
  loadCertificateOgBundle,
  resolveCertificateOgLines,
} from "@/lib/certificate-og";
import {
  certificateOgImageContentType,
  certificateOgImageSize,
  renderCertificateOgFallbackImage,
  renderCertificateOgImage,
} from "@/lib/certificate-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const size = certificateOgImageSize();
export const contentType = certificateOgImageContentType();

type Props = {
  params: Promise<{ registry_id: string }>;
};

export default async function Image({ params }: Props) {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCertificateOgBundle(supabase, registry_id);

  if (!bundle) {
    return renderCertificateOgFallbackImage();
  }

  return renderCertificateOgImage(bundle);
}

export async function generateImageMetadata({ params }: Props) {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCertificateOgBundle(supabase, registry_id);
  const alt = bundle
    ? resolveCertificateOgLines(bundle.context).alt
    : "RROWM registry certificate";

  return {
    alt,
    size,
    contentType,
  };
}
