"use client";

import type { ReactNode } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** When false, less top padding (e.g. global header hidden for invite signup). */
  reserveHeaderOffset?: boolean;
  /** Replace default password hint under the card; pass null to omit. */
  cardBelow?: ReactNode | null;
};

function AuthNarrativePanel() {
  const { t } = useLocalePreferences();

  return (
    <div className="auth-page-narrative relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center">
      <div className="auth-page-narrative__texture pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-[1] max-w-md px-2 py-8">
        <p className="v2-type-mono text-[10px] uppercase tracking-[0.24em] text-[var(--v2-ink-muted)]">
          {t("auth.enterRail")}
        </p>
        <h2 className="mt-6 font-serif text-[clamp(2.25rem,4vw,3rem)] font-normal leading-[1.02] tracking-[-0.03em] text-[var(--v2-ink)]">
          {t("auth.enterTitle")}
        </h2>
        <div className="mt-8 space-y-1 font-serif text-[1.35rem] leading-snug text-[var(--v2-ink-soft)]">
          <p>{t("auth.enterLine1")}</p>
          <p>{t("auth.enterLine2")}</p>
          <p>{t("auth.enterLine3")}</p>
        </div>
        <p className="mt-8 max-w-sm text-sm leading-relaxed text-[var(--v2-ink-muted)]">
          {t("auth.enterBody")}
        </p>
      </div>
    </div>
  );
}

/**
 * Shared layout for sign-in, sign-up, and password recovery — registry access node.
 */
export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  reserveHeaderOffset = true,
  cardBelow,
}: Props) {
  const { t } = useLocalePreferences();
  const topPad = reserveHeaderOffset
    ? "pt-24 sm:pt-28"
    : "pt-12 sm:pt-16 md:pt-20";

  return (
    <main
      className={`auth-page-shell ds-page-environment flex min-h-[100dvh] flex-col items-center px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16 ${topPad}`}
    >
      <div className={`${studioV2.scope} grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-14`}>
        <AuthNarrativePanel />

        <div className="w-full max-w-[min(100%,26rem)] justify-self-center sm:max-w-md lg:max-w-none lg:justify-self-end">
          <div
            className={`${studioV2.surface.filingSheetMajor} studio-reveal relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8`}
          >
            <header className="border-b border-[var(--v2-border)] pb-6 sm:pb-7">
              <p className="v2-type-mono text-[9px] uppercase tracking-[0.22em] text-[var(--v2-ink-muted)]">
                {t("auth.accessRail")}
              </p>
              <h1 className="mt-3 font-serif text-[1.65rem] font-normal leading-tight tracking-tight text-[var(--v2-ink)] sm:text-[1.85rem]">
                {title}
              </h1>
              {subtitle ? (
                <div className="mt-3 text-[14px] leading-relaxed text-[var(--v2-ink-muted)] sm:text-[15px]">
                  {subtitle}
                </div>
              ) : null}
            </header>
            <div className="pt-6 sm:pt-7">{children}</div>
            {footer ? (
              <div className="mt-8 border-t border-[var(--v2-border)] pt-6 text-center sm:mt-9 sm:pt-7">
                {footer}
              </div>
            ) : null}
          </div>
          {cardBelow === undefined ? (
            <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--v2-ink-muted)] sm:text-xs">
              Protected access. Use a strong password you do not reuse elsewhere.
            </p>
          ) : (
            cardBelow
          )}
        </div>
      </div>
    </main>
  );
}
