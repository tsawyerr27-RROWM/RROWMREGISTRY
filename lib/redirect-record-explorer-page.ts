import { redirect } from "next/navigation";

import {
  FIELD_RECORD_EXPLORER_PAGE_SIZE,
  recordExplorerQueryString,
  type RecordExplorerCertificateFilter,
  type RecordExplorerSort,
  type RecordExplorerTrustFilter,
} from "@/lib/field-record-explorer-params";

export function redirectIfRecordExplorerPageOutOfRange(
  pathname: string,
  page: number,
  total: number,
  args: {
    q: string;
    sort: RecordExplorerSort;
    creative: string;
    organisation: string;
    practice: string;
    trust: RecordExplorerTrustFilter;
    certificate: RecordExplorerCertificateFilter;
  }
) {
  if (total === 0) return;
  const totalPages = Math.max(
    1,
    Math.ceil(total / FIELD_RECORD_EXPLORER_PAGE_SIZE)
  );
  if (page <= totalPages) return;

  const qs = recordExplorerQueryString({ ...args, page: totalPages });
  redirect(qs ? `${pathname}?${qs}` : pathname);
}
