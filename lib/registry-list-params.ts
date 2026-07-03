/** Page size for /registry and /artist listings */
export const REGISTRY_PAGE_SIZE = 12;

export type RegistrySort = "newest" | "oldest" | "title_asc" | "title_desc";

import type { ArtworkTrustTier } from "@/lib/artwork-trust-tier";

/** Trust tier scope (e.g. artist / creative presence listings). */
export type ArtworkStatusFilter = "all" | ArtworkTrustTier;

export function parseListParams(sp: Record<string, string | string[] | undefined>) {
  const q = typeof sp.q === "string" ? sp.q : "";
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "newest";
  const sort: RegistrySort = (
    ["newest", "oldest", "title_asc", "title_desc"] as const
  ).includes(sortRaw as RegistrySort)
    ? (sortRaw as RegistrySort)
    : "newest";
  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1
  );
  const statusRaw = typeof sp.status === "string" ? sp.status.trim().toLowerCase() : "all";
  const normalized =
    statusRaw === "pending" ? "filed" : statusRaw;
  const status: ArtworkStatusFilter = (
    ["all", "filed", "self_attested", "verified"] as const
  ).includes(normalized as ArtworkStatusFilter)
    ? (normalized as ArtworkStatusFilter)
    : "all";
  return { q, sort, page, status };
}

export function sortToOrder(sort: RegistrySort): {
  column: "created_at" | "title";
  ascending: boolean;
} {
  switch (sort) {
    case "oldest":
      return { column: "created_at", ascending: true };
    case "title_asc":
      return { column: "title", ascending: true };
    case "title_desc":
      return { column: "title", ascending: false };
    default:
      return { column: "created_at", ascending: false };
  }
}
