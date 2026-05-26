"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import {
  HeroActionButton,
  HeroInlineLink,
  HeroMiniBar,
  HeroStat,
  HeroTile,
  publicPath,
} from "@/components/workspace/WorkspaceHeroPrimitives";

type PreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

type StudioSection = "Artworks" | "Certificates" | "Ownership";

type Props = {
  displayName: string;
  totalWorks: number;
  verifiedWorks: number;
  pricedWorks: number;
  percentVerified: number;
  percentPriced: number;
  previewArtworks: PreviewArtwork[];
  publicPageHref: string | null;
  onGoToSection: (section: StudioSection) => void;
  onRegister?: () => void;
  /** Records where artist attestation may deepen */
  representationPendingCount?: number;
  onGoToRepresentationReview?: () => void;
  /** Phase D: pending amendment requests where the artist must respond */
  amendmentResponsesNeeded?: number;
  onGoToAmendments?: () => void;
};

export function ArtistWorkspaceHero({
  displayName,
  totalWorks,
  verifiedWorks,
  pricedWorks,
  percentVerified,
  percentPriced,
  previewArtworks,
  publicPageHref,
  onGoToSection,
  onRegister,
  representationPendingCount = 0,
  onGoToRepresentationReview,
  amendmentResponsesNeeded = 0,
  onGoToAmendments,
}: Props) {
  const headline = displayName.trim() || "Artist";
  const path = publicPageHref ? publicPath(publicPageHref) : null;

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-[#151a24] to-neutral-900 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[400px] w-[400px] rounded-full bg-amber-500/12 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-[280px] w-[280px] rounded-full bg-sky-500/10 blur-[90px]"
        aria-hidden
      />
      <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-14 xl:px-14">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <InfoTooltip text="Register works, issue certificates, and track ownership. Your operational home on the registry." theme="dark" />
            <h1 className="mt-3 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-white md:text-[2.65rem] lg:text-[2.85rem]">
              {headline}
            </h1>
          </div>

          <div className="mt-10 space-y-5 lg:mt-12">
            <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              <HeroTile
                title="Catalogue"
                footer={
                  <HeroActionButton onClick={() => onGoToSection("Artworks")}>
                    Open artworks
                  </HeroActionButton>
                }
              >
                <HeroStat
                  value={totalWorks}
                  sub={totalWorks === 1 ? "work" : "works"}
                  label="Registered in studio"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-200/90 ring-1 ring-emerald-400/25">
                    {verifiedWorks} verified
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/65">
                    {pricedWorks} priced
                  </span>
                </div>
                {representationPendingCount > 0 &&
                typeof onGoToRepresentationReview === "function" ? (
                  <button
                    type="button"
                    onClick={onGoToRepresentationReview}
                    className="mt-2 w-full rounded-md border border-amber-400/35 bg-amber-500/15 px-2 py-1.5 text-left text-[10px] font-medium text-amber-100 transition hover:bg-amber-500/25"
                  >
                    {representationPendingCount}{" "}
                    {representationPendingCount === 1 ? "record" : "records"} to
                    authenticate &amp; deepen
                    on file
                  </button>
                ) : null}
                {amendmentResponsesNeeded > 0 &&
                typeof onGoToAmendments === "function" ? (
                  <button
                    type="button"
                    onClick={onGoToAmendments}
                    className="mt-2 w-full rounded-md border border-sky-400/35 bg-sky-500/15 px-2 py-1.5 text-left text-[10px] font-medium text-sky-100 transition hover:bg-sky-500/25"
                  >
                    {amendmentResponsesNeeded} amendment
                    {amendmentResponsesNeeded === 1 ? "" : "s"} need your response
                  </button>
                ) : null}
              </HeroTile>

              <HeroTile
                title="Record health"
                footer={
                  <HeroActionButton onClick={() => onGoToSection("Certificates")}>
                    Certificates
                  </HeroActionButton>
                }
              >
                <HeroMiniBar label="Verified" percent={percentVerified} />
                <HeroMiniBar
                  label="Priced"
                  percent={percentPriced}
                  accentClass="from-amber-400/90 to-amber-200/80"
                />
              </HeroTile>

              <HeroTile title="Public studio">
                <div className="rounded-md bg-black/35 px-3 py-2.5 ring-1 ring-white/10">
                  <p className="text-[9px] uppercase tracking-wider text-white/35">
                    Artist page
                  </p>
                  <p
                    className={`mt-1 truncate font-mono text-[11px] ${
                      path ? "text-emerald-200/90" : "text-white/40"
                    }`}
                  >
                    {path ?? "Not published yet"}
                  </p>
                </div>
                {publicPageHref ? (
                  <HeroInlineLink href={publicPageHref} className="block w-full">
                    View public page
                  </HeroInlineLink>
                ) : (
                  <HeroInlineLink href="/account" className="block w-full">
                    Set up presence
                  </HeroInlineLink>
                )}
              </HeroTile>
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            {typeof onRegister === "function" ? (
              <button
                type="button"
                onClick={onRegister}
                className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-lg shadow-black/25 transition hover:bg-white/90"
              >
                Register artwork
              </button>
            ) : null}
            <HeroActionButton onClick={() => onGoToSection("Ownership")}>
              Ownership ledger
            </HeroActionButton>
            <div className="ml-auto flex gap-5 text-[12px] text-white/50">
              <Link href="/account" className="transition hover:text-white">
                Account
              </Link>
              <Link href="/registry" className="transition hover:text-white">
                Registry
              </Link>
            </div>
          </div>
        </div>

        <div className="flex min-h-[260px] items-center justify-center lg:col-span-5 lg:min-h-[320px]">
          <div className="relative w-full max-w-[min(100%,320px)]">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-black/40 to-transparent blur-2xl" />
            <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-6 ring-1 ring-white/10 backdrop-blur-md">
              <div className="flex justify-center">
                <ArtworksHeroPreview
                  artworks={previewArtworks as any[]}
                  variant="editorial"
                  pick="latest"
                  tone="dark"
                />
              </div>
              {previewArtworks.length === 0 ? (
                <p className="mt-6 text-center text-xs leading-relaxed text-white/40">
                  Register a work to see your catalogue preview here.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
