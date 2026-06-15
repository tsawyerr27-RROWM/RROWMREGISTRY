import {
  loadCollectorProfileOgBundle,
  resolveProfileOgLines,
} from "@/lib/profile-og";
import {
  profileOgImageContentType,
  profileOgImageSize,
  renderProfileOgImage,
} from "@/lib/profile-og-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const size = profileOgImageSize();
export const contentType = profileOgImageContentType();

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCollectorProfileOgBundle(supabase, slug);

  if (!bundle) {
    return renderProfileOgImage({
      context: {
        role: "collector",
        displayName: "Collector",
        canonicalPath: "/field/collector",
        surfaceLabelKey: "field.presence.collector.title",
        trustLine: { key: "profile.presence.trust.collector.opening" },
        footprintLine: null,
        secondaryLine: null,
        practiceLine: null,
      },
      bio: null,
      indexable: false,
    });
  }

  return renderProfileOgImage(bundle);
}

export async function generateImageMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCollectorProfileOgBundle(supabase, slug);
  const alt = bundle
    ? resolveProfileOgLines(bundle.context).alt
    : "Collector profile on RROWM";

  return {
    alt,
    size,
    contentType,
  };
}
