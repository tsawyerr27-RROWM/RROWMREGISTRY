import { redirect } from "next/navigation";

import {
  creativeExplorerQueryString,
  FIELD_PROFILE_PAGE_SIZE,
  type CreativeExplorerSort,
  type CreativeExplorerVerifiedFilter,
} from "@/lib/field-creative-explorer-params";

export function redirectIfCreativeExplorerPageOutOfRange(
  pathname: string,
  page: number,
  total: number,
  args: {
    q: string;
    sort: CreativeExplorerSort;
    practice: string;
    verified: CreativeExplorerVerifiedFilter;
  }
) {
  if (total === 0) return;
  const totalPages = Math.max(1, Math.ceil(total / FIELD_PROFILE_PAGE_SIZE));
  if (page <= totalPages) return;

  const qs = creativeExplorerQueryString({ ...args, page: totalPages });
  redirect(qs ? `${pathname}?${qs}` : pathname);
}
