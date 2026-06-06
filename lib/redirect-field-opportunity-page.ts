import { redirect } from "next/navigation";

import {
  FIELD_OPPORTUNITY_PAGE_SIZE,
  fieldOpportunityQueryString,
  type FieldOpportunityListParams,
} from "@/lib/field-opportunity-params";

export function redirectIfFieldOpportunityPageOutOfRange(
  pathname: string,
  page: number,
  total: number,
  params: Omit<FieldOpportunityListParams, "page">
) {
  if (total === 0) return;
  const totalPages = Math.max(1, Math.ceil(total / FIELD_OPPORTUNITY_PAGE_SIZE));
  if (page <= totalPages) return;

  const qs = fieldOpportunityQueryString({ ...params, page: totalPages });
  redirect(qs ? `${pathname}?${qs}` : pathname);
}
