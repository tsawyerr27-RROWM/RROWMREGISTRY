/**
 * Canonical PostgREST column lists for public.ownership_events.
 * Production schema uses to_user_id (not to_owner_id / to_owner / owner_id).
 */

/** Latest holder resolution — minimal columns. */
export const OWNERSHIP_EVENT_HOLDER_SELECT =
  "artwork_id, to_user_id, created_at, id" as const;

/** Holder + verification_status (public owner identity). */
export const OWNERSHIP_EVENT_HOLDER_WITH_STATUS_SELECT =
  "artwork_id, to_user_id, verification_status, created_at, id" as const;

/** Portfolio / catalogue metrics batch load. */
export const OWNERSHIP_EVENT_METRICS_SELECT =
  "artwork_id, created_at, id, to_user_id" as const;

/** Collector studio badge sync. */
export const OWNERSHIP_EVENT_COLLECTOR_STATUS_SELECT =
  "artwork_id, verification_status, created_at, id, to_user_id, to_name" as const;

/** Creative studio sold-filter / transfer history. */
export const OWNERSHIP_EVENT_TRANSFER_SUMMARY_SELECT =
  "artwork_id, transfer_type, to_user_id, to_name, to_type, created_at, id" as const;

/** Registry ledger chronology. */
export const OWNERSHIP_EVENT_TIMELINE_SELECT =
  "id, artwork_id, created_at, transfer_type, from_user_id, to_user_id, from_name, to_name, notes, provenance_transfer_id, value_event_id, sale_price, sale_currency" as const;
