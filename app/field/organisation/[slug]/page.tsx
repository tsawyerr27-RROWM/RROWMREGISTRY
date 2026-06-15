import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganisationPresenceView } from "@/components/Field/OrganisationPresenceView";
import { loadOrganisationPresencePageData } from "@/lib/field-organisation-presence";
import {
  buildProfilePresenceMetadata,
  loadOrganisationProfileOgBundle,
} from "@/lib/profile-og";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadOrganisationProfileOgBundle(supabase, slug);

  if (!bundle) {
    return { title: "Organisation · The Field" };
  }

  return buildProfilePresenceMetadata(bundle);
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
