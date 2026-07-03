import { REGISTRY_PAGE_SIZE } from "@/lib/registry-list-params";
import {
  parseRecordExplorerTrustParam,
  RECORD_EXPLORER_TRUST_FILTERS,
  type RecordExplorerTrustFilter,
  recordExplorerTrustQueryValue,
} from "@/lib/artwork-trust-tier";

export { RECORD_EXPLORER_TRUST_FILTERS };

export { REGISTRY_PAGE_SIZE as FIELD_RECORD_EXPLORER_PAGE_SIZE };

export type RecordExplorerSort = "recent" | "oldest" | "title_asc" | "title_desc";

/** @deprecated Use RecordExplorerTrustFilter */
export type RecordExplorerVerifiedFilter = "all" | "verified";

export type { RecordExplorerTrustFilter };

export type RecordExplorerCertificateFilter = "all" | "present";

/** Trust tier filter — default all tiers (filed works are public registry facts). */
export function parseRecordExplorerVerifiedParam(
  sp: Record<string, string | string[] | undefined>
): { verified: RecordExplorerVerifiedFilter; verifiedScopeExplicit: boolean } {
  const { trust, trustScopeExplicit } = parseRecordExplorerTrustParam(sp);
  if (trust === "verified") {
    return { verified: "verified", verifiedScopeExplicit: trustScopeExplicit };
  }
  return { verified: "all", verifiedScopeExplicit: trustScopeExplicit };
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

  const { trust, trustScopeExplicit } = parseRecordExplorerTrustParam(sp);
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
    trust,
    trustScopeExplicit,
    verified,
    verifiedScopeExplicit: verifiedScopeExplicit || trustScopeExplicit,
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
  trust?: RecordExplorerTrustFilter;
  verified?: RecordExplorerVerifiedFilter;
  certificate: RecordExplorerCertificateFilter;
}): string {
  const params = new URLSearchParams();
  const trimmedQ = args.q.trim();
  if (trimmedQ) params.set("q", trimmedQ);
  if (args.creative) params.set("creative", args.creative);
  if (args.organisation) params.set("organisation", args.organisation);
  if (args.practice) params.set("practice", args.practice);
  if (args.sort !== "recent") params.set("sort", args.sort);

  const trust = args.trust ?? (args.verified === "verified" ? "verified" : "all");
  const trustValue = recordExplorerTrustQueryValue(trust);
  if (trustValue && trustValue !== "all") {
    params.set("trust", trustValue);
  } else if (args.verified === "all") {
    params.set("verified", "0");
  }

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

  const trust: RecordExplorerTrustFilter =
    statusRaw === "verified" ? "verified" : "all";

  return recordExplorerQueryString({
    q,
    sort,
    page,
    creative: "",
    organisation: "",
    practice: "",
    trust,
    certificate: "all",
  });
}
