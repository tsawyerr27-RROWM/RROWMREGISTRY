"use client";

import Link from "next/link";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { StudioHeroSlab } from "@/components/Studio/StudioHeroSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import type { PublicPresence } from "@/lib/public-presence";
import type { ProfileCompletenessSnapshot } from "@/lib/studio-profile-completeness";
import { RegistryCatalogueInfoTooltip } from "@/components/Registry/RegistryCatalogueInfoTooltip";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { productRoleLabel } from "@/lib/studio-terminology";
import { rrowmButton, rrowmStudioSurface } from "@/styles/rrowm-theme";
import {
  CompletenessMeter,
  FieldChecklist,
  HeroInlineLink,
  HeroTextLink,
  HeroTile,
  heroMetricsGridClass,
  heroMetricsGridPairClass,
  publicPath,
} from "@/components/workspace/WorkspaceHeroPrimitives";

const TILE = { theme: "light" as const, density: "compact" as const };

export type AccountHeroPreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

export type AccountProfileSnapshot = {
  bio?: string;
  website?: string;
  instagram?: string;
  location?: string;
  description?: string;
  anonymousOnPublic?: boolean;
  ownedWorkCount?: number;
};

type Role = "artist" | "collector" | "gallery";

const HERO_THEME = "light" as const;

