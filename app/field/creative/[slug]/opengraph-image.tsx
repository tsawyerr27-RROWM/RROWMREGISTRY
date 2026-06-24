import { loadCreativeProfileOgBundle } from "@/lib/profile-og";
import {
  profileOgImageContentType,
  profileOgImageSize,
  renderProfileOgImage,
} from "@/lib/profile-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const size = profileOgImageSize();
export const contentType = profileOgImageContentType();
export const alt = "Creative profile on RROWM";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCreativeProfileOgBundle(supabase, slug);

  if (!bundle) {
    return renderProfileOgImage({
      context: {
        role: "creative",
        displayName: "Creative",
        canonicalPath: "/field/creative",
        surfaceLabelKey: "field.presence.creative.title",
        trustLine: { key: "profile.presence.trust.creative.registered" },
        footprintLine: null,
        secondaryLine: null,
        practiceLine: null,
        rightsLine: null,
      },
      bio: null,
      indexable: false,
    });
  }

  return renderProfileOgImage(bundle);
}
