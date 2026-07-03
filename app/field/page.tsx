import { FieldSignatureSurface } from "@/components/Field/signature/FieldSignatureSurface";
import { fetchFieldCulturalSignals } from "@/lib/fetch-field-cultural-signals";
import { fetchFieldSignatureStats } from "@/lib/fetch-field-signature-stats";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function FieldHomePage() {
  const supabase = await createSupabaseServerClient();
  const stats = await fetchFieldSignatureStats(supabase);
  const cultural = await fetchFieldCulturalSignals(supabase, stats);

  return <FieldSignatureSurface stats={stats} cultural={cultural} />;
}
