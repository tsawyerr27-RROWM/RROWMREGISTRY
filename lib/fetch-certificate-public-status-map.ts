import type { SupabaseClient } from "@supabase/supabase-js";

export type CertificatePublicStatusEntry = { revoked: boolean };

/**
 * Certificate rows for artworks that have a `certificates` row (matches batch RPC shape).
 * Artworks with no certificate are omitted — callers treat missing id as “no cert row”.
 */
export async function fetchCertificatePublicStatusByArtworkIds(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<Map<string, CertificatePublicStatusEntry>> {
  const map = new Map<string, CertificatePublicStatusEntry>();
  const ids = [...new Set(artworkIds.map((id) => String(id).trim()).filter(Boolean))];
  if (ids.length === 0) return map;

  const { data: batchRows, error: batchErr } = await supabase.rpc(
    "get_certificate_public_status_batch",
    { p_artwork_ids: ids }
  );

  if (!batchErr && batchRows) {
    for (const row of batchRows as { artwork_id?: string; revoked?: boolean }[]) {
      const aid = row.artwork_id ? String(row.artwork_id) : "";
      if (!aid) continue;
      map.set(aid, { revoked: Boolean(row.revoked) });
    }
    return map;
  }

  // Fallback: remote DB may not have batch RPC (migration not applied). Single RPC exists.
  const CHUNK = 24;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const results = await Promise.all(
      chunk.map((id) =>
        supabase.rpc("get_certificate_public_status_single", { p_artwork_id: id })
      )
    );
    for (let j = 0; j < chunk.length; j++) {
      const id = chunk[j];
      const res = results[j];
      const row = res.data?.[0] as
        | { has_certificate?: boolean; revoked?: boolean }
        | undefined;
      if (row?.has_certificate) {
        map.set(id, { revoked: Boolean(row.revoked) });
      }
    }
  }

  return map;
}

/** Shape used by collector studio when counting available certificates. */
export function certificateStatusMapToCollectorRecord(
  map: Map<string, CertificatePublicStatusEntry>
): Record<string, { has_certificate: boolean; revoked: boolean }> {
  const out: Record<string, { has_certificate: boolean; revoked: boolean }> = {};
  for (const [aid, v] of map) {
    out[aid] = { has_certificate: true, revoked: v.revoked };
  }
  return out;
}
