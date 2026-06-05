import { fieldRecordHref } from "@/lib/field-nav";

function encodeRegistryId(registryId: string): string {
  return encodeURIComponent(registryId.trim());
}

/** Secondary authoritative Registry ledger surface (post PR1B redirect policy). */
export function registryLedgerHref(registryId: string): string {
  return `/registry/${encodeRegistryId(registryId)}/ledger`;
}

/** Canonical Field Record discovery target for legacy record detail URLs. */
export function registryRecordDiscoveryHref(registryId: string): string {
  return fieldRecordHref(registryId);
}
