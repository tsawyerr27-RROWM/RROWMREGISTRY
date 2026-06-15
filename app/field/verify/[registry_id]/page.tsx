import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FieldVerifyRecordView } from "@/components/Field/FieldVerifyRecordView";
import {
  buildVerificationMetadata,
  buildVerificationNotFoundMetadata,
  loadVerificationOgBundle,
} from "@/lib/verification-og";
import { loadFieldVerifyRecordData } from "@/lib/field-verify-record";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ registry_id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { registry_id } = await params;
  const clean = registry_id.trim();
  if (!clean) return buildVerificationNotFoundMetadata();

  const supabase = await createSupabaseServerClient();
  const bundle = await loadVerificationOgBundle(supabase, clean);

  if (!bundle) {
    return buildVerificationNotFoundMetadata();
  }

  return buildVerificationMetadata(bundle);
}

export default async function FieldVerifyRecordPage({ params }: Props) {
  const { registry_id } = await params;
  const clean = registry_id.trim();
  if (!clean) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const sessionUserId = authData.user?.id ?? null;

  const data = await loadFieldVerifyRecordData(supabase, clean, sessionUserId);
  if (!data) notFound();

  return <FieldVerifyRecordView data={data} />;
}
