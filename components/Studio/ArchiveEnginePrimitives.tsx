"use client";

import Link from "next/link";
import type {
  CSSProperties,
  ReactNode,
} from "react";

import type { ArchiveImageIntent } from "@/lib/living-archive";
import { studioV2 } from "@/styles/studio-v2";

export function ArchiveLayout({
  ariaLabel,
  navigation,
  children,
}: {
  ariaLabel: string;
  navigation: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={`${studioV2.scope} living-archive-viewport`}
      aria-label={ariaLabel}
    >
      {navigation}
      {children}
    </section>
  );
}

export function ArchiveNavigation({
  positionLabel,
  hint,
}: {
  positionLabel: string;
  hint: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 px-1">
      <p className="v2-type-mono text-[10px] uppercase tracking-[0.16em] text-[var(--v2-ink-muted)]">
        {positionLabel}
      </p>
      <p className="hidden text-xs text-[var(--v2-ink-muted)] sm:block">
        {hint}
      </p>
    </div>
  );
}

export function ArchiveImage({
  title,
  imageUrl,
  imageWidth,
  imageHeight,
  intent,
  failed,
  unavailableLabel,
  onError,
}: {
  title: string;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  intent: ArchiveImageIntent;
  failed: boolean;
  unavailableLabel: string;
  onError: () => void;
}) {
  const shouldMount = intent !== "deferred";
  const width = imageWidth && imageWidth > 0 ? imageWidth : 1200;
  const height = imageHeight && imageHeight > 0 ? imageHeight : 1500;

  return (
    <div className="relative min-h-0 flex-[1_1_62%] overflow-hidden bg-[var(--v2-paper-sunk,#efe9df)] lg:h-full lg:flex-auto">
      {imageUrl && !failed && shouldMount ? (
        // The source is user-managed media; the shared policy still supplies
        // dimensions, decoding, priority and a stable failure surface.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          width={width}
          height={height}
          loading={intent === "priority" ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={intent === "priority" ? "high" : "auto"}
          onError={onError}
          className="h-full w-full object-contain p-3 sm:p-5 lg:p-8"
        />
      ) : imageUrl && !failed ? (
        <div
          className="h-full min-h-[20rem] bg-[var(--v2-paper-sunk,#efe9df)]"
          aria-hidden
        />
      ) : (
        <div className="flex h-full min-h-[20rem] items-center justify-center px-8 text-center">
          <div>
            <p className="v2-type-mono text-[9px] uppercase tracking-[0.2em] text-[var(--v2-cool-grey)]">
              {unavailableLabel}
            </p>
            <p className="v2-type-display mt-3 text-xl text-[var(--v2-ink-muted)]">
              {title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArchiveMetadata({
  registryState,
  registryId,
  title,
  creator,
  year,
  medium,
  actions,
}: {
  registryState?: ReactNode;
  registryId?: string | null;
  title: string;
  creator?: string | null;
  year?: string | number | null;
  medium?: string | null;
  actions?: ReactNode;
}) {
  return (
    <div className="living-archive-viewport__metadata relative z-10 -mt-3 flex max-h-[42%] shrink-0 flex-col overflow-y-auto rounded-t-xl border-t border-[var(--v2-border)] bg-[var(--v2-paper-bone,#f4efe6)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-5 sm:max-h-none sm:px-7 lg:mt-0 lg:h-full lg:max-h-none lg:justify-end lg:rounded-none lg:border-l lg:border-t-0 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-center gap-2">
        {registryState}
        {registryId ? (
          <span className="v2-type-mono text-[9px] tracking-[0.1em] text-[var(--v2-cool-grey)]">
            {registryId}
          </span>
        ) : null}
      </div>
      <h3 className="v2-type-display mt-3 text-[clamp(1.65rem,8vw,2.65rem)] leading-[0.98] tracking-[-0.025em] text-[var(--v2-ink)] sm:text-[clamp(1.65rem,4vw,2.65rem)]">
        {title}
      </h3>
      {creator ? (
        <p className="mt-3 text-sm text-[var(--v2-ink)]">{creator}</p>
      ) : null}
      <p className="mt-2 text-sm text-[var(--v2-ink-muted)]">
        {[year, medium].filter(Boolean).join(" · ") || "–"}
      </p>
      {actions}
    </div>
  );
}

export function ArchiveActions({
  href,
  onOpen,
  onBeforeOpen,
  openLabel,
  children,
}: {
  href?: string;
  onOpen?: () => void;
  onBeforeOpen?: () => void;
  openLabel: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--v2-border)] pt-4">
      {onOpen ? (
        <button
          type="button"
          onClick={() => {
            onBeforeOpen?.();
            onOpen();
          }}
          className="v2-cta-primary inline-flex min-h-[44px] items-center px-4 py-2 text-xs"
        >
          {openLabel}
        </button>
      ) : href ? (
        <Link
          href={href}
          onClick={onBeforeOpen}
          className="v2-cta-primary inline-flex min-h-[44px] items-center px-4 py-2 text-xs"
        >
          {openLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}

export function ArchiveEmptyState({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${studioV2.scope} rounded-lg border border-[var(--v2-border)] bg-white/85 px-6 py-12 text-center text-[15px] text-[var(--v2-ink-muted)]`}
    >
      {children}
    </div>
  );
}

export function ArchiveLoadingState({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`${studioV2.scope} min-h-[36rem] animate-pulse rounded-xl border border-[var(--v2-border)] bg-[var(--v2-paper-sunk,#efe9df)] motion-reduce:animate-none ${className}`}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

export const archiveItemContainmentStyle = {
  contentVisibility: "auto",
  containIntrinsicSize: "760px",
} satisfies CSSProperties;
