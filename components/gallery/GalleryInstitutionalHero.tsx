"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import {
  CompletenessMeter,
  HeroActionButton,
  HeroStat,
  HeroTile,
} from "@/components/workspace/WorkspaceHeroPrimitives";

type HeroArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

/** Maps DB `galleries.subscription_status` to short UI copy (billing / plan, not registry verification). */
function subscriptionStatusLabel(raw: string | null | undefined): string | null {
  const s = String(raw || "").toLowerCase().trim();
  if (!s) return null;
  if (s === "grace") return "Grace period";
  if (s === "active") return "Subscribed";
  if (s === "inactive") return "Inactive";
  if (s === "trial") return "Trial";
  return raw!.trim();
}

type GallerySection = "catalogue" | "verification" | "invitations";

type Props = {
  orgName: string;
  slug: string;
  verified: boolean;
  description: string | null;
  location: string | null;
  subscriptionStatus: string | null;
  artworks: HeroArtwork[];
  worksCount: number;
  verifiedWorksCount: number;
  verificationPct: number;
  awaitingVerificationCount: number;
  /** Phase B: institution-filed works with layered participation on file. */
  institutionFiledCount?: number;
  artistConfirmedCount?: number;
  participationPendingCount?: number;
  rosterInvitesPendingCount?: number;
  amendmentsPendingCount?: number;
  onGoToSection: (section: GallerySection) => void;
  onRegister: () => void;
  onInvite: () => void;
  isAdmin: boolean;
  /** Opens workspace guide (e.g. modal) from parent. */
  onAboutWorkspace?: () => void;
  onGoToAmendments?: () => void;
};

/**
 * Full-bleed institutional hero: value narrative + highlighted catalogue record (editorial frame).
 */
