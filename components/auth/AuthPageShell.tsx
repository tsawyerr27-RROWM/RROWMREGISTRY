import type { ReactNode } from "react";

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

/**
 * Shared layout for sign-in, sign-up, and password recovery — responsive, touch-friendly.
 */
export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  reserveHeaderOffset = true,
  cardBelow,
}: Props) {
  const topPad = reserveHeaderOffset
    ? "pt-24 sm:pt-28"
    : "pt-12 sm:pt-16 md:pt-20";

  return (
    <main
      className={`ds-page-environment flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16 ${topPad}`}
    >
      <div className="w-full max-w-[min(100%,26rem)] sm:max-w-md">
        <div className="rounded-2xl border border-black/[0.08] bg-white/95 p-6 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-sm sm:p-8 md:rounded-[1.25rem] md:p-9">
          <header className="border-b border-black/[0.06] pb-6 sm:pb-8">
            <h1 className="font-serif text-[1.65rem] font-normal leading-tight tracking-tight text-neutral-950 sm:text-3xl md:text-[1.85rem]">
              {title}
            </h1>
            {subtitle ? (
              <div className="mt-3 text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
                {subtitle}
              </div>
            ) : null}
          </header>
          <div className="pt-6 sm:pt-8">{children}</div>
          {footer ? (
            <div className="mt-8 border-t border-black/[0.06] pt-6 text-center sm:mt-9 sm:pt-7">
              {footer}
            </div>
          ) : null}
        </div>
        {cardBelow === undefined ? (
          <p className="mt-6 text-center text-[11px] leading-relaxed text-neutral-500 sm:text-xs">
            Protected access. Use a strong password you do not reuse elsewhere.
          </p>
        ) : (
          cardBelow
        )}
      </div>
    </main>
  );
}
