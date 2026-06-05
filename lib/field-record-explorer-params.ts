import { REGISTRY_PAGE_SIZE } from "@/lib/registry-list-params";

export { REGISTRY_PAGE_SIZE as FIELD_RECORD_EXPLORER_PAGE_SIZE };

export type RecordExplorerSort = "recent" | "oldest" | "title_asc" | "title_desc";

export type RecordExplorerVerifiedFilter = "all" | "verified";

export type RecordExplorerCertificateFilter = "all" | "present";

/** Verified-only is the default when `verified` is absent (Phase 2B founder freeze §2). */
export function parseRecordExplorerVerifiedParam(
  sp: Record<string, string | string[] | undefined>
): { verified: RecordExplorerVerifiedFilter; verifiedScopeExplicit: boolean } {
  if (!Object.prototype.hasOwnProperty.call(sp, "verified")) {
    return { verified: "verified", verifiedScopeExplicit: false };
  }

  const verifiedRaw = typeof sp.verified === "string" ? sp.verified.trim().toLowerCase() : "";

  if (verifiedRaw === "0" || verifiedRaw === "all" || verifiedRaw === "false") {
    return { verified: "all", verifiedScopeExplicit: true };
  }

  return { verified: "verified", verifiedScopeExplicit: true };
}

export function parseRecordExplorerParams(
  sp: Record<string, string | string[] | undefined>
) {
  const q = typeof sp.q === "string" ? sp.q : "";

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "recent";
  let sort: RecordExplorerSort = "recent";
  if (sortRaw === "newest" || sortRaw === "recent") sort = "recent";
  else if (sortRaw === "oldest") sort = "oldest";
  else if (sortRaw === "title_asc" || sortRaw === "title_desc") sort = sortRaw;

  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1
  );

  const creative = typeof sp.creative === "string" ? sp.creative.trim() : "";
  const organisation =
    typeof sp.organisation === "string" ? sp.organisation.trim() : "";

  const practiceRaw = typeof sp.practice === "string" ? sp.practice.trim() : "";
  const practice = practiceRaw ? practiceRaw.toLowerCase() : "";

  const { verified, verifiedScopeExplicit } = parseRecordExplorerVerifiedParam(sp);

  const certificateRaw =
    typeof sp.certificate === "string" ? sp.certificate : "all";
  const certificate: RecordExplorerCertificateFilter =
    certificateRaw === "1" || certificateRaw === "true" ? "present" : "all";

  return {
    q,
    sort,
    page,
    creative,
    organisation,
    practice,
    verified,
    verifiedScopeExplicit,
    certificate,
  };
}

export function recordExplorerQueryString(args: {
  q: string;
  sort: RecordExplorerSort;
  page: number;
  creative: string;
  organisation: string;
  practice: string;
  verified: RecordExplorerVerifiedFilter;
  certificate: RecordExplorerCertificateFilter;
}): string {
  const params = new URLSearchParams();
  const trimmedQ = args.q.trim();
  if (trimmedQ) params.set("q", trimmedQ);
  if (args.creative) params.set("creative", args.creative);
  if (args.organisation) params.set("organisation", args.organisation);
  if (args.practice) params.set("practice", args.practice);
  if (args.sort !== "recent") params.set("sort", args.sort);
  if (args.verified === "all") params.set("verified", "0");
  if (args.certificate === "present") params.set("certificate", "1");
  if (args.page > 1) params.set("page", String(args.page));
  return params.toString();
}

/** Map legacy `/registry` query params to Field Record Explorer. */
export function recordExplorerQueryFromLegacyRegistry(
  sp: Record<string, string | string[] | undefined>
): string {
  const q = typeof sp.q === "string" ? sp.q : "";
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "recent";
  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1
  );
  const statusRaw = typeof sp.status === "string" ? sp.status : "all";

  let sort: RecordExplorerSort = "recent";
  if (sortRaw === "oldest") sort = "oldest";
  else if (sortRaw === "title_asc") sort = "title_asc";
  else if (sortRaw === "title_desc") sort = "title_desc";

  const verified: RecordExplorerVerifiedFilter =
    statusRaw === "verified" ? "verified" : "all";

  return recordExplorerQueryString({
    q,
    sort,
    page,
    creative: "",
    organisation: "",
    practice: "",
    verified,
    certificate: "all",
  });
}
