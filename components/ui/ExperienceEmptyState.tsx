import Link from "next/link";
import type { ReactNode } from "react";

type ExperienceEmptyStateProps = {
  title: string;
  body: string;
  /** Optional slot between body and action (e.g. one input before a single submit) */
  betweenBodyAndAction?: ReactNode;
  /** Single primary action — omit for copy-only states */
  action?: ReactNode;
  className?: string;
};

/**
 * Centered, editorial empty state: one calm message and one primary action.
 */
export function ExperienceEmptyState({
  title,
  body,
  betweenBodyAndAction,
  action,
  className = "",
}: ExperienceEmptyStateProps) {
  return (
    <div
      className={`rrowm-surface mx-auto max-w-md px-11 py-16 text-center md:px-12 md:py-[4.25rem] ${className}`}
    >
      <h3 className="font-serif text-[1.35rem] font-normal leading-snug tracking-tight text-neutral-950 md:text-2xl">
        {title}
      </h3>
      <p className="mt-5 text-sm leading-[1.65] text-neutral-600">{body}</p>
      {betweenBodyAndAction ? (
        <div className="mt-9 text-left">{betweenBodyAndAction}</div>
      ) : null}
      {action ? (
        <div className="mt-11 flex justify-center">{action}</div>
      ) : null}
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
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
    >
      {label}
    </button>
  );
}

type ExperienceEmptyStateLinkProps = {
  label: string;
  href: string;
};

export function ExperienceEmptyStateLink({
  label,
  href,
}: ExperienceEmptyStateLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-xl bg-neutral-950 px-8 py-3.5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-neutral-900"
    >
      {label}
    </Link>
  );
}

type ExperienceSubtleHintProps = {
  children: string;
  className?: string;
};

/** Short, non-banner guidance; omit when no longer needed */
export function ExperienceSubtleHint({
  children,
  className = "",
}: ExperienceSubtleHintProps) {
  return (
    <p
      className={`liquid-glass-inset px-7 py-5 text-center text-sm leading-[1.65] text-neutral-600 ${className}`}
    >
      {children}
    </p>
  );
}
