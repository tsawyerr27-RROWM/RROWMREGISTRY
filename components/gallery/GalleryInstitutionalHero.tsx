"use client";

import Link from "next/link";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";

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

type Props = {
  orgName: string;
  slug: string;
  verified: boolean;
  description: string | null;
  location: string | null;
  subscriptionStatus: string | null;
  artworks: HeroArtwork[];
  onRegister: () => void;
  onInvite: () => void;
  isAdmin: boolean;
};

/**
 * Full-bleed institutional hero: value narrative + 3D catalogue preview (artist Studio pattern).
 */
export function GalleryInstitutionalHero({
  orgName,
  slug,
  verified,
  description,
  location,
  subscriptionStatus,
  artworks,
  onRegister,
  onInvite,
  isAdmin,
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
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  verified
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-amber-500/15 text-amber-100"
                }`}
              >
                {verified ? "Verified" : "Pending verification"}
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
            {description ? (
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">{description}</p>
            ) : (
              <p className="mt-4 text-[15px] text-white/40">Add a statement under Presence.</p>
            )}
            {location ? (
              <p className="mt-3 text-sm text-white/50">{location}</p>
            ) : null}
          </div>

          <div className="mt-10 space-y-5 lg:mt-12">
            <ul className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              <li className="rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10">
                <p className="text-[13px] font-medium text-white">Registry authority</p>
                <p className="mt-2 text-xs leading-relaxed text-white/55">
                  Cryptographic IDs and a single catalogue across represented artists.
                </p>
              </li>
              <li className="rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10">
                <p className="text-[13px] font-medium text-white">Institutional verification</p>
                <p className="mt-2 text-xs leading-relaxed text-white/55">
                  Attest records when your gallery is verified — certificate pipeline follows.
                </p>
              </li>
              <li className="rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10">
                <p className="text-[13px] font-medium text-white">Market clarity</p>
                <p className="mt-2 text-xs leading-relaxed text-white/55">
                  Declared value and provenance signals, visible as you choose.
                </p>
              </li>
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            <button
              type="button"
              onClick={onRegister}
              className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-lg shadow-black/25 transition [transition-timing-function:var(--rrowm-ease-out)] hover:bg-white/90"
            >
              Register artwork
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={onInvite}
                className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Invite artist
              </button>
            ) : null}
            <div className="ml-auto flex gap-5 text-[12px] text-white/50">
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

        <div className="flex min-h-[280px] items-center justify-center lg:col-span-5 lg:min-h-[360px]">
          <div className="relative w-full max-w-[min(100%,320px)]">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-black/40 to-transparent blur-2xl" />
            <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-6 ring-1 ring-white/10 backdrop-blur-md">
              <div className="flex justify-center">
                <ArtworksHeroPreview artworks={artworks as any[]} />
              </div>
              {artworks.length === 0 ? (
                <p className="mt-6 text-center text-xs text-white/40">
                  Images appear when works include a record image.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
