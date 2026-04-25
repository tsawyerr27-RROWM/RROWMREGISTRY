/** Client-side cookie consent storage — core session features are unaffected. */

export const COOKIE_CONSENT_STORAGE_KEY = "rrowm_cookie_consent";

export type CookieConsentValue = "accepted" | "declined";

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === "accepted" || raw === "declined") return raw;
    return null;
  } catch {
    return null;
  }
}

/** Non-essential analytics / measurement scripts should only run when this is true. */
export function analyticsAllowed(): boolean {
  return readCookieConsent() === "accepted";
}
