"use client";

import Link from "next/link";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import {
  CompletenessMeter,
  HeroActionButton,
  HeroInlineLink,
  HeroStat,
  HeroTile,
} from "@/components/workspace/WorkspaceHeroPrimitives";

type PreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

export type CollectorWorkspaceSnapshot = {
  held: number;
  verifiedOwnership: number;
  attentionCount: number;
  profilePublic: boolean;
  anonymousOnPublic: boolean;
};

type Props = {
  displayName: string;
  location: string | null;
  publicPageHref: string | null;
  previewArtworks: PreviewArtwork[];
  snapshot: CollectorWorkspaceSnapshot;
  onGoToSection: (section: "works" | "attention") => void;
};

export function CollectorWorkspaceHero({
  displayName,
  location,
  publicPageHref,
  previewArtworks,
  snapshot,
  onGoToSection,
}: Props) {
  const headline = displayName.trim() || "Your collection";
  const hasPreview = previewArtworks.length > 0;
  const anyPreviewImage = previewArtworks.some(
    (a) => a.image_url && String(a.image_url).trim() !== ""
  );
  const verifiedPct =
    snapshot.held > 0
      ? Math.round((snapshot.verifiedOwnership / snapshot.held) * 100)
      : 0;

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-[#0f1714] to-neutral-950 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[400px] w-[400px] rounded-full bg-teal-500/14 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[280px] w-[280px] rounded-full bg-sky-500/12 blur-[90px]"
        aria-hidden
      />
      <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-14 xl:px-14">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
              Collector stewardship workspace
            </p>
            <h1 className="mt-3 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-white md:text-[2.65rem] lg:text-[2.85rem]">
              {headline}
            </h1>
            {location ? (
              <p className="mt-4 text-sm text-white/55">{location}</p>
            ) : null}
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70">
              A quiet space for what you hold — ownership state, attention items, and
              history — without catalogue marketing chrome.
            </p>
          </div>

          <div className="mt-10 space-y-5 lg:mt-12">
            <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              <HeroTile
                title="Ownership on record"
                footer={
                  <HeroActionButton onClick={() => onGoToSection("works")}>
                    View works
                  </HeroActionButton>
                }
              >
                <HeroStat
                  value={snapshot.held}
                  sub={snapshot.held === 1 ? "work" : "works"}
                  label="In your stewardship"
                />
                <CompletenessMeter
                  percent={verifiedPct}
                  label="Verified ownership"
                  accent="teal"
                />
              </HeroTile>

              <HeroTile
                title="Private by default"
                footer={
                  <HeroInlineLink href="/account" className="block w-full">
                    Account &amp; presence
                  </HeroInlineLink>
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${
                      snapshot.profilePublic
                        ? "bg-emerald-500/15 ring-emerald-400/30"
                        : "bg-white/5 ring-white/15"
                    }`}
                  >
                    <span className="text-[9px] uppercase text-white/45">Profile</span>
                    <span
                      className={`text-sm font-semibold ${
                        snapshot.profilePublic ? "text-emerald-200" : "text-white/40"
                      }`}
                    >
                      {snapshot.profilePublic ? "On" : "Off"}
                    </span>
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-[11px] leading-relaxed text-white/55">
                      {snapshot.profilePublic
                        ? "Public collection page is available."
                        : "No public profile — workspace stays private."}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        snapshot.anonymousOnPublic
                          ? "bg-violet-500/20 text-violet-200/90"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {snapshot.anonymousOnPublic ? "Anonymous label" : "Name shown"}
                    </span>
                  </div>
                </div>
              </HeroTile>

              <HeroTile
                title="Continuity"
                footer={
                  snapshot.attentionCount > 0 ? (
                    <HeroActionButton onClick={() => onGoToSection("attention")}>
                      Open attention ({snapshot.attentionCount})
                    </HeroActionButton>
                  ) : (
                    <span className="text-[11px] text-white/40">Nothing needs attention</span>
                  )
                }
              >
                <HeroStat
                  value={snapshot.attentionCount}
                  sub={
                    snapshot.attentionCount === 1 ? "item" : "items"
                  }
                  label="Transfers, claims & verification"
                />
                {snapshot.attentionCount > 0 ? (
                  <span className="inline-flex w-fit rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-100/95 ring-1 ring-amber-400/30">
                    Action suggested
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-300/80">All clear</span>
                )}
              </HeroTile>
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            <Link
              href="/account"
              className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-lg shadow-black/25 transition [transition-timing-function:var(--rrowm-ease-out)] hover:bg-white/90"
            >
              Account &amp; presence
            </Link>
            {publicPageHref ? (
              <Link
                href={publicPageHref}
                className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Public collection
              </Link>
            ) : (
              <span className="rounded-lg border border-white/15 px-5 py-2.5 text-[13px] text-white/40">
                Public page when slug is available
              </span>
            )}
            <div className="ml-auto flex gap-5 text-[12px] text-white/50">
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
              {!hasPreview ? (
                <p className="mt-8 text-center text-sm leading-relaxed text-white/45">
                  Works you hold will surface here with images when records include them.
                </p>
              ) : (
                <>
                  <div className="mt-6 flex justify-center">
                    <ArtworksHeroPreview artworks={previewArtworks as any[]} />
                  </div>
                  {!anyPreviewImage ? (
                    <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
                      Images appear when works include artwork images.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
