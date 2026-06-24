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
  CompletenessMeter,
  HeroActionButton,
  HeroInlineLink,
  HeroStat,
  HeroTile,
  heroMetricsGridClass,
  publicPath,
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

const HERO_THEME = "light" as const;

export function CollectorWorkspaceHero({
  displayName,
  location,
  publicPageHref,
  previewArtworks,
  snapshot,
  onGoToSection,
}: Props) {
  const { t } = useLocalePreferences();
  const headline = displayName.trim() || t("collector.hero.fallbackCollection");
  const path = publicPageHref ? publicPath(publicPageHref) : null;
  const verifiedPct =
    snapshot.held > 0
      ? Math.round((snapshot.verifiedOwnership / snapshot.held) * 100)
      : 0;

  return (
    <StudioHeroSlab
      headerExtra={
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              snapshot.profilePublic
                ? "border border-emerald-900/12 bg-emerald-50 text-emerald-800"
                : "border border-neutral-900/[0.08] bg-neutral-50 text-neutral-600"
            }`}
          >
            {t("collector.hero.profile")}{" "}
            {snapshot.profilePublic ? t("collector.hero.on") : t("collector.hero.off")}
          </span>
          {snapshot.profilePublic ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                snapshot.anonymousOnPublic
                  ? "border border-violet-900/10 bg-violet-50 text-violet-800"
                  : "border border-neutral-900/[0.08] bg-neutral-50 text-neutral-600"
              }`}
            >
              {snapshot.anonymousOnPublic
                ? t("collector.hero.anonymousLabel")
                : t("collector.hero.nameShown")}
            </span>
          ) : (
            <span className="text-sm text-neutral-500">
              {t("collector.hero.privateByDefault")}
            </span>
          )}
        </div>
      }
      title={
        <>
          <InfoTooltip text={t("collector.hero.tooltip")} theme="light" />
          <h1 className="mt-3 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-neutral-950 md:text-[2.65rem] lg:text-[2.85rem]">
            {headline}
          </h1>
          {location ? <p className="mt-3 text-sm text-neutral-500">{location}</p> : null}
          <p className="mt-4 text-sm text-neutral-500">
            Register · Verify · Preserve · Transact
          </p>
        </>
      }
      metrics={
        <ul className={heroMetricsGridClass}>
          <HeroTile
            title={t("collector.hero.ownershipOnRecord")}
            theme={HERO_THEME}
            footer={
              <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("works")}>
                {t("collector.hero.viewWorks")}
              </HeroActionButton>
            }
          >
            <HeroStat
              theme={HERO_THEME}
              value={snapshot.held}
              sub={
                snapshot.held === 1 ? t("collector.hero.work") : t("collector.hero.works")
              }
              label={t("collector.hero.inStewardship")}
            />
            <CompletenessMeter
              theme={HERO_THEME}
              percent={verifiedPct}
              label={t("collector.hero.verifiedOwnership")}
              accent="teal"
            />
          </HeroTile>

          <HeroTile
            title={t("collector.hero.continuity")}
            theme={HERO_THEME}
            footer={
              snapshot.attentionCount > 0 ? (
                <HeroActionButton theme={HERO_THEME} onClick={() => onGoToSection("attention")}>
                  {fillMessage(t("collector.hero.openAttention"), {
                    count: String(snapshot.attentionCount),
                  })}
                </HeroActionButton>
              ) : (
                <span className="text-[11px] text-neutral-400">
                  {t("collector.hero.nothingNeedsAttention")}
                </span>
              )
            }
          >
            <HeroStat
              theme={HERO_THEME}
              value={snapshot.attentionCount}
              sub={
                snapshot.attentionCount === 1
                  ? t("collector.hero.item")
                  : t("collector.hero.items")
              }
              label={t("collector.hero.attentionLabel")}
            />
            {snapshot.attentionCount > 0 ? (
              <span className="inline-flex w-fit rounded-full border border-amber-900/12 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                {t("collector.hero.actionSuggested")}
              </span>
            ) : (
              <span className="text-[11px] text-emerald-700">{t("collector.hero.allClear")}</span>
            )}
          </HeroTile>

          <HeroTile title={t("collector.hero.publicCollection")} theme={HERO_THEME}>
            <div className="rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-3 py-2.5">
              <p className="text-[11px] font-medium text-neutral-500">Public URL</p>
              <p
                className={`mt-1 truncate font-mono text-[11px] ${
                  path ? "text-emerald-700" : "text-neutral-400"
                }`}
              >
                {path ?? t("collector.hero.publicPageWhenSlug")}
              </p>
            </div>
            {publicPageHref ? (
              <HeroInlineLink theme={HERO_THEME} href={publicPageHref} className="block w-full">
                {t("studio.hero.viewPublicPage")}
              </HeroInlineLink>
            ) : (
              <HeroInlineLink theme={HERO_THEME} href="/studio/account" className="block w-full">
                {t("collector.hero.accountPresence")}
              </HeroInlineLink>
            )}
          </HeroTile>
        </ul>
      }
      actions={
        <>
          <button type="button" onClick={() => onGoToSection("works")} className={rrowmButton.primaryEconomic}>
            {t("collector.hero.viewWorks")}
          </button>
          {snapshot.attentionCount > 0 ? (
            <button
              type="button"
              onClick={() => onGoToSection("attention")}
              className={rrowmButton.secondary}
            >
              {fillMessage(t("collector.hero.openAttention"), {
                count: String(snapshot.attentionCount),
              })}
            </button>
          ) : null}
          <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[12px] text-neutral-500">
            <Link href="/studio/account" className="transition hover:text-neutral-900">
              {t("nav.account")}
            </Link>
            <RegistryCatalogueInfoTooltip theme="light" />
            <Link href={fieldExplorerRecordsHref()} className="transition hover:text-neutral-900">
              {t("collector.hero.registry")}
            </Link>
          </div>
        </>
      }
      aside={
        <div className="relative w-full max-w-[min(100%,320px)]">
          <div className={`${rrowmStudioSurface.card} p-6`}>
            <div className="flex justify-center">
              <ArtworksHeroPreview
                artworks={previewArtworks as PreviewArtwork[]}
                variant="editorial"
                pick="latest"
                tone="light"
              />
            </div>
            {previewArtworks.length === 0 ? (
              <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400">
                {t("collector.hero.previewEmpty")}
              </p>
            ) : null}
          </div>
        </div>
      }
    />
  );
}
