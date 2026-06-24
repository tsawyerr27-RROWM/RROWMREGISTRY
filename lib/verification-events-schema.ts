/**
 * Canonical PostgREST column lists for public.verification_events.
 * Uses source / status / verification_method — not event_type or message.
 */

/** Activity feed / preview rows. */
export const VERIFICATION_EVENT_ACTIVITY_SELECT =
  "id, artwork_id, created_at, source, status, verification_method" as const;

/** Participation / insights probes. */
export const VERIFICATION_EVENT_SIGNAL_SELECT =
  "source, status, verification_method" as const;

/** Gallery organisation catalogue metrics. */
export const VERIFICATION_EVENT_CATALOGUE_SELECT =
  "artwork_id, status, source, source_id, verification_method, verified_by_gallery_id, created_at" as const;

/** Provenance insights (single artwork). */
export const VERIFICATION_EVENT_INSIGHTS_SELECT =
  "id, status, source, verification_method" as const;

/** Replay / audit chronology. */
export const VERIFICATION_EVENT_REPLAY_SELECT =
  "id, source, source_id, status, created_at" as const;

/** OG / social preview. */
export const VERIFICATION_EVENT_OG_SELECT = "created_at, status" as const;

/** Identity resolution. */
export const VERIFICATION_EVENT_IDENTITY_SELECT =
  "source, status, source_id, verified_by_gallery_id, verification_method, created_at" as const;

export type VerificationEventActivityRow = {
  id?: string;
  artwork_id?: string | null;
  created_at?: string | null;
  source?: string | null;
  status?: string | null;
  verification_method?: string | null;
};

/** Human-readable line for studio activity feeds. */
export function verificationEventActivityLabel(
  row: VerificationEventActivityRow
): string {
  const method = String(row.verification_method ?? "").trim();
  if (method) return method.replaceAll("_", " ");
  const source = String(row.source ?? "").trim();
  if (source) return source.replaceAll("_", " ");
  const status = String(row.status ?? "").trim();
  if (status) return status.replaceAll("_", " ");
  return "update";
}
