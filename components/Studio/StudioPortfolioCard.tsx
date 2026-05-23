"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArtworkDeclaredValueBlock } from "@/components/Studio/ArtworkDeclaredValueBlock";
import { studioCertAckKey } from "@/lib/studio-signals";
import { workspace } from "@/styles/workspace-design";

export type StudioPortfolioCardProps = {
  registryId: string | null;
  title: string;
  artistLabel: string;
  imageUrl: string | null;
  verificationStatus: string | null;
  certLabel: "Certificate recorded" | "Revoked" | "Certificate not recorded";
  latestValue?: number | null;
  latestCurrency?: string | null;
  ownershipStatusPresentation: { label: string; className: string };
  heldByLine?: { label: string; href?: string | null; emphasized?: boolean };
  showDeclaredValue?: boolean;
  showOwnershipDetail?: boolean;
  href: string;
  signalPendingSale?: boolean;
  signalOwnershipUnverified?: boolean;
  signalCertificateUnseen?: boolean;
};

export function StudioPortfolioCard({
  registryId,
  title,
  artistLabel,
  imageUrl,
  verificationStatus,
  certLabel,
  latestValue,
  latestCurrency,
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

  const hasQuietSignal =
    signalPendingSale || signalOwnershipUnverified || showCertPulse;

  return (
    <Link href={href} className={workspace.card.link}>
      <div className={workspace.card.media}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className={workspace.card.mediaImg} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            No image on file
          </div>
        )}
        {hasQuietSignal ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/12 to-transparent px-4 pb-3 pt-10">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-white/90">
              {signalPendingSale ? <span>Sale on file</span> : null}
              {signalOwnershipUnverified ? (
                <span>Ownership awaiting confirmation</span>
              ) : null}
              {showCertPulse ? <span>Certificate unseen</span> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className={workspace.card.surface}>
        <h3 className={workspace.type.cardTitle}>{title}</h3>
        <p className={`mt-1 ${workspace.type.cardArtist}`}>{artistLabel}</p>
      </div>

      <div className={workspace.card.reveal}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              verified ? workspace.card.pillVerified : workspace.card.pill
            }
          >
            {verified ? "Verified" : "Registered"}
          </span>
          <span className={workspace.card.pill}>{certLabel}</span>
        </div>

        {heldByLine?.label ? (
          heldByLine.href ? (
            <Link
              href={heldByLine.href}
              onClick={(e) => e.stopPropagation()}
              className={`mt-3 block text-xs leading-snug underline decoration-neutral-300 underline-offset-4 ${
                heldByLine.emphasized
                  ? "font-medium text-neutral-800"
                  : "text-neutral-600"
              }`}
            >
              {heldByLine.label}
            </Link>
          ) : (
            <p
              className={`mt-3 text-xs leading-snug ${
                heldByLine.emphasized
                  ? "font-medium text-neutral-800"
                  : "text-neutral-600"
              }`}
            >
              {heldByLine.label}
            </p>
          )
        ) : null}

        {registryId ? (
          <p className={`mt-2 ${workspace.type.registryId}`}>{registryId}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-stretch justify-between gap-3">
          {showDeclaredValue ? (
            <ArtworkDeclaredValueBlock
              amount={latestValue}
              currency={latestCurrency}
              variant="compact"
              className="mt-0 min-w-[10.5rem] flex-1"
            />
          ) : null}
          {showOwnershipDetail ? (
            <p
              className={`max-w-[12rem] text-right text-[11px] leading-snug ${ownershipStatusPresentation.className}`}
            >
              {ownershipStatusPresentation.label}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
