import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CreativePresenceView } from "@/components/Field/CreativePresenceView";
import { loadCreativePresencePageData } from "@/lib/field-creative-presence";
import {
  buildProfilePresenceMetadata,
  loadCreativeProfileOgBundle,
} from "@/lib/profile-og";
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
  const bundle = await loadCreativeProfileOgBundle(supabase, slug);

  if (!bundle) {
    return { title: "Creative · The Field" };
  }

  return buildProfilePresenceMetadata(bundle);
}

export default async function FieldCreativePresencePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  const data = await loadCreativePresencePageData(supabase, {
    slug,
    searchParams: sp,
    sessionUserId: authData?.user?.id ?? null,
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
