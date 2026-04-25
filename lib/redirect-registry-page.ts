import { redirect } from "next/navigation";
import { REGISTRY_PAGE_SIZE } from "@/lib/registry-list-params";

/** If URL page is past the last page, redirect to the last page (preserves q, sort, status). */
export function redirectIfPageOutOfRange(
  pathname: string,
  page: number,
  total: number,
  q: string,
  sort: string,
  status?: string
) {
  if (total === 0) return;
  const totalPages = Math.max(1, Math.ceil(total / REGISTRY_PAGE_SIZE));
  if (page <= totalPages) return;

  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (sort !== "newest") p.set("sort", sort);
  if (status && status !== "all") p.set("status", status);
  if (totalPages > 1) p.set("page", String(totalPages));
  const qs = p.toString();
  redirect(qs ? `${pathname}?${qs}` : pathname);
}
