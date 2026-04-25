"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentValue,
  readCookieConsent,
} from "@/lib/cookie-consent";

function dispatchConsent(value: CookieConsentValue) {
  window.dispatchEvent(
    new CustomEvent("rrowm-cookie-consent", { detail: { value } })
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readCookieConsent();
    setVisible(existing === null);
  }, []);

  const persist = useCallback((value: CookieConsentValue) => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    } catch {
      /* ignore quota / private mode */
    }
    dispatchConsent(value);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] md:p-6 md:pb-[max(2rem,env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-label="Cookie preferences"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto w-full max-w-lg border border-black/[0.06] bg-white/85 px-5 py-5 shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl md:max-w-2xl md:px-7 md:py-6"
      >
        <p className="text-[13px] leading-relaxed text-neutral-600 md:text-sm">
          We use cookies to maintain core functionality and improve the
          experience.{" "}
          <Link
            href="/privacy"
            className="text-neutral-800 underline decoration-neutral-300 underline-offset-[0.2em] transition hover:text-neutral-950 hover:decoration-neutral-500"
          >
            Privacy
          </Link>
          {" · "}
          <Link
            href="/terms"
            className="text-neutral-800 underline decoration-neutral-300 underline-offset-[0.2em] transition hover:text-neutral-950 hover:decoration-neutral-500"
          >
            Terms
          </Link>
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => persist("accepted")}
            className="rounded-lg bg-neutral-950 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => persist("declined")}
            className="rounded-lg border border-black/[0.08] bg-white/60 px-4 py-2.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
