"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { StudioHeroSlab } from "@/components/Studio/StudioHeroSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldOrganisationHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import type { MessageKey } from "@/lib/locale-messages";
import { rrowmButton, rrowmStudioSurface } from "@/styles/rrowm-theme";
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

const HERO_THEME = "light" as const;

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
    <StudioHeroSlab
      headerExtra={
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              verified
                ? "border border-emerald-900/12 bg-emerald-50 text-emerald-800"
                : "border border-amber-900/12 bg-amber-50 text-amber-900"
            }`}
          >
            {verified
              ? t("gallery.hero.institutionVerified")
              : t("gallery.hero.verificationPending")}
          </span>
          {subscriptionLabel ? (
            <span className="text-sm text-neutral-400">{subscriptionLabel}</span>
          ) : null}
        </div>
      }
      title={
        <>
          <InfoTooltip text={t("gallery.hero.tooltip")} theme="light" />
          <h1 className="mt-3 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-neutral-950 md:text-[2.75rem] lg:text-[3rem]">
            {orgName}
          </h1>
          {location ? <p className="mt-3 text-sm text-neutral-500">{location}</p> : null}
          <p className="mt-4 text-sm text-neutral-500">
            Register · Verify · Preserve · Transact
          </p>
        </>
      }
      metrics={
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <HeroTile
            title={t("gallery.hero.registryAuthority")}
            theme={HERO_THEME}
            footer={
              <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("catalogue")}>
                {t("gallery.hero.openCatalogue")}
              </HeroActionButton>
            }
          >
            <HeroStat
              theme={HERO_THEME}
              value={worksCount}
              sub={worksCount === 1 ? t("gallery.hero.work") : t("gallery.hero.works")}
              label={t("gallery.hero.inGalleryCatalogue")}
            />
            <p className="text-[11px] leading-relaxed text-neutral-500">
              {t("gallery.hero.singleRegistryIds")}
            </p>
          </HeroTile>

          <HeroTile
            title={t("gallery.hero.institutionalVerification")}
            theme={HERO_THEME}
            footer={
              <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("verification")}>
                {t("gallery.hero.trustAndCerts")}
              </HeroActionButton>
            }
          >
            <CompletenessMeter
              theme={HERO_THEME}
              percent={verificationPct}
              label={t("gallery.hero.worksVerified")}
              accent="sky"
            />
            <p className="text-[11px] text-neutral-500">
              {fillMessage(t("gallery.hero.verifiedLine"), {
                count: String(verifiedWorksCount),
              })}
              {awaitingVerificationCount > 0 ? (
                <>
                  {" · "}
                  <span className="text-amber-800">
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
            theme={HERO_THEME}
            footer={
              isAdmin ? (
                <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("invitations")}>
                  {t("gallery.hero.rosterAndInvites")}
                </HeroActionButton>
              ) : (
                <span className="text-[11px] text-neutral-400">
                  {t("gallery.hero.adminCanInvite")}
                </span>
              )
            }
          >
            <p className="text-[11px] leading-relaxed text-neutral-600">
              <span className="font-medium text-neutral-800">{institutionFiledCount}</span>{" "}
              {t("gallery.hero.institutionAttestation")}
              {participationPendingCount > 0 ? (
                <>
                  {" · "}
                  <span className="text-neutral-700">
                    {participationPendingCount} {t("gallery.hero.mayDeepen")}
                  </span>
                </>
              ) : null}
            </p>
            <p className="text-[11px] text-neutral-500">
              <span className="font-medium text-neutral-700">{artistConfirmedCount}</span>{" "}
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
                  className="mt-2 w-full rounded-xl border border-violet-900/12 bg-violet-50 px-3 py-2 text-left text-[11px] font-medium text-violet-900 transition hover:bg-violet-100/80"
                >
                  {fillMessage(t("gallery.hero.openAmendments"), {
                    count: String(amendmentsPendingCount),
                  })}
                </button>
              ) : (
                <p className="mt-2 text-[11px] text-violet-800">
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
                className="mt-1 w-full rounded-xl border border-neutral-900/[0.08] bg-white px-3 py-2 text-[11px] font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                {t("gallery.hero.newInvitation")}
              </button>
            ) : null}
          </HeroTile>
        </ul>
      }
      actions={
        <>
          <button type="button" onClick={onRegister} className={rrowmButton.primaryEconomic}>
            {t("gallery.hero.registerWork")}
          </button>
          {isAdmin ? (
            <button type="button" onClick={onInvite} className={rrowmButton.secondary}>
              {t("gallery.hero.inviteToAuthenticate")}
            </button>
          ) : null}
          <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[12px] text-neutral-500">
            {typeof onAboutWorkspace === "function" ? (
              <button
                type="button"
                onClick={onAboutWorkspace}
                className="text-left font-medium underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-500"
              >
                {t("gallery.hero.aboutWorkspace")}
              </button>
            ) : null}
            <Link
              href={fieldOrganisationHref(slug)}
              className="transition hover:text-neutral-900"
            >
              {t("gallery.hero.publicPage")}
            </Link>
            <Link href="/studio/account" className="transition hover:text-neutral-900">
              {t("gallery.hero.account")}
            </Link>
          </div>
        </>
      }
      aside={
        <div className="relative w-full max-w-[300px]">
          <div className={`${rrowmStudioSurface.card} px-5 py-6 sm:px-6 sm:py-7`}>
            <ArtworksHeroPreview
              artworks={artworks as HeroArtwork[]}
              variant="editorial"
              pick="latest"
              tone="light"
            />
            {artworks.length === 0 ? (
              <p className="mt-4 text-center text-xs leading-relaxed text-neutral-400">
                {t("gallery.hero.previewEmpty")}
              </p>
            ) : null}
          </div>
        </div>
      }
    />
  );
}
