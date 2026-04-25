"use client";

import Link from "next/link";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import type { PublicPresence } from "@/lib/public-presence";

export type AccountHeroPreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

type Role = "artist" | "collector" | "gallery";

const ROLE_TILES: Record<
  Role,
  { title: string; body: string }[]
> = {
  artist: [
    {
      title: "Public narrative",
      body: "Biography and links shape how the registry presents you to collectors and institutions.",
    },
    {
      title: "Layered visibility",
      body: "Toggle profile, location, ownership, and value signals independently — not all-or-nothing.",
    },
    {
      title: "Canonical presence",
      body: "Your public artist page is the outward face of your studio record on the registry.",
    },
  ],
  collector: [
    {
      title: "Privacy first",
      body: "Choose whether a public profile exists, and whether your name appears or stays neutral.",
    },
    {
      title: "Collection signals",
      body: "Control what visitors see about ownership and declared values on your public page.",
    },
    {
      title: "One account",
      body: "These settings apply across your collector presence — deliberate, not accidental.",
    },
  ],
  gallery: [
    {
      title: "Institutional identity",
      body: "Location, website, and statement define how the public sees your gallery on the registry.",
    },
    {
      title: "Aligned visibility",
      body: "Same granular controls as artists — profile, place, ownership context, and values.",
    },
    {
      title: "Workspace complement",
      body: "Public presence here pairs with your gallery workspace for operations and catalogue.",
    },
  ],
};

function PreviewRow({
  label,
  on,
}: {
  label: string;
  on: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 text-[13px]">
      <span className="text-white/55">{label}</span>
      <span
        className={`tabular-nums text-sm font-semibold ${
          on ? "text-emerald-300/95" : "text-white/35"
        }`}
      >
        {on ? "On" : "Off"}
      </span>
    </li>
  );
}

type Props = {
  displayName: string;
  role: Role;
  publicPageHref: string | null;
  workspaceHref: string;
  workspaceLabel: string;
  presence: PublicPresence;
  /** Collector only: works for the same catalogue preview as the gallery institutional hero. */
  collectionPreviewArtworks?: AccountHeroPreviewArtwork[] | null;
};

export function AccountPresenceHero({
  displayName,
  role,
  publicPageHref,
  workspaceHref,
  workspaceLabel,
  presence,
  collectionPreviewArtworks,
}: Props) {
  const tiles = ROLE_TILES[role];
  const headline = displayName.trim() || "Your account";
  const previewList = collectionPreviewArtworks ?? [];
  const showCollectionPreview =
    role === "collector" && previewList.length > 0;
  const anyPreviewImage = previewList.some(
    (a) => a.image_url && String(a.image_url).trim() !== ""
  );

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-[#151a24] to-neutral-900 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className={`pointer-events-none absolute -right-24 top-0 h-[380px] w-[380px] rounded-full blur-[100px] ${
          role === "collector"
            ? "bg-teal-500/14"
            : role === "gallery"
              ? "bg-violet-500/12"
              : "bg-amber-500/12"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -left-16 bottom-0 h-[260px] w-[260px] rounded-full blur-[90px] ${
          role === "collector" ? "bg-sky-500/12" : "bg-sky-500/10"
        }`}
        aria-hidden
      />
      <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-14 xl:px-14">
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-medium text-white/85">
                {role === "artist"
                  ? "Artist"
                  : role === "collector"
                    ? "Collector"
                    : "Gallery"}
              </span>
            </div>
            <h1 className="mt-5 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-white md:text-[2.65rem] lg:text-[2.85rem]">
              {headline}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">
              Your public presence on the registry is deliberate. These controls shape what visitors
              see — not your internal records or workspace activity.
            </p>
          </div>

          <div className="mt-10 space-y-5 lg:mt-12">
            <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {tiles.map((t) => (
                <li
                  key={t.title}
                  className="rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10"
                >
                  <p className="text-[13px] font-medium text-white">{t.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{t.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
            <Link
              href={workspaceHref}
              className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-950 shadow-lg shadow-black/25 transition [transition-timing-function:var(--rrowm-ease-out)] hover:bg-white/90"
            >
              {workspaceLabel}
            </Link>
            {publicPageHref ? (
              <Link
                href={publicPageHref}
                className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                View public page
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

        <div className="flex min-h-[260px] flex-col items-center justify-center gap-10 lg:col-span-5 lg:min-h-[320px]">
          {showCollectionPreview ? (
            <div className="relative w-full max-w-[min(100%,340px)]">
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-black/40 to-transparent blur-2xl" />
              <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-6 ring-1 ring-white/10 backdrop-blur-md">
                <div className="flex justify-center">
                  <ArtworksHeroPreview artworks={previewList as any[]} />
                </div>
                {!anyPreviewImage ? (
                  <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
                    Images appear when registered works include artwork images.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="relative w-full max-w-[min(100%,340px)]">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-black/40 to-transparent blur-2xl" />
            <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-6 ring-1 ring-white/10 backdrop-blur-md">
              <h3 className="text-center font-serif text-lg font-normal text-white">
                Visibility snapshot
              </h3>
              <p className="mt-2 text-center text-xs text-white/40">
                Updates as you adjust toggles below
              </p>
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                <PreviewRow label="Public profile" on={presence.profile} />
                <PreviewRow label="Location" on={presence.location} />
                <PreviewRow label="Ownership context" on={presence.ownership} />
                <PreviewRow label="Declared values" on={presence.values} />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