function filled(s: string | undefined): boolean {
  return Boolean(s && s.trim().length > 0);
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function VisibilityChips({ presence }: { presence: PublicPresence }) {
  const chips: { key: keyof PublicPresence; label: string; title: string }[] = [
    { key: "profile", label: "Profile", title: "Public profile" },
    { key: "location", label: "Location", title: "Location" },
    { key: "ownership", label: "Owner", title: "Ownership context" },
    { key: "values", label: "Values", title: "Declared values" },
  ];
  const onCount = chips.filter((c) => presence[c.key]).length;

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-neutral-500">
        <span className="font-medium text-neutral-800">{onCount}</span> of {chips.length}{" "}
        visible
      </p>
      <div className="grid min-w-0 grid-cols-2 gap-1.5">
        {chips.map((c) => {
          const on = presence[c.key];
          return (
            <span
              key={c.key}
              title={c.title}
              className={`flex min-h-[1.75rem] min-w-0 items-center justify-center rounded-md px-1.5 py-1 text-center text-[10px] font-medium leading-snug ${
                on
                  ? "border border-emerald-900/10 bg-emerald-50 text-emerald-800"
                  : "border border-neutral-900/[0.06] bg-neutral-50 text-neutral-400"
              }`}
            >
              {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PreviewRow({
  label,
  on,
}: {
  label: string;
  on: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`tabular-nums text-[13px] font-semibold ${
          on ? "text-emerald-700" : "text-neutral-400"
        }`}
      >
        {on ? "On" : "Off"}
      </span>
    </li>
  );
}

function AccountHeroAside({
  presence,
  showPreview,
  artworks,
  anyPreviewImage,
}: {
  presence: PublicPresence;
  showPreview: boolean;
  artworks: AccountHeroPreviewArtwork[];
  anyPreviewImage: boolean;
}) {
  return (
    <div className={`${rrowmStudioSurface.card} w-full p-5`}>
      {showPreview ? (
        <>
          <div className="flex justify-center">
            <ArtworksHeroPreview artworks={artworks as any[]} tone="light" />
          </div>
          {!anyPreviewImage ? (
            <p className="mt-3 text-center text-[11px] leading-relaxed text-neutral-400">
              Images appear when registered works include artwork images.
            </p>
          ) : null}
          <div
            className="my-4 border-t border-neutral-900/[0.06]"
            aria-hidden
          />
        </>
      ) : null}

      <h3 className="font-serif text-base font-normal text-neutral-950">
        Visibility snapshot
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
        Live readout · updates as you adjust toggles below
      </p>
      <div className="mt-3">
        <VisibilityChips presence={presence} />
      </div>
      <ul className="mt-4 space-y-2 border-t border-neutral-900/[0.06] pt-4">
        <PreviewRow label="Public profile" on={presence.profile} />
        <PreviewRow label="Location" on={presence.location} />
        <PreviewRow label="Ownership context" on={presence.ownership} />
        <PreviewRow label="Declared values" on={presence.values} />
      </ul>
      <div className="mt-3 border-t border-neutral-900/[0.06] pt-3">
        <HeroTextLink theme={HERO_THEME} href="#account-visibility">
          Adjust visibility toggles
        </HeroTextLink>
      </div>
    </div>
  );
}

function ArtistNarrativeTile({
  snapshot,
  profileCompleteness,
}: {
  snapshot: AccountProfileSnapshot;
  profileCompleteness: ProfileCompletenessSnapshot | null;
}) {
  const bio = snapshot.bio?.trim() ?? "";
  const ig = snapshot.instagram?.trim().replace(/^@/, "") ?? "";
  const checklistItems =
    profileCompleteness?.items.map((item) => ({
      label: item.label,
      done: item.done,
    })) ?? [];

  return (
    <HeroTile
      {...TILE}
      title="Public narrative"
      footer={
        <HeroTextLink theme={HERO_THEME} href="#account-profile">
          Edit biography & links
        </HeroTextLink>
      }
    >
      {profileCompleteness ? (
        <CompletenessMeter
          theme={HERO_THEME}
          percent={profileCompleteness.percent}
          label="Discoverability checklist"
        />
      ) : checklistItems.length > 0 ? (
        <FieldChecklist theme={HERO_THEME} items={checklistItems} />
      ) : null}
      {bio ? (
        <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-600 italic">
          &ldquo;{truncate(bio, 100)}&rdquo;
        </p>
      ) : (
        <p className="text-[11px] leading-relaxed text-neutral-500">
          No biography yet. Add one to shape how collectors read your practice.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {filled(snapshot.website) ? (
          <span className="rounded-full border border-neutral-900/[0.06] bg-neutral-50 px-2 py-0.5 text-[10px] text-neutral-600">
            Website
          </span>
        ) : null}
        {ig ? (
          <span className="rounded-full border border-neutral-900/[0.06] bg-neutral-50 px-2 py-0.5 text-[10px] text-neutral-600">
            @{ig}
          </span>
        ) : null}
        {!filled(snapshot.website) && !ig ? (
          <span className="text-[10px] text-neutral-400">No links added</span>
        ) : null}
      </div>
    </HeroTile>
  );
}

function ArtistPracticeTile({
  declaredCount,
  registryCount,
}: {
  declaredCount: number;
  registryCount: number;
}) {
  return (
    <HeroTile
      {...TILE}
      title="Practice"
      footer={
        <HeroTextLink theme={HERO_THEME} href="#account-practice">
          Edit declared practices
        </HeroTextLink>
      }
    >
      <div className="space-y-2">
        <p className="text-[11px] text-neutral-600">
          <span className="font-medium text-neutral-900">{declaredCount}</span> declared
          {registryCount > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="font-medium text-neutral-900">{registryCount}</span> from
              Registry
            </>
          ) : null}
        </p>
        <p className="line-clamp-2 text-[10px] leading-relaxed text-neutral-500">
          Declared practices shape your public story. Registry evidence is read-only.
        </p>
      </div>
    </HeroTile>
  );
}

function CanonicalPresenceTile({
  publicPageHref,
  presence,
  roleLabel,
}: {
  publicPageHref: string | null;
  presence: PublicPresence;
  roleLabel: string;
}) {
  const path = publicPageHref ? publicPath(publicPageHref) : null;
  const live = Boolean(path && presence.profile);

  return (
    <HeroTile {...TILE} title="Canonical presence">
      <div className="rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-3 py-2.5">
        <p className="text-[11px] font-medium text-neutral-500">Public URL</p>
        <p
          className={`mt-1 truncate font-mono text-[11px] ${
            live ? "text-emerald-700" : "text-neutral-400"
          }`}
        >
          {path ?? `${roleLabel.toLowerCase()} · not published`}
        </p>
      </div>
      {publicPageHref ? (
        <HeroInlineLink theme={HERO_THEME} href={publicPageHref} className="block w-full">
          {live ? "Open live page" : "Preview page (profile off)"}
        </HeroInlineLink>
      ) : (
        <p className="text-[11px] leading-relaxed text-neutral-400">
          Your public slug appears after studio onboarding.
        </p>
      )}
    </HeroTile>
  );
}

function CollectorPrivacyTile({
  presence,
  anonymousOnPublic,
}: {
  presence: PublicPresence;
  anonymousOnPublic: boolean;
}) {
  return (
    <HeroTile
      {...TILE}
      title="Privacy first"
      footer={
        <HeroTextLink theme={HERO_THEME} href="#account-visibility">
          Privacy & visibility
        </HeroTextLink>
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border ${
            presence.profile
              ? "border-emerald-900/12 bg-emerald-50"
              : "border-neutral-900/[0.06] bg-neutral-50"
          }`}
        >
          <span className="text-[10px] font-medium text-neutral-500">Profile</span>
          <span
            className={`text-sm font-semibold ${
              presence.profile ? "text-emerald-700" : "text-neutral-400"
            }`}
          >
            {presence.profile ? "On" : "Off"}
          </span>
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] text-neutral-600">
            {presence.profile
              ? "A public collector page exists."
              : "No public profile. Fully private."}
          </p>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
              anonymousOnPublic
                ? "border border-violet-900/10 bg-violet-50 text-violet-800"
                : "border border-neutral-900/[0.06] bg-neutral-50 text-neutral-500"
            }`}
          >
            {anonymousOnPublic ? "Anonymous label" : "Name shown"}
          </span>
        </div>
      </div>
    </HeroTile>
  );
}

function CollectorCollectionTile({
  presence,
  ownedWorkCount,
}: {
  presence: PublicPresence;
  ownedWorkCount: number;
}) {
  return (
    <HeroTile
      {...TILE}
      title="Collection signals"
      footer={
        <HeroTextLink theme={HERO_THEME} href="#account-visibility">
          Ownership & value toggles
        </HeroTextLink>
      }
    >
      <p className="font-serif text-xl font-normal tabular-nums text-neutral-950">
        {ownedWorkCount}
        <span className="ml-1.5 text-sm font-sans font-normal text-neutral-500">
          registered {ownedWorkCount === 1 ? "work" : "works"}
        </span>
      </p>
      <div className="flex gap-2">
        <span
          className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-medium ${
            presence.ownership
              ? "border border-emerald-900/10 bg-emerald-50 text-emerald-800"
              : "border border-neutral-900/[0.06] bg-neutral-50 text-neutral-400"
          }`}
        >
          Ownership {presence.ownership ? "shown" : "hidden"}
        </span>
        <span
          className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-medium ${
            presence.values
              ? "border border-emerald-900/10 bg-emerald-50 text-emerald-800"
              : "border border-neutral-900/[0.06] bg-neutral-50 text-neutral-400"
          }`}
        >
          Values {presence.values ? "shown" : "hidden"}
        </span>
      </div>
    </HeroTile>
  );
}

function GalleryIdentityTile({
  snapshot,
  displayName,
  profileCompleteness,
  presence,
}: {
  snapshot: AccountProfileSnapshot;
  displayName: string;
  profileCompleteness: ProfileCompletenessSnapshot | null;
  presence: PublicPresence;
}) {
  const checklistItems =
    profileCompleteness?.items.map((item) => ({
      label: item.label,
      done: item.done,
    })) ?? [
      { label: "Display name", done: filled(displayName) },
      { label: "Location", done: filled(snapshot.location) },
      { label: "Website", done: filled(snapshot.website) },
      { label: "Description", done: filled(snapshot.description) },
    ];

  return (
    <HeroTile
      {...TILE}
      title="Institutional identity"
      footer={
        <HeroTextLink theme={HERO_THEME} href="#account-profile">
          Edit institution details
        </HeroTextLink>
      }
    >
      {profileCompleteness ? (
        <CompletenessMeter
          theme={HERO_THEME}
          percent={profileCompleteness.percent}
          label="Discoverability checklist"
        />
      ) : null}
      <FieldChecklist theme={HERO_THEME} items={checklistItems} />
      <div className="border-t border-neutral-900/[0.06] pt-2.5">
        <VisibilityChips presence={presence} />
      </div>
    </HeroTile>
  );
}

function roleTiles(
  role: Role,
  props: {
    displayName: string;
    publicPageHref: string | null;
    workspaceHref: string;
    workspaceLabel: string;
    presence: PublicPresence;
    snapshot: AccountProfileSnapshot;
    ownedWorkCount: number;
    profileCompleteness: ProfileCompletenessSnapshot | null;
    declaredPracticeCount: number;
    registryEvidenceCount: number;
    participantLabel: string;
    organisationIdentityTitle: string;
  }
): React.ReactNode {
  const {
    displayName,
    publicPageHref,
    workspaceHref,
    workspaceLabel,
    presence,
    snapshot,
    ownedWorkCount,
    profileCompleteness,
    declaredPracticeCount,
    registryEvidenceCount,
    participantLabel,
    organisationIdentityTitle,
  } = props;

  if (role === "artist") {
    return (
      <>
        <ArtistNarrativeTile
          snapshot={snapshot}
          profileCompleteness={profileCompleteness}
        />
        <ArtistPracticeTile
          declaredCount={declaredPracticeCount}
          registryCount={registryEvidenceCount}
        />
        <CanonicalPresenceTile
          publicPageHref={publicPageHref}
          presence={presence}
          roleLabel={participantLabel}
        />
      </>
    );
  }

  if (role === "collector") {
    return (
      <>
        <CollectorPrivacyTile
          presence={presence}
          anonymousOnPublic={Boolean(snapshot.anonymousOnPublic)}
        />
        <CollectorCollectionTile presence={presence} ownedWorkCount={ownedWorkCount} />
        <CanonicalPresenceTile
          publicPageHref={publicPageHref}
          presence={presence}
          roleLabel={participantLabel}
        />
      </>
    );
  }

  return (
    <>
      <GalleryIdentityTile
        snapshot={snapshot}
        displayName={displayName}
        profileCompleteness={profileCompleteness}
        presence={presence}
      />
      <CanonicalPresenceTile
        publicPageHref={publicPageHref}
        presence={presence}
        roleLabel={participantLabel}
      />
    </>
  );
}

type Props = {
  displayName: string;
  role: Role;
  publicPageHref: string | null;
  workspaceHref: string;
  workspaceLabel: string;
  presence: PublicPresence;
  profileSnapshot?: AccountProfileSnapshot;
  profileCompleteness?: ProfileCompletenessSnapshot | null;
  declaredPracticeCount?: number;
  registryEvidenceCount?: number;
  collectionPreviewArtworks?: AccountHeroPreviewArtwork[] | null;
};

export function AccountPresenceHero({
  displayName,
  role,
  publicPageHref,
  workspaceHref,
  workspaceLabel,
  presence,
  profileSnapshot = {},
  profileCompleteness = null,
  declaredPracticeCount = 0,
  registryEvidenceCount = 0,
  collectionPreviewArtworks,
}: Props) {
  const { t } = useLocalePreferences();
  const participantLabel = productRoleLabel(role, t);
  const headline = displayName.trim() || "Your account";
  const previewList = collectionPreviewArtworks ?? [];
  const showCollectionPreview = role === "collector" && previewList.length > 0;
  const anyPreviewImage = previewList.some(
    (a) => a.image_url && String(a.image_url).trim() !== ""
  );
  const ownedWorkCount =
    profileSnapshot.ownedWorkCount ?? previewList.length;

  const tooltipText =
    role === "collector"
      ? "Your public presence on the registry is deliberate. These controls shape what visitors see, not your internal records or studio activity."
      : "Your public presence on the registry is deliberate. These controls shape what visitors see, not your internal records or workspace activity.";

  const metricsGridClass =
    role === "gallery" ? heroMetricsGridPairClass : heroMetricsGridClass;

  return (
    <StudioHeroSlab
      overline="Account"
      asideAlign="start"
      headerExtra={
        <span className="inline-flex rounded-full border border-neutral-900/[0.08] bg-white px-2.5 py-0.5 text-sm font-medium text-neutral-700">
          {participantLabel}
        </span>
      }
      title={
        <>
          <InfoTooltip text={tooltipText} theme="light" />
          <h1 className="mt-3 font-serif text-[2rem] font-normal leading-[1.05] tracking-tight text-neutral-950 md:text-[2.65rem] lg:text-[2.85rem]">
            {headline}
          </h1>
          <p className="mt-4 text-sm text-neutral-500">
            Presence · Visibility · Public narrative
          </p>
        </>
      }
      metrics={
        <ul className={metricsGridClass}>
          {roleTiles(role, {
            displayName,
            publicPageHref,
            workspaceHref,
            workspaceLabel,
            presence,
            snapshot: profileSnapshot,
            ownedWorkCount,
            profileCompleteness,
            declaredPracticeCount,
            registryEvidenceCount,
            participantLabel,
            organisationIdentityTitle: t("account.hero.organisationIdentity"),
          })}
        </ul>
      }
      actions={
        <>
          <Link href={workspaceHref} className={rrowmButton.primary}>
            {workspaceLabel}
          </Link>
          {publicPageHref ? (
            <Link href={publicPageHref} className={rrowmButton.secondary}>
              View public page
            </Link>
          ) : (
            <span className="rounded-xl border border-neutral-900/[0.06] px-5 py-2.5 text-[13px] text-neutral-400">
              Public page when slug is available
            </span>
          )}
          <div className="ml-auto flex items-center gap-3 text-[12px] text-neutral-500">
            <RegistryCatalogueInfoTooltip theme="light" />
            <Link href={fieldExplorerRecordsHref()} className="transition hover:text-neutral-900">
              Registry
            </Link>
          </div>
        </>
      }
      aside={
        <div className="relative w-full max-w-[min(100%,300px)] lg:sticky lg:top-28">
          <AccountHeroAside
            presence={presence}
            showPreview={showCollectionPreview}
            artworks={previewList}
            anyPreviewImage={anyPreviewImage}
          />
        </div>
      }
    />
  );
}
