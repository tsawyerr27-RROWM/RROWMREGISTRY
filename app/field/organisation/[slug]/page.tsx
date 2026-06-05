import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganisationPresenceView } from "@/components/Field/OrganisationPresenceView";
import {
  loadOrganisationPresenceMetadata,
  loadOrganisationPresencePageData,
} from "@/lib/field-organisation-presence";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const meta = await loadOrganisationPresenceMetadata(supabase, slug);

  if (!meta) {
    return { title: "Organisation · The Field" };
  }

  const desc = meta.description?.trim();
  const summary =
    desc && desc.length > 0
      ? desc.length > 160
        ? `${desc.slice(0, 157)}…`
        : desc
      : `Public Organisation profile for ${meta.name} on RROWM.`;

  return {
    title: `${meta.name} · The Field`,
    description: summary,
    robots: meta.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title: `${meta.name} · The Field`,
      description: summary,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.name} · The Field`,
      description: summary,
    },
  };
}

export default async function FieldOrganisationPresencePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  const data = await loadOrganisationPresencePageData(
    supabase,
    slug,
    authData?.user?.id ?? null
  );
  if (!data) notFound();

  return <OrganisationPresenceView data={data} />;
}