export function GalleryInstitutionalHero({
  orgName,
  slug,
  verified,
  description,
  location,
  subscriptionStatus,
  artworks,
  worksCount,
  verifiedWorksCount,
  verificationPct,
  awaitingVerificationCount,
  institutionFiledCount = 0,
  artistConfirmedCount = 0,
  participationPendingCount = 0,
  rosterInvitesPendingCount = 0,
  amendmentsPendingCount = 0,
  onGoToSection,
  onRegister,
  onInvite,
  isAdmin,
  onAboutWorkspace,
  onGoToAmendments,
}: Props) {
  const subscriptionLabel = subscriptionStatusLabel(subscriptionStatus);

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-[#151a24] to-neutral-900 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-sky-500/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-[280px] w-[280px] rounded-full bg-violet-500/10 blur-[90px]"
        aria-hidden
      />
      <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-14 xl:px-14">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <InfoTooltip text="Your institution's stewardship workspace. Manage continuity, representation, and catalogue records." theme="dark" />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  verified
                    ? "border border-white/20 bg-white/[0.07] text-white/85"
                    : "bg-amber-500/15 text-amber-100"
                }`}
              >
                {verified ? "On file · institution verified" : "Verification pending"}
              </span>
              {subscriptionLabel ? (
                <span className="text-sm text-white/35" title="Subscription / billing status">
                  {subscriptionLabel}
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-white md:text-[2.75rem] lg:text-[3rem]">
              {orgName}
            </h1>
            {location ? (
              <p className="mt-3 text-sm text-white/50">{location}</p>
            ) : null}
          </div>

          <div className="mt-10 space-y-5 lg:mt-12">
            <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              <HeroTile
                title="Registry authority"
                footer={
                  <HeroActionButton onClick={() => onGoToSection("catalogue")}>
                    Open catalogue
                  </HeroActionButton>
                }
              >
                <HeroStat
                  value={worksCount}
                  sub={worksCount === 1 ? "work" : "works"}
                  label="In gallery catalogue"
                />
                <p className="text-[11px] leading-relaxed text-white/45">
                  Single registry IDs across represented artists.
                </p>
              </HeroTile>

              <HeroTile
                title="Institutional verification"
                footer={
                  <HeroActionButton onClick={() => onGoToSection("verification")}>
                    Trust &amp; certs
                  </HeroActionButton>
                }
              >
                <CompletenessMeter
                  percent={verificationPct}
                  label="Works verified"
                  accent="sky"
                />
                <p className="text-[11px] text-white/50">
                  <span className="font-medium text-white/75">
                    {verifiedWorksCount}
                  </span>{" "}
                  verified
                  {awaitingVerificationCount > 0 ? (
                    <>
                      {" · "}
                      <span className="text-amber-200/90">
                        {awaitingVerificationCount} awaiting
                      </span>
                    </>
                  ) : null}
                </p>
              </HeroTile>

              <HeroTile
                title="Record depth"
                footer={
                  isAdmin ? (
                    <HeroActionButton onClick={() => onGoToSection("invitations")}>
                      Roster &amp; invites
                    </HeroActionButton>
                  ) : (
                    <span className="text-[11px] text-white/40">
                      Admin can invite from workspace
                    </span>
                  )
                }
              >
                <p className="text-[11px] leading-relaxed text-white/55">
                  <span className="font-medium text-white/75">
                    {institutionFiledCount}
                  </span>{" "}
                  institution attestation
                  {participationPendingCount > 0 ? (
                    <>
                      {" · "}
                      <span className="text-white/70">
                        {participationPendingCount} may deepen
                      </span>
                    </>
                  ) : null}
                </p>
                <p className="text-[11px] text-white/45">
                  <span className="font-medium text-white/70">
                    {artistConfirmedCount}
                  </span>{" "}
                  with artist attestation on file
                  {rosterInvitesPendingCount > 0 ? (
                    <>
                      {" · "}
                      {rosterInvitesPendingCount} invite
                      {rosterInvitesPendingCount === 1 ? "" : "s"} outstanding
                    </>
                  ) : null}
                </p>
                {amendmentsPendingCount > 0 ? (
                  typeof onGoToAmendments === "function" ? (
                    <button
                      type="button"
                      onClick={onGoToAmendments}
                      className="mt-2 w-full rounded-md border border-violet-400/35 bg-violet-500/20 px-3 py-2 text-left text-[11px] font-medium text-violet-100 transition hover:bg-violet-500/30"
                    >
                      {amendmentsPendingCount} open amendment
                      {amendmentsPendingCount === 1 ? "" : "s"}: respond on file
                    </button>
                  ) : (
                    <p className="mt-2 text-[11px] text-violet-200/90">
                      {amendmentsPendingCount} amendment
                      {amendmentsPendingCount === 1 ? "" : "s"} pending review
                    </p>
                  )
                ) : null}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={onInvite}
                    className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium text-white transition hover:bg-white/15"
                  >
                    New invitation
                  </button>
                ) : null}
              </HeroTile>
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            <button
              type="button"
              onClick={onRegister}
              className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-lg shadow-black/25 transition [transition-timing-function:var(--rrowm-ease-out)] hover:bg-white/90"
            >
              Register a work
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={onInvite}
                className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Invite to authenticate
              </button>
            ) : null}
            <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[12px] text-white/50">
              {typeof onAboutWorkspace === "function" ? (
                <button
                  type="button"
                  onClick={onAboutWorkspace}
                  className="text-left font-medium text-white/50 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/50"
                >
                  About this workspace
                </button>
              ) : null}
              <Link
                href={`/institutional-studio/${encodeURIComponent(slug)}`}
                className="transition hover:text-white"
              >
                Public page
              </Link>
              <Link href="/account" className="transition hover:text-white">
                Account
              </Link>
            </div>
          </div>
        </div>

        <div className="flex min-h-[280px] items-center justify-center lg:col-span-5 lg:min-h-[360px] lg:justify-end lg:pr-2">
          <div className="relative w-full max-w-[300px]">
            <div
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-b from-sky-500/10 via-transparent to-black/30 blur-2xl"
              aria-hidden
            />
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-5 py-6 ring-1 ring-white/12 backdrop-blur-md sm:px-6 sm:py-7">
              <ArtworksHeroPreview
                artworks={artworks as HeroArtwork[]}
                variant="editorial"
                pick="latest"
                tone="dark"
              />
              {artworks.length === 0 ? (
                <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
                  Register a canonical record to surface a highlighted work here.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
