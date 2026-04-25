/**
 * Marketplace listings, enquiries, and acquisition UI.
 * Kept hard-off until an explicit launch; flip here only after review.
 * (Server tables and RPCs remain in place regardless.)
 */
export const MARKETPLACE_ENABLED = false;

export function marketplaceEnabled(): boolean {
  return MARKETPLACE_ENABLED;
}
