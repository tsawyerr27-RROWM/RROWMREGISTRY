import { FIELD_PROFILE_PAGE_SIZE } from "@/lib/field-creative-explorer-params";

export { FIELD_PROFILE_PAGE_SIZE };

export type OrganisationExplorerSort = "name_asc" | "name_desc" | "recent";

export type OrganisationExplorerVerifiedFilter = "all" | "verified";

export type OrganisationExplorerRepresentedFilter = "all" | "represented";

export function parseOrganisationExplorerParams(
  sp: Record<string, string | string[] | undefined>
) {
  const q = typeof sp.q === "string" ? sp.q : "";

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "name_asc";
  const sort: OrganisationExplorerSort = (
    ["name_asc", "name_desc", "recent"] as const
  ).includes(sortRaw as OrganisationExplorerSort)
    ? (sortRaw as OrganisationExplorerSort)
    : "name_asc";

  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1
  );

  const location = typeof sp.location === "string" ? sp.location.trim() : "";

  const verifiedRaw = typeof sp.verified === "string" ? sp.verified : "all";
  const verified: OrganisationExplorerVerifiedFilter =
    verifiedRaw === "1" || verifiedRaw === "true" ? "verified" : "all";

  const representedRaw =
    typeof sp.represented === "string" ? sp.represented : "all";
  const represented: OrganisationExplorerRepresentedFilter =
    representedRaw === "1" || representedRaw === "true" ? "represented" : "all";

  return { q, sort, page, location, verified, represented };
}

export function organisationExplorerQueryString(args: {
  q: string;
  sort: OrganisationExplorerSort;
  page: number;
  location: string;
  verified: OrganisationExplorerVerifiedFilter;
  represented: OrganisationExplorerRepresentedFilter;
}): string {
  const params = new URLSearchParams();
  const trimmedQ = args.q.trim();
  if (trimmedQ) params.set("q", trimmedQ);
  if (args.location.trim()) params.set("location", args.location.trim());
  if (args.sort !== "name_asc") params.set("sort", args.sort);
  if (args.verified === "verified") params.set("verified", "1");
  if (args.represented === "represented") params.set("represented", "1");
  if (args.page > 1) params.set("page", String(args.page));
  return params.toString();
}
