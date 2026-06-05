import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CreativePresenceView } from "@/components/Field/CreativePresenceView";
import {
  loadCreativePresenceMetadata,
  loadCreativePresencePageData,
} from "@/lib/field-creative-presence";
import { redirectIfPageOutOfRange } from "@/lib/redirect-registry-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const meta = await loadCreativePresenceMetadata(supabase, slug);

  if (!meta) {
    return { title: "Creative · The Field" };
  }

  const desc = meta.bio?.trim();
  const summary =
    desc && desc.length > 0
      ? desc.length > 160
        ? `${desc.slice(0, 157)}…`
        : desc
      : `Public Creative profile for ${meta.displayName} on RROWM.`;

  return {
    title: `${meta.displayName} · The Field`,
    description: summary,
    robots: meta.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title: `${meta.displayName} · The Field`,
      description: summary,
    },
  };
}

export default async function FieldCreativePresencePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  const data = await loadCreativePresencePageData(supabase, {
    slug,
    searchParams: sp,
  });

  if (!data) notFound();

  redirectIfPageOutOfRange(
    data.basePath,
    data.page,
    data.total,
    data.q,
    data.sort,
    data.status
  );

  return <CreativePresenceView data={data} />;
}
