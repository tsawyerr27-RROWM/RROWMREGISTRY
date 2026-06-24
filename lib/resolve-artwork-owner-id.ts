/**
 * Sync owner id from artwork row data.
 *
 * PR-BETA.7: `artworks.current_owner_id` and `ledger_latest_owner_id` are cache
 * only — never authoritative. Loaders should attach `canonical_owner_id` from
 * `getCanonicalOwner()` / `getCanonicalOwners()`.
 */
export function resolveArtworkOwnerId(
  artwork: Record<string, unknown>
): string | null {
  const canonical = artwork.canonical_owner_id ?? artwork.__canonical_owner_id;
  if (typeof canonical === "string" && canonical.trim()) {
    return canonical.trim();
  }
  return null;
}
