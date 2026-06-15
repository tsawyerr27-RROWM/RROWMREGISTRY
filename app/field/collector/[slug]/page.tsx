import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectorPresenceView } from "@/components/Field/CollectorPresenceView";
import { loadCollectorPresencePageData } from "@/lib/field-collector-presence";
import {
  buildProfilePresenceMetadata,
  loadCollectorProfileOgBundle,
} from "@/lib/profile-og";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const bundle = await loadCollectorProfileOgBundle(supabase, slug);

  if (!bundle) {
    return { title: "Collector · The Field" };
  }

  return buildProfilePresenceMetadata(bundle);
}

export default async function FieldCollectorPresencePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const data = await loadCollectorPresencePageData(supabase, slug);
  if (!data) notFound();

  return <CollectorPresenceView data={data} />;
}
