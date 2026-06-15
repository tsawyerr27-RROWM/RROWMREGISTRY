import {
  loadOrganisationProfileOgBundle,
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
  const bundle = await loadOrganisationProfileOgBundle(supabase, slug);

  if (!bundle) {
    return renderProfileOgImage({
      context: {
        role: "organisation",
        displayName: "Organisation",
        canonicalPath: "/field/organisation",
        surfaceLabelKey: "field.presence.organisation.title",
        trustLine: { key: "field.organisation.verification.participant" },
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
  const bundle = await loadOrganisationProfileOgBundle(supabase, slug);
  const alt = bundle
    ? resolveProfileOgLines(bundle.context).alt
    : "Organisation profile on RROWM";

  return {
    alt,
    size,
    contentType,
  };
}
