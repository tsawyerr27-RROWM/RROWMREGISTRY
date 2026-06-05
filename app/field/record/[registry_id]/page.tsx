import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FieldRecordView } from "@/components/Field/FieldRecordView";
import {
  loadFieldRecordMetadata,
  loadFieldRecordPageData,
} from "@/lib/field-record-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ registry_id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const meta = await loadFieldRecordMetadata(supabase, registry_id);

  if (!meta) {
    return { title: "Registry record · The Field" };
  }

  const summary = `Public record summary for ${meta.title} (${meta.registryId}) on RROWM.`;

  return {
    title: `${meta.title} · The Field`,
    description: summary,
    openGraph: {
      title: `${meta.title} · The Field`,
      description: summary,
    },
  };
}

export default async function FieldRecordPage({ params }: Props) {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const sessionUserId = authData?.user?.id ?? null;

  const data = await loadFieldRecordPageData(
    supabase,
    registry_id,
    sessionUserId
  );

  if (!data) notFound();

  return <FieldRecordView data={data} />;
}
