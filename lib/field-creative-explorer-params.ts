import { isPracticeSlug } from "@/lib/practice-types";

/** Page size for Field Creative Explorer — aligned with registry list norms. */
export const FIELD_PROFILE_PAGE_SIZE = 12;

export type CreativeExplorerSort = "name_asc" | "name_desc" | "recent";

export type CreativeExplorerVerifiedFilter = "all" | "verified";

export function parseCreativeExplorerParams(
  sp: Record<string, string | string[] | undefined>
) {
  const q = typeof sp.q === "string" ? sp.q : "";

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "name_asc";
  const sort: CreativeExplorerSort = (
    ["name_asc", "name_desc", "recent"] as const
  ).includes(sortRaw as CreativeExplorerSort)
    ? (sortRaw as CreativeExplorerSort)
    : "name_asc";

  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1
  );

  const practiceRaw = typeof sp.practice === "string" ? sp.practice.trim() : "";
  const practice =
    practiceRaw && isPracticeSlug(practiceRaw)
      ? practiceRaw.toLowerCase()
      : "";

  const verifiedRaw = typeof sp.verified === "string" ? sp.verified : "all";
  const verified: CreativeExplorerVerifiedFilter =
    verifiedRaw === "1" || verifiedRaw === "true" ? "verified" : "all";

  return { q, sort, page, practice, verified };
}

export function creativeExplorerQueryString(args: {
  q: string;
  sort: CreativeExplorerSort;
  page: number;
  practice: string;
  verified: CreativeExplorerVerifiedFilter;
}): string {
  const params = new URLSearchParams();
  const trimmedQ = args.q.trim();
  if (trimmedQ) params.set("q", trimmedQ);
  if (args.sort !== "name_asc") params.set("sort", args.sort);
  if (args.practice) params.set("practice", args.practice);
  if (args.verified === "verified") params.set("verified", "1");
  if (args.page > 1) params.set("page", String(args.page));
  return params.toString();
}
