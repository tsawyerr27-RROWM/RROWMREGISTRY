import { redirect } from "next/navigation";

import {
  FIELD_PROFILE_PAGE_SIZE,
  organisationExplorerQueryString,
  type OrganisationExplorerRepresentedFilter,
  type OrganisationExplorerSort,
  type OrganisationExplorerVerifiedFilter,
} from "@/lib/field-organisation-explorer-params";

export function redirectIfOrganisationExplorerPageOutOfRange(
  pathname: string,
  page: number,
  total: number,
  args: {
    q: string;
    sort: OrganisationExplorerSort;
    location: string;
    verified: OrganisationExplorerVerifiedFilter;
    represented: OrganisationExplorerRepresentedFilter;
  }
) {
  if (total === 0) return;
  const totalPages = Math.max(1, Math.ceil(total / FIELD_PROFILE_PAGE_SIZE));
  if (page <= totalPages) return;

  const qs = organisationExplorerQueryString({ ...args, page: totalPages });
  redirect(qs ? `${pathname}?${qs}` : pathname);
}
