/** Browser helper: fetch CSRF token for registry mutation requests. */
export async function fetchRegistryCsrfToken(): Promise<string | null> {
  const res = await fetch("/api/registry/csrf", { credentials: "include" });
  if (!res.ok) return null;
  const body = (await res.json()) as { csrfToken?: string };
  return body.csrfToken ?? null;
}
