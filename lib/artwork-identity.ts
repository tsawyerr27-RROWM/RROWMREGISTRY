import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeVerificationStatus } from "@/lib/ownership-ledger";

export type ArtworkIdentity = {
  status_line: string;
  context: {
    last_sale?: number;
    last_sale_date?: string;
    held_since?: string;
    verified_by?: string;
  };
};

function safeDate(iso: unknown): string | undefined {
  if (typeof iso !== "string") return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return iso;
}

export async function getArtworkIdentity(args: {
  supabase: SupabaseClient;
  artworkId: string;
}): Promise<ArtworkIdentity> {
  const { supabase, artworkId } = args;

  const [{ data: cert }, { data: latestOwnership }, { data: saleRows }, { data: vrows }] =
    await Promise.all([
      supabase
        .from("certificates")
        .select("id, revoked, issued_at")
        .eq("artwork_id", artworkId)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("ownership_events")
        .select("verification_status, created_at")
        .eq("artwork_id", artworkId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("value_events")
        .select("declared_value, created_at")
        .eq("artwork_id", artworkId)
        .eq("value_type", "sale")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("verification_events")
        .select("source, status, source_id, verified_by_gallery_id, verification_method, created_at")
        .eq("artwork_id", artworkId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  const hasCertificate = Boolean(cert?.id) && cert?.revoked !== true;
  const heldSince = safeDate((latestOwnership as any)?.created_at);
  const latestOwnershipStatus = normalizeVerificationStatus(
    (latestOwnership as any)?.verification_status
  );
  const ownershipVerified = latestOwnershipStatus === "verified";

  const latestSale = Array.isArray(saleRows) ? saleRows[0] : null;
  const lastSale =
    latestSale && typeof (latestSale as any).declared_value === "number"
      ? ((latestSale as any).declared_value as number)
      : undefined;
  const lastSaleDate = safeDate((latestSale as any)?.created_at);

  const confirmed = Array.isArray(vrows)
    ? (vrows as any[]).filter((r) => {
        const st = String(r?.status || "confirmed").toLowerCase().trim();
        return st === "confirmed";
      })
    : [];

  const galleryRow = confirmed.find((r) => {
    const src = String(r?.source || r?.verification_method || "")
      .toLowerCase()
      .trim();
    const gid = (r?.source_id || r?.verified_by_gallery_id) as
      | string
      | null
      | undefined;
    return src === "gallery" && Boolean(gid);
  });

  let verifiedBy: string | undefined;
  if (galleryRow) {
    const gid = (galleryRow.source_id || galleryRow.verified_by_gallery_id) as
      | string
      | null
      | undefined;
    if (gid) {
      const { data: g } = await supabase
        .from("galleries")
        .select("name")
        .eq("id", gid)
        .maybeSingle<{ name: string | null }>();
      const nm = g?.name?.trim();
      if (nm) verifiedBy = nm;
    }
  }

  const hasGalleryVerification = Boolean(verifiedBy);

  // Status line logic (CRITICAL)
  let status_line = "Recorded in registry";
  if (hasCertificate && ownershipVerified && hasGalleryVerification) {
    status_line = "Fully verified with certificate issued";
  } else if (ownershipVerified && !hasCertificate) {
    status_line = "Verified and held in a private collection";
  } else if (!ownershipVerified && latestOwnership) {
    status_line = "Recorded with unverified ownership";
  }

  return {
    status_line,
    context: {
      last_sale: lastSale,
      last_sale_date: lastSaleDate,
      held_since: heldSince,
      verified_by: verifiedBy,
    },
  };
}

