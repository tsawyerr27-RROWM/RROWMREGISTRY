import { homePathForRole } from "@/lib/onboarding";

export type StudioActorRole = "artist" | "collector" | "gallery";

/** Paths under `/studio` that skip the layout auth guard (matrix: restore token flow). */
export function studioLayoutGuardSkipsPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const base = pathname.split("?")[0]?.replace(/\/$/, "") || "";
  return base === "/studio/account/restore";
}

/** Role required for dashboard segments; `null` = any onboarded role (account, archive). */
export function requiredStudioRoleForPath(
  pathname: string | null
): StudioActorRole | null {
  if (!pathname) return null;
  if (pathname.startsWith("/studio/creative")) return "artist";
  if (pathname.startsWith("/studio/collector")) return "collector";
  if (pathname.startsWith("/studio/organisation")) return "gallery";
  return null;
}

export function studioRoleHomeMismatch(
  actorRole: string | null | undefined,
  pathname: string | null
): string | null {
  const required = requiredStudioRoleForPath(pathname);
  if (!required || !actorRole) return null;
  if (actorRole === required) return null;
  return homePathForRole(actorRole);
}
