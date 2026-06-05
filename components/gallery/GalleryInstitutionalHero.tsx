"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldOrganisationHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import type { MessageKey } from "@/lib/locale-messages";
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
  institutionFiledCount?: number;
  artistConfirmedCount?: number;
  participationPendingCount?: number;
  rosterInvitesPendingCount?: number;
  amendmentsPendingCount?: number;
  onGoToSection: (section: GallerySection) => void;
  onRegister: () => void;
  onInvite: () => void;
  isAdmin: boolean;
  onAboutWorkspace?: () => void;
  onGoToAmendments?: () => void;
};

const SUBSCRIPTION_KEYS: Record<string, MessageKey> = {
  grace: "gallery.hero.subscriptionGrace",
  active: "gallery.hero.subscriptionActive",
  inactive: "gallery.hero.subscriptionInactive",
  trial: "gallery.hero.subscriptionTrial",
};

export function GalleryInstitutionalHero({
  orgName,
  slug,
  verified,
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
  const { t } = useLocalePreferences();
  const subscriptionKey = String(subscriptionStatus || "")
    .toLowerCase()
    .trim();
  const subscriptionLabel = SUBSCRIPTION_KEYS[subscriptionKey]
    ? t(SUBSCRIPTION_KEYS[subscriptionKey])
    : subscriptionStatus?.trim() || null;

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
            <InfoTooltip text={t("gallery.hero.tooltip")} theme="dark" />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  verified
                    ? "border border-white/20 bg-white/[0.07] text-white/85"
                    : "bg-amber-500/15 text-amber-100"
                }`}
              >
                {verified
                  ? t("gallery.hero.institutionVerified")
                  : t("gallery.hero.verificationPending")}
              </span>
              {subscriptionLabel ? (
                <span className="text-sm text-white/35">{subscriptionLabel}</span>
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
                title={t("gallery.hero.registryAuthority")}
                footer={
                  <HeroActionButton onClick={() => onGoToSection("catalogue")}>
                    {t("gallery.hero.openCatalogue")}
                  </HeroActionButton>
                }
              >
                <HeroStat
                  value={worksCount}
                  sub={
                    worksCount === 1
                      ? t("gallery.hero.work")
                      : t("gallery.hero.works")
                  }
                  label={t("gallery.hero.inGalleryCatalogue")}
                />
                <p className="text-[11px] leading-relaxed text-white/45">
                  {t("gallery.hero.singleRegistryIds")}
                </p>
              </HeroTile>

              <HeroTile
                title={t("gallery.hero.institutionalVerification")}
                footer={
                  <HeroActionButton onClick={() => onGoToSection("verification")}>
                    {t("gallery.hero.trustAndCerts")}
                  </HeroActionButton>
                }
              >
                <CompletenessMeter
                  percent={verificationPct}
                  label={t("gallery.hero.worksVerified")}
                  accent="sky"
                />
                <p className="text-[11px] text-white/50">
                  {fillMessage(t("gallery.hero.verifiedLine"), {
                    count: String(verifiedWorksCount),
                  })}
                  {awaitingVerificationCount > 0 ? (
                    <>
                      {" · "}
                      <span className="text-amber-200/90">
                        {fillMessage(t("gallery.hero.awaitingLine"), {
                          count: String(awaitingVerificationCount),
                        })}
                      </span>
                    </>
                  ) : null}
                </p>
              </HeroTile>

              <HeroTile
                title={t("gallery.hero.recordDepth")}
                footer={
                  isAdmin ? (
                    <HeroActionButton onClick={() => onGoToSection("invitations")}>
                      {t("gallery.hero.rosterAndInvites")}
                    </HeroActionButton>
                  ) : (
                    <span className="text-[11px] text-white/40">
                      {t("gallery.hero.adminCanInvite")}
                    </span>
                  )
                }
              >
                <p className="text-[11px] leading-relaxed text-white/55">
                  <span className="font-medium text-white/75">
                    {institutionFiledCount}
                  </span>{" "}
                  {t("gallery.hero.institutionAttestation")}
                  {participationPendingCount > 0 ? (
                    <>
                      {" · "}
                      <span className="text-white/70">
                        {participationPendingCount}{" "}
                        {t("gallery.hero.mayDeepen")}
                      </span>
                    </>
                  ) : null}
                </p>
                <p className="text-[11px] text-white/45">
                  <span className="font-medium text-white/70">
                    {artistConfirmedCount}
                  </span>{" "}
                  {t("gallery.hero.artistAttestationOnFile")}
                  {rosterInvitesPendingCount > 0 ? (
                    <>
                      {" · "}
                      {rosterInvitesPendingCount}{" "}
                      {rosterInvitesPendingCount === 1
                        ? t("gallery.hero.inviteOutstanding")
                        : t("gallery.hero.invitesOutstanding")}
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
                      {fillMessage(t("gallery.hero.openAmendments"), {
                        count: String(amendmentsPendingCount),
                      })}
                    </button>
                  ) : (
                    <p className="mt-2 text-[11px] text-violet-200/90">
                      {fillMessage(t("gallery.hero.amendmentsPending"), {
                        count: String(amendmentsPendingCount),
                      })}
                    </p>
                  )
                ) : null}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={onInvite}
                    className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium text-white transition hover:bg-white/15"
                  >
                    {t("gallery.hero.newInvitation")}
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
              {t("gallery.hero.registerWork")}
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={onInvite}
                className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {t("gallery.hero.inviteToAuthenticate")}
              </button>
            ) : null}
            <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[12px] text-white/50">
              {typeof onAboutWorkspace === "function" ? (
                <button
                  type="button"
                  onClick={onAboutWorkspace}
                  className="text-left font-medium text-white/50 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/50"
                >
                  {t("gallery.hero.aboutWorkspace")}
                </button>
              ) : null}
              <Link
                href={fieldOrganisationHref(slug)}
                className="transition hover:text-white"
              >
                {t("gallery.hero.publicPage")}
              </Link>
              <Link href="/studio/account" className="transition hover:text-white">
                {t("gallery.hero.account")}
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
                  {t("gallery.hero.previewEmpty")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
