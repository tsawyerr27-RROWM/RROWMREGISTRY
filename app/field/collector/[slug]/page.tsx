import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectorPresenceView } from "@/components/Field/CollectorPresenceView";
import {
  loadCollectorPresenceMetadata,
  loadCollectorPresencePageData,
} from "@/lib/field-collector-presence";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const meta = await loadCollectorPresenceMetadata(supabase, slug);

  if (!meta) {
    return { title: "Collector · The Field" };
  }

  const desc = meta.bio?.trim();
  const summary =
    desc && desc.length > 0
      ? desc.length > 160
        ? `${desc.slice(0, 157)}…`
        : desc
      : `Public Collector stewardship profile for ${meta.title} on RROWM.`;

  return {
    title: `${meta.title} · The Field`,
    description: summary,
    robots: meta.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title: `${meta.title} · The Field`,
      description: summary,
    },
  };
}

export default async function FieldCollectorPresencePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const data = await loadCollectorPresencePageData(supabase, slug);
  if (!data) notFound();

  return <CollectorPresenceView data={data} />;
}
