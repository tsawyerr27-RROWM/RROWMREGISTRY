"use client";

import { useCallback, useEffect, useMemo, useState, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { AccountPresenceHero } from "@/components/account/AccountPresenceHero";
import type {
  AccountHeroPreviewArtwork,
  AccountProfileSnapshot,
} from "@/components/account/AccountPresenceHero";
import { AccountPracticeSection } from "@/components/account/AccountPracticeSection";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";
import { AccountSaveBar } from "@/components/account/AccountSaveBar";
import {
  AccountSectionNav,
  buildAccountNavItems,
  type AccountSectionId,
} from "@/components/account/AccountSectionNav";
import { AccountStudioSection } from "@/components/account/AccountStudioSection";
import { AccountVisibilitySection } from "@/components/account/AccountVisibilitySection";
import { PrivacyDataSection } from "@/components/account/PrivacyDataSection";
import { accountBelowHeroClass } from "@/components/account/account-ui";
import { WorkspacePanel } from "@/components/ui/WorkspacePanel";
import type { PublicPresence } from "@/lib/public-presence";
import type { CreativePracticeSettings } from "@/lib/studio-practice-settings";
import type { ProfileCompletenessSnapshot } from "@/lib/studio-profile-completeness";
import { REPRESENTATION_PHRASES } from "@/lib/representation-language";
import { navigateToStudioSection } from "@/lib/studio-nav";
import type { StudioArtworksAccentId } from "@/lib/studio-artworks-accent";

type Role = "artist" | "collector" | "gallery";

type AccountStatus = "active" | "deactivated" | "pending_deletion" | "deleted";

export type AccountPageContentProps = {
  role: Role;
  email: string | null;
  displayName: string;
  onDisplayNameChange: (v: string) => void;
  presence: PublicPresence;
  onPresenceChange: (v: PublicPresence) => void;
  artistBio: string;
  onArtistBioChange: (v: string) => void;
  artistWebsite: string;
  onArtistWebsiteChange: (v: string) => void;
  artistInstagram: string;
  onArtistInstagramChange: (v: string) => void;
  collectorLocation: string;
  onCollectorLocationChange: (v: string) => void;
  collectorBio: string;
  onCollectorBioChange: (v: string) => void;
  collectorAnonymous: boolean;
  onCollectorAnonymousChange: (v: boolean) => void;
  galleryLocation: string;
  onGalleryLocationChange: (v: string) => void;
  galleryWebsite: string;
  onGalleryWebsiteChange: (v: string) => void;
  galleryDescription: string;
  onGalleryDescriptionChange: (v: string) => void;
  studioArtworksAccent: StudioArtworksAccentId;
  onStudioArtworksAccentChange: (v: StudioArtworksAccentId) => void;
  publicPageHref: string | null;
  workspaceHref: string;
  workspaceLabel: string;
  profileSnapshot: AccountProfileSnapshot;
  profileCompleteness: ProfileCompletenessSnapshot | null;
  practiceSettings: CreativePracticeSettings;
  onPracticeSettingsChange: (
    value: SetStateAction<CreativePracticeSettings>
  ) => void;
  registryEvidenceSlugs: string[];
  collectorPreviewArtworks: AccountHeroPreviewArtwork[] | null;
  artistRepHistorical: boolean;
  accountStatus: AccountStatus;
  deletionScheduledAt: string | null;
  authProvider: string;
  onRefreshAccountStatus: () => void;
  saving: boolean;
  savedAt: number | null;
  error: string | null;
  onSave: () => void;
};

function scrollToSection(id: AccountSectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AccountPageContent(props: AccountPageContentProps) {
  const router = useRouter();
  const navItems = useMemo(() => buildAccountNavItems(props.role), [props.role]);
  const [activeSection, setActiveSection] = useState<AccountSectionId>("account-profile");

  const handleNavigate = useCallback((id: AccountSectionId) => {
    setActiveSection(id);
    scrollToSection(id);
  }, []);

  useEffect(() => {
    const ids = navItems.map((i) => i.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id as AccountSectionId | undefined;
        if (top && ids.includes(top)) setActiveSection(top);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [navItems]);

  return (
    <main className="relative mx-auto w-full max-w-[min(100%,88rem)]">
      <AccountPresenceHero
          displayName={props.displayName}
          role={props.role}
          publicPageHref={props.publicPageHref}
          workspaceHref={props.workspaceHref}
          workspaceLabel={props.workspaceLabel}
          presence={props.presence}
          profileSnapshot={props.profileSnapshot}
          profileCompleteness={props.profileCompleteness}
          declaredPracticeCount={props.practiceSettings.declaredSlugs.length}
          registryEvidenceCount={props.registryEvidenceSlugs.length}
          collectionPreviewArtworks={props.collectorPreviewArtworks}
        />

      {props.role === "artist" && props.artistRepHistorical ? (
        <div className="mt-8" role="status">
          <WorkspacePanel
            title="Institution representation"
            description={`${REPRESENTATION_PHRASES.historicalRepresentation}. ${REPRESENTATION_PHRASES.priorFilingsRemainVisible}.`}
          >
            <button
              type="button"
              onClick={() => navigateToStudioSection(router, "Records")}
              className="inline-flex rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Authenticate records in studio
            </button>
          </WorkspacePanel>
        </div>
      ) : null}

      <div className={`${accountBelowHeroClass} lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-14 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-x-16`}>
        <aside className="hidden lg:block">
          <AccountSectionNav
            items={navItems}
            activeId={activeSection}
            onNavigate={handleNavigate}
            layout="desktop"
          />
        </aside>

        <div className="min-w-0 space-y-10 pb-8">
          <div className="lg:hidden">
            <AccountSectionNav
              items={navItems}
              activeId={activeSection}
              onNavigate={handleNavigate}
              layout="mobile"
            />
          </div>
          <AccountProfileSection
            role={props.role}
            displayName={props.displayName}
            onDisplayNameChange={props.onDisplayNameChange}
            email={props.email}
            artistBio={props.artistBio}
            onArtistBioChange={props.onArtistBioChange}
            artistWebsite={props.artistWebsite}
            onArtistWebsiteChange={props.onArtistWebsiteChange}
            artistInstagram={props.artistInstagram}
            onArtistInstagramChange={props.onArtistInstagramChange}
            collectorLocation={props.collectorLocation}
            onCollectorLocationChange={props.onCollectorLocationChange}
            collectorBio={props.collectorBio}
            onCollectorBioChange={props.onCollectorBioChange}
            galleryLocation={props.galleryLocation}
            onGalleryLocationChange={props.onGalleryLocationChange}
            galleryWebsite={props.galleryWebsite}
            onGalleryWebsiteChange={props.onGalleryWebsiteChange}
            galleryDescription={props.galleryDescription}
            onGalleryDescriptionChange={props.onGalleryDescriptionChange}
          />

          <AccountVisibilitySection
            role={props.role}
            presence={props.presence}
            onPresenceChange={props.onPresenceChange}
            collectorAnonymous={props.collectorAnonymous}
            onCollectorAnonymousChange={props.onCollectorAnonymousChange}
            saving={props.saving}
          />

          {props.role === "artist" ? (
            <AccountPracticeSection
              declaredSlugs={props.practiceSettings.declaredSlugs}
              primarySlug={props.practiceSettings.primarySlug}
              practicesVisible={props.practiceSettings.practicesVisible}
              registryEvidenceSlugs={props.registryEvidenceSlugs}
              onDeclaredSlugsChange={(declaredSlugs) =>
                props.onPracticeSettingsChange((prev) => ({
                  ...prev,
                  declaredSlugs,
                }))
              }
              onPrimarySlugChange={(primarySlug) =>
                props.onPracticeSettingsChange((prev) => ({
                  ...prev,
                  primarySlug,
                }))
              }
              onPracticesVisibleChange={(practicesVisible) =>
                props.onPracticeSettingsChange((prev) => ({
                  ...prev,
                  practicesVisible,
                }))
              }
              saving={props.saving}
            />
          ) : null}

          {props.role === "artist" ? (
            <AccountStudioSection
              accent={props.studioArtworksAccent}
              onAccentChange={props.onStudioArtworksAccentChange}
              saving={props.saving}
            />
          ) : null}

          <AccountSaveBar
            saving={props.saving}
            savedAt={props.savedAt}
            error={props.error}
            onSave={props.onSave}
          />

          <PrivacyDataSection
            email={props.email}
            authProvider={props.authProvider}
            accountStatus={props.accountStatus}
            deletionScheduledAt={props.deletionScheduledAt}
            onStatusChange={props.onRefreshAccountStatus}
          />
        </div>
      </div>
    </main>
  );
}
