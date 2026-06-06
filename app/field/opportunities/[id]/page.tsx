import { notFound } from "next/navigation";

import { FieldOpportunityDetailView } from "@/components/Field/FieldOpportunityDetailView";
import { loadFieldOpportunityDetailPageData } from "@/lib/fetch-field-opportunity-detail";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function FieldOpportunityDetailPage({ params }: Props) {
  const { id } = await params;
  const briefId = String(id || "").trim();
  if (!briefId) notFound();

  const supabase = await createSupabaseServerClient();
  const data = await loadFieldOpportunityDetailPageData(supabase, briefId);
  if (!data) notFound();

  return <FieldOpportunityDetailView data={data} />;
}
