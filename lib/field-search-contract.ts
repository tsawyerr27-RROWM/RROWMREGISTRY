/**
 * Phase 2B — Field Search Contract (product params: q, verified, practice, sort, page).
 * Explainable search only — no ranking or recommendation semantics.
 */

import {
  fieldExplorerCreativesHref,
  fieldExplorerOrganisationsHref,
  fieldExplorerRecordsHref,
  fieldOpportunitiesHref,
  fieldRecordHref,
  type FieldExplorerTabId,
} from "@/lib/field-nav";

/** Canonical free-text search query param across Field explorers. */
export const FIELD_SEARCH_QUERY_PARAM = "q" as const;

const REGISTRY_ID_PREFIX = /^RROWM-/i;

/** Normalise user input for ilike / URL params (trim, collapse commas). */
export function normalizeFieldSearchTerm(raw: string): string {
  return raw.trim().replace(/,/g, " ");
}

/** Heuristic: hub routes Registry-ID-shaped input to Field Record. */
export function looksLikeRegistryId(raw: string): boolean {
  const trimmed = normalizeFieldSearchTerm(raw);
  if (!trimmed) return false;
  if (REGISTRY_ID_PREFIX.test(trimmed)) return true;
  // Allow compact paste without worrying about full format validation.
  return trimmed.length >= 8 && /^RROWM[-\w]+$/i.test(trimmed.replace(/\s+/g, ""));
}

export type FieldHubSearchRoute =
  | { kind: "registry_record"; href: string; registryId: string }
  | { kind: "text"; href: string; query: string };

/** Resolve explorer hub search submit — routing only, not ranked results. */
export function resolveFieldHubSearchRoute(raw: string): FieldHubSearchRoute | null {
  const query = normalizeFieldSearchTerm(raw);
  if (!query) return null;

  if (looksLikeRegistryId(query)) {
    const registryId = query.replace(/\s+/g, "");
    return {
      kind: "registry_record",
      href: fieldRecordHref(registryId),
      registryId,
    };
  }

  const params = new URLSearchParams();
  params.set(FIELD_SEARCH_QUERY_PARAM, query);
  return {
    kind: "text",
    href: `${fieldExplorerRecordsHref()}?${params.toString()}`,
    query,
  };
}

/** Preserve compatible search params when switching explorer tabs (§9.3 spec). */
export function fieldExplorerTabHref(
  tab: FieldExplorerTabId,
  searchParams: URLSearchParams | ReadonlyMap<string, string> | null
): string {
  const base =
    tab === "creatives"
      ? fieldExplorerCreativesHref()
      : tab === "organisations"
        ? fieldExplorerOrganisationsHref()
        : tab === "opportunities"
          ? fieldOpportunitiesHref()
          : fieldExplorerRecordsHref();

  if (!searchParams) return base;

  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    return searchParams.get(key) ?? null;
  };

  const params = new URLSearchParams();
  const q = normalizeFieldSearchTerm(get(FIELD_SEARCH_QUERY_PARAM) ?? "");
  if (q) params.set(FIELD_SEARCH_QUERY_PARAM, q);

  if (tab === "creatives") {
    const practice = (get("practice") ?? "").trim().toLowerCase();
    if (practice) params.set("practice", practice);
  }

  if (tab === "records") {
    const verified = get("verified");
    if (verified === "0" || verified === "all" || verified === "false") {
      params.set("verified", "0");
    }
  }

  if (tab === "organisations") {
    const verified = get("verified");
    if (verified === "1" || verified === "true") {
      params.set("verified", "1");
    }
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Build ilike pattern for Postgres filters (commas stripped). */
export function fieldSearchIlikePattern(term: string): string {
  const normalized = normalizeFieldSearchTerm(term);
  if (!normalized) return "";
  return `%${normalized}%`;
}
