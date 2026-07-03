"use client";

import Link from "next/link";

import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  certificateClassForTrustTier,
  certificateClassTitleKey,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import { fillMessage } from "@/lib/locale-messages";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  href: string;
  title: string;
  artist: string;
  registryId: string;
  imageUrl?: string | null;
  verificationStatus: string | null | undefined;
  hasCertificate: boolean;
  certificateRevoked: boolean;
  ownershipLabel: string | null;
  ownershipClassName?: string;
  transferCount?: number | null;
  isPending?: boolean;
  transferPending?: boolean;
  verificationOutstanding?: boolean;
};

export function CollectorHoldingSlab({
  href,
  title,
  artist,
  registryId,
  imageUrl,
  verificationStatus,
  hasCertificate,
  certificateRevoked,
  ownershipLabel,
  ownershipClassName,
  transferCount,
  isPending = false,
  transferPending = false,
  verificationOutstanding = false,
}: Props) {
  const { t } = useLocalePreferences();
  const tier = parseArtworkTrustTier(verificationStatus);
  const certificateClass =
    hasCertificate && !certificateRevoked ? certificateClassForTrustTier(tier) : null;

  const continuityLine =
    transferCount != null && transferCount > 0
      ? fillMessage(t("collector.holding.transferCount"), {
          count: String(transferCount),
        })
      : ownershipLabel;

  return (
    <div className="studio-reveal">
      <Link
        href={href}
        className={`${studioV2.scope} group block motion-reduce:transition-none`}
      >
        <article
          className={`${studioV2.surface.filingSheet} v2-motion-hover-subtle relative overflow-hidden px-4 py-5 transition-[border-color,box-shadow] duration-300 sm:px-5 sm:py-6 ${
            isPending ? "border-[var(--v2-amber-exception-dim)]" : ""
          }`}
        >
          <span
            className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 ${
              isPending
                ? "bg-[var(--v2-amber-exception)]"
                : "bg-[var(--v2-cobalt-signal)] opacity-80"
            }`}
            aria-hidden
          />

          <div className="relative z-[1] flex gap-4 sm:gap-5">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className={`hidden h-[4.5rem] w-[4.5rem] shrink-0 rounded-md border border-[var(--v2-border)] object-cover sm:block ${
                  isPending ? "opacity-75 grayscale-[15%]" : ""
                }`}
              />
            ) : null}

            <div className="min-w-0 flex-1">
              <h3 className="v2-type-display text-[1.35rem] leading-[1.08] tracking-[-0.02em] text-[var(--v2-ink)] transition-colors duration-300 group-hover:text-[var(--v2-graphite)] sm:text-[1.45rem]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--v2-ink-muted)]">
                {artist}
              </p>
              <p className="mt-2 v2-type-mono text-[11px] tracking-[0.08em] text-[var(--v2-cool-grey)]">
                {registryId}
              </p>

              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--v2-border)] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {t("collector.holding.trust")}
                  </span>
                  <ArtworkTrustBadge
                    verificationStatus={verificationStatus}
                    showTooltip={false}
                    pulse={tier === "verified"}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {t("collector.holding.certificate")}
                  </span>
                  <span className="v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-soft)]">
                    {certificateClass
                      ? t(certificateClassTitleKey(certificateClass))
                      : hasCertificate && certificateRevoked
                        ? t("collector.holding.certificateRevoked")
                        : "-"}
                  </span>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto">
                  <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {t("collector.holding.continuity")}
                  </span>
                  {continuityLine ? (
                    <span
                      className={`v2-type-mono text-[10px] tracking-[0.08em] ${ownershipClassName ?? "text-[var(--v2-ink-soft)]"}`}
                    >
                      {continuityLine}
                    </span>
                  ) : (
                    <span className="v2-type-mono text-[10px] tracking-[0.08em] text-[var(--v2-ink-muted)]"> - </span>
                  )}
                </div>
              </div>

              {transferPending ? (
                <p className="mt-3 v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-amber-exception)]">
                  {t("collector.works.transferPending")}
                </p>
              ) : null}
              {verificationOutstanding ? (
                <p className="mt-3 v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-muted)]">
                  {t("collector.works.verificationOutstanding")}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
