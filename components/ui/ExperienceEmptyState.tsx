import Link from "next/link";
import type { ReactNode } from "react";

import { studioV2 } from "@/styles/studio-v2";

type ExperienceEmptyStateProps = {
  title: string;
  body: string;
  betweenBodyAndAction?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Institutional archive empty state — filing sheet, serif heading, calm copy. */
export function ExperienceEmptyState({
  title,
  body,
  betweenBodyAndAction,
  action,
  className = "",
}: ExperienceEmptyStateProps) {
  return (
    <div
      className={`${studioV2.scope} ${studioV2.surface.filingSheet} mx-auto max-w-md px-8 py-14 text-center md:px-10 md:py-16 ${className}`}
    >
      <h3 className="font-serif text-[1.35rem] font-normal leading-snug tracking-tight text-[var(--v2-ink)] md:text-[1.65rem]">
        {title}
      </h3>
      <p className="mt-5 text-sm leading-[1.65] text-[var(--v2-ink-muted)]">{body}</p>
      {betweenBodyAndAction ? (
        <div className="mt-9 text-left">{betweenBodyAndAction}</div>
      ) : null}
      {action ? <div className="mt-10 flex justify-center">{action}</div> : null}
    </div>
  );
}

type ExperienceEmptyStateButtonProps = {
  label: string;
  onClick: () => void;
};

export function ExperienceEmptyStateButton({
  label,
  onClick,
}: ExperienceEmptyStateButtonProps) {
  return (
    <button type="button" onClick={onClick} className="v2-cta-primary min-h-[44px] px-8 py-3 text-xs">
      {label}
    </button>
  );
}

type ExperienceEmptyStateLinkProps = {
  label: string;
  href: string;
};

export function ExperienceEmptyStateLink({ label, href }: ExperienceEmptyStateLinkProps) {
  return (
    <Link href={href} className="v2-cta-primary inline-flex min-h-[44px] items-center px-8 py-3 text-xs">
      {label}
    </Link>
  );
}

type ExperienceSubtleHintProps = {
  children: string;
  className?: string;
};

export function ExperienceSubtleHint({ children, className = "" }: ExperienceSubtleHintProps) {
  return (
    <p
      className={`rounded-lg border border-[var(--v2-border)] bg-white/85 px-6 py-4 text-center text-sm leading-[1.65] text-[var(--v2-ink-muted)] ${className}`}
    >
      {children}
    </p>
  );
}
