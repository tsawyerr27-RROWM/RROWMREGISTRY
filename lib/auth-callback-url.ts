import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import { getSiteUrl } from "@/lib/site-url";

/** Public origin for auth email links (must match Supabase redirect allowlist). */
export function getPublicSiteOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

/** Build `/auth/callback` URL with a safe post-auth relative path. */
export function buildAuthCallbackUrl(nextPath: string): string {
  const next = sanitizeAuthReturnPath(nextPath) ?? "/onboarding";
  return `${getPublicSiteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export const PASSWORD_RESET_RETURN_PATH = "/reset-password";
