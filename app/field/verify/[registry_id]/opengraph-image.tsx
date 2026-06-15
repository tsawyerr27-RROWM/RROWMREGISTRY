import {
  loadVerificationOgBundle,
  resolveVerificationOgLines,
} from "@/lib/verification-og";
import {
  renderVerificationOgFallbackImage,
  renderVerificationOgImage,
  verificationOgImageContentType,
  verificationOgImageSize,
} from "@/lib/verification-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const size = verificationOgImageSize();
export const contentType = verificationOgImageContentType();

type Props = {
  params: Promise<{ registry_id: string }>;
};

export default async function Image({ params }: Props) {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadVerificationOgBundle(supabase, registry_id);

  if (!bundle) {
    return renderVerificationOgFallbackImage();
  }

  return renderVerificationOgImage(bundle);
}

export async function generateImageMetadata({ params }: Props) {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadVerificationOgBundle(supabase, registry_id);
  const alt = bundle
    ? resolveVerificationOgLines(bundle.context).alt
    : "RROWM registry verification";

  return {
    alt,
    size,
    contentType,
  };
}
