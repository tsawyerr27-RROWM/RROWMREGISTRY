/**
 * Effective **platform user** owner id for dashboard UI (when the current holder
 * is on-platform). Prefer the read-model ledger column (latest event), then
 * denormalized cache columns — the ledger is authoritative for provenance;
 * `current_owner_id` may lag or be null for external-only holders.
 */
export function resolveArtworkOwnerId(
  artwork: Record<string, unknown>
): string | null {
  const keys = [
    "ledger_latest_owner_id",
    "current_owner_id",
    "test_owner_id",
  ] as const;
  for (const k of keys) {
    const v = artwork[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}
