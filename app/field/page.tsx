import { unstable_cache } from "next/cache";

import { FieldSignatureSurface } from "@/components/Field/signature/FieldSignatureSurface";
import {
  fetchFieldCulturalSignals,
  type FieldCulturalSignals,
} from "@/lib/fetch-field-cultural-signals";
import {
  fetchFieldSignatureStats,
  type FieldSignatureStats,
} from "@/lib/fetch-field-signature-stats";
import { getSupabaseAnonServerClient } from "@/lib/supabase-anon-server";

export const dynamic = "force-dynamic";

const EMPTY_STATS: FieldSignatureStats = {
  records: null,
  creatives: null,
  organisations: null,
  opportunities: null,
};

function emptySignals(): FieldCulturalSignals {
  return {
    snapshotAt: new Date().toISOString(),
    signals: {
      newRecords7d: null,
      verificationPending: null,
      transfersActive7d: null,
      closingSoon72h: null,
      newRecordsPrior7d: null,
      transfersPrior7d: null,
    },
    cluster: {
      records: { total: null, new7d: null, awaitingAttestation: null },
      creatives: { total: null, recentlyActive7d: null },
      organisations: { total: null, verifiedInstitutions: null },
      opportunities: { live: null, closingSoon72h: null },
    },
  };
}

/**
 * Field signature counts are global public data — identical for every
 * visitor — so they are computed with a cookie-free anon client and cached
 * for 60s. One visitor a minute pays the query cost; everyone else gets a
 * warm snapshot.
 */
const getFieldSnapshot = unstable_cache(
  async (): Promise<{ stats: FieldSignatureStats; cultural: FieldCulturalSignals }> => {
    const supabase = getSupabaseAnonServerClient();
    if (!supabase) {
      return { stats: EMPTY_STATS, cultural: emptySignals() };
    }
    const stats = await fetchFieldSignatureStats(supabase);
    const cultural = await fetchFieldCulturalSignals(supabase, stats);
    return { stats, cultural };
  },
  ["field-signature-snapshot"],
  { revalidate: 60 }
);

export default async function FieldHomePage() {
  const { stats, cultural } = await getFieldSnapshot();
  return <FieldSignatureSurface stats={stats} cultural={cultural} />;
}
