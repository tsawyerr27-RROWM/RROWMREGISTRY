"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { studioCertAckKey } from "@/lib/studio-signals";

export type StudioPortfolioCardProps = {
  registryId: string | null;
  title: string;
  artistLabel: string;
  imageUrl: string | null;
  verificationStatus: string | null;
  certLabel: "Certificate recorded" | "Revoked" | "Certificate not recorded";
  latestValueLabel: string | null;
  /** From `ownershipStatusBadge` — tiered weight/tone for ledger clarity */
  ownershipStatusPresentation: { label: string; className: string };
  /** Optional identity line (e.g. “You hold this work”, “Held by …”) */
  heldByLine?: { label: string; href?: string | null; emphasized?: boolean };
  /** When false, hides declared value on public surfaces */
  showDeclaredValue?: boolean;
  /** When false, hides ownership / ledger line on public surfaces */
  showOwnershipDetail?: boolean;
  href: string;
  /** Subtle state signals — keep minimal */
  signalPendingSale?: boolean;
  signalOwnershipUnverified?: boolean;
  /** Certificate issued; local “seen” unset → gentle nudge */
  signalCertificateUnseen?: boolean;
};

export function StudioPortfolioCard({
  registryId,
  title,
  artistLabel,
  imageUrl,
  verificationStatus,
  certLabel,
  latestValueLabel,
  ownershipStatusPresentation,
  heldByLine,
  showDeclaredValue = true,
  showOwnershipDetail = true,
  href,
  signalPendingSale = false,
  signalOwnershipUnverified = false,
  signalCertificateUnseen = false,
}: StudioPortfolioCardProps) {
  const verified = verificationStatus === "verified";
  const [certAcked, setCertAcked] = useState(true);

  useEffect(() => {
    if (!registryId || !signalCertificateUnseen) {
      setCertAcked(true);
      return;
    }
    try {
      setCertAcked(Boolean(localStorage.getItem(studioCertAckKey(registryId))));
    } catch {
      setCertAcked(true);
    }
  }, [registryId, signalCertificateUnseen]);

  useEffect(() => {
    if (!registryId || !signalCertificateUnseen) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === studioCertAckKey(registryId)) setCertAcked(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [registryId, signalCertificateUnseen]);

  const showCertPulse =
    signalCertificateUnseen && registryId && !certAcked;

  const hasQuietSignal = signalPendingSale || signalOwnershipUnverified || showCertPulse;

  return (
    <Link
      href={href}
      className={`liquid-glass-tile group block overflow-hidden transition duration-200 ease-out hover:-translate-y-0.5 ${
        signalPendingSale
          ? "shadow-[0_24px_48px_-28px_rgba(245,158,11,0.25)]"
          : signalOwnershipUnverified
            ? "shadow-[0_20px_44px_-30px_rgba(15,23,42,0.12)]"
            : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-200 ease-out group-hover:scale-[1.01]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-400">
            No image
          </div>
        )}
        {hasQuietSignal ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-3 pb-2.5 pt-8">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-white/85">
              {signalPendingSale ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-200/90" aria-hidden />
                  Sale recorded — complete transfer
                </span>
              ) : null}
              {signalOwnershipUnverified ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
                  Ownership awaiting verification
                </span>
              ) : null}
              {showCertPulse ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
                  Certificate unseen
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className="space-y-2.5 px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              verified
                ? "bg-neutral-100 text-neutral-800 ring-1 ring-black/[0.08]"
                : "bg-neutral-100 text-neutral-600 ring-1 ring-black/[0.06]"
            }`}
          >
            {verified ? "Verified" : "Registered"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              certLabel === "Revoked"
                ? "bg-red-50 text-red-800 ring-1 ring-red-200/80"
                : certLabel === "Certificate recorded"
                  ? "bg-neutral-50 text-neutral-700 ring-1 ring-black/[0.06]"
                  : "bg-white/80 text-neutral-500 ring-1 ring-black/[0.06]"
            }`}
          >
            {certLabel}
          </span>
        </div>
        <div>
          <h3 className="font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950">
            {title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{artistLabel}</p>
          {heldByLine?.label ? (
            heldByLine.href ? (
              <Link
                href={heldByLine.href}
                className={`mt-2 inline-block text-[12px] leading-snug underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-500 ${
                  heldByLine.emphasized ? "font-medium text-neutral-800" : "text-neutral-600"
                }`}
              >
                {heldByLine.label}
              </Link>
            ) : (
              <p
                className={`mt-2 text-[12px] leading-snug ${
                  heldByLine.emphasized ? "font-medium text-neutral-800" : "text-neutral-600"
                }`}
              >
                {heldByLine.label}
              </p>
            )
          ) : null}
          {registryId ? (
            <p className="mt-1 font-mono text-[10px] text-neutral-400">
              {registryId}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 border-t border-black/[0.05] pt-3">
          {showDeclaredValue ? (
            <div>
              <p className="text-sm text-neutral-400">
                Latest value
              </p>
              <p className="text-sm font-normal text-neutral-800 tabular-nums">
                {latestValueLabel ?? "—"}
              </p>
            </div>
          ) : (
            <div aria-hidden className="min-w-0 flex-1" />
          )}
          {showOwnershipDetail ? (
            <p
              className={`max-w-[14rem] text-right text-[11px] leading-snug ${ownershipStatusPresentation.className}`}
            >
              {ownershipStatusPresentation.label}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
