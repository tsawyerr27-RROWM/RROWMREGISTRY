"use client";

import Link from "next/link";
import { RegistryCatalogueInfoTooltip } from "@/components/Registry/RegistryCatalogueInfoTooltip";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { StudioHeroSlab } from "@/components/Studio/StudioHeroSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { rrowmButton, rrowmStudioSurface } from "@/styles/rrowm-theme";
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
  representationPendingCount?: number;
  onGoToRepresentationReview?: () => void;
  amendmentResponsesNeeded?: number;
  onGoToAmendments?: () => void;
};

const HERO_THEME = "light" as const;

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
  const { t } = useLocalePreferences();
  const headline = displayName.trim() || t("studio.hero.fallbackArtist");
  const path = publicPageHref ? publicPath(publicPageHref) : null;

  return (
    <StudioHeroSlab
      title={
        <>
          <InfoTooltip
            text="Register works, issue certificates, and track ownership. Your operational home on the registry."
            theme="light"
          />
          <h1 className="mt-3 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-neutral-950 md:text-[2.65rem] lg:text-[2.85rem]">
            {headline}
          </h1>
          <p className="mt-4 text-sm text-neutral-500">
            Register · Verify · Preserve · Transact
          </p>
        </>
      }
      metrics={
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <HeroTile
            title={t("studio.hero.catalogue")}
            theme={HERO_THEME}
            footer={
              <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("Artworks")}>
                {t("studio.hero.openArtworks")}
              </HeroActionButton>
            }
          >
            <HeroStat
              theme={HERO_THEME}
              value={totalWorks}
              sub={totalWorks === 1 ? t("studio.hero.work") : t("studio.hero.works")}
              label={t("studio.hero.registeredInStudio")}
            />
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-emerald-900/10 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                {fillMessage(t("studio.hero.verifiedBadge"), {
                  count: String(verifiedWorks),
                })}
              </span>
              <span className="rounded-full border border-neutral-900/[0.06] bg-neutral-50 px-2 py-0.5 text-[10px] text-neutral-600">
                {fillMessage(t("studio.hero.pricedBadge"), {
                  count: String(pricedWorks),
                })}
              </span>
            </div>
            {representationPendingCount > 0 &&
            typeof onGoToRepresentationReview === "function" ? (
              <button
                type="button"
                onClick={onGoToRepresentationReview}
                className="mt-2 w-full rounded-xl border border-amber-900/12 bg-amber-50 px-2 py-1.5 text-left text-[10px] font-medium text-amber-900 transition hover:bg-amber-100/80"
              >
                {fillMessage(
                  t(
                    representationPendingCount === 1
                      ? "studio.hero.recordsToDeepen"
                      : "studio.hero.recordsToDeepenPlural"
                  ),
                  { count: String(representationPendingCount) }
                )}
              </button>
            ) : null}
            {amendmentResponsesNeeded > 0 && typeof onGoToAmendments === "function" ? (
              <button
                type="button"
                onClick={onGoToAmendments}
                className="mt-2 w-full rounded-xl border border-sky-900/10 bg-sky-50 px-2 py-1.5 text-left text-[10px] font-medium text-sky-900 transition hover:bg-sky-100/80"
              >
                {fillMessage(
                  t(
                    amendmentResponsesNeeded === 1
                      ? "studio.hero.amendmentNeedsResponse"
                      : "studio.hero.amendmentsNeedResponse"
                  ),
                  { count: String(amendmentResponsesNeeded) }
                )}
              </button>
            ) : null}
          </HeroTile>

          <HeroTile
            title={t("studio.hero.recordHealth")}
            theme={HERO_THEME}
            footer={
              <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("Certificates")}>
                {t("studio.hero.certificates")}
              </HeroActionButton>
            }
          >
            <HeroMiniBar theme={HERO_THEME} label={t("studio.hero.verified")} percent={percentVerified} />
            <HeroMiniBar
              theme={HERO_THEME}
              label={t("studio.hero.priced")}
              percent={percentPriced}
              accentClass="from-amber-400/90 to-amber-200/80"
            />
          </HeroTile>

          <HeroTile title={t("studio.hero.publicStudio")} theme={HERO_THEME}>
            <div className="rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-3 py-2.5">
              <p className="text-[11px] font-medium text-neutral-500">
                {t("studio.hero.artistPage")}
              </p>
              <p
                className={`mt-1 truncate font-mono text-[11px] ${
                  path ? "text-emerald-700" : "text-neutral-400"
                }`}
              >
                {path ?? t("studio.hero.notPublishedYet")}
              </p>
            </div>
            {publicPageHref ? (
              <HeroInlineLink theme={HERO_THEME} href={publicPageHref} className="block w-full">
                {t("studio.hero.viewPublicPage")}
              </HeroInlineLink>
            ) : (
              <HeroInlineLink theme={HERO_THEME} href="/studio/account" className="block w-full">
                {t("studio.hero.setupPresence")}
              </HeroInlineLink>
            )}
          </HeroTile>
        </ul>
      }
      actions={
        <>
          {typeof onRegister === "function" ? (
            <button type="button" onClick={onRegister} className={rrowmButton.primaryEconomic}>
              {t("studio.registerArtwork")}
            </button>
          ) : null}
          <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("Ownership")}>
            {t("studio.hero.ownershipLedger")}
          </HeroActionButton>
          <div className="ml-auto flex items-center gap-3 text-[12px] text-neutral-500">
            <Link href="/studio/account" className="transition hover:text-neutral-900">
              {t("nav.account")}
            </Link>
            <RegistryCatalogueInfoTooltip theme="light" />
            <Link href={fieldExplorerRecordsHref()} className="transition hover:text-neutral-900">
              {t("nav.registry")}
            </Link>
          </div>
        </>
      }
      aside={
        <div className="relative w-full max-w-[min(100%,320px)]">
          <div className={`${rrowmStudioSurface.card} p-6`}>
            <div className="flex justify-center">
              <ArtworksHeroPreview
                artworks={previewArtworks as any[]}
                variant="editorial"
                pick="latest"
                tone="light"
              />
            </div>
            {previewArtworks.length === 0 ? (
              <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400">
                {t("studio.hero.previewEmpty")}
              </p>
            ) : null}
          </div>
        </div>
      }
    />
  );
}
