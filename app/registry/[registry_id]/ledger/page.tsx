import { notFound } from "next/navigation";

import {
  loadPublicRegistryLedgerPageData,
  PublicRegistryRecordView,
} from "@/lib/load-public-registry-ledger-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function PublicRegistryLedgerPage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  const supabase = await createSupabaseServerClient();
  const data = await loadPublicRegistryLedgerPageData(supabase, registry_id);

  if (!data) notFound();

  return (
    <PublicRegistryRecordView
      artwork={data.artwork}
      artistName={data.artistName}
      artistSlug={data.artistSlug}
      trustKind={data.trustKind}
      verificationGalleryName={data.verificationGalleryName}
      edition={data.edition}
      hasCertificate={data.hasCertificate}
      certRevoked={data.certRevoked}
      revokedReason={data.revokedReason}
      ownershipStatus={data.ownershipStatus}
      currentOwner={data.currentOwner}
      sessionUserId={data.sessionUserId}
      provenanceBundle={data.provenanceBundle}
      provenanceInsights={data.provenanceInsights}
      shareUrl={data.shareUrl}
      claimReturnPath={data.claimReturnPath}
    />
  );
}
