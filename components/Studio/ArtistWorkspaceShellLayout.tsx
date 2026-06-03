"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { WorkspaceSidebarActivityFeed } from "@/components/Studio/WorkspaceSidebarActivityFeed";
import {
  WorkspaceShell,
  WorkspaceShellFooterLinks,
} from "@/components/Studio/WorkspaceShell";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import {
  STUDIO_SECTION_IDS,
  isStudioSectionId,
  navigateToStudioSection,
  type StudioSectionId,
} from "@/lib/studio-workspace-nav";
import { appendPersonalArchiveNavItem } from "@/lib/personal-archive-nav";
import { STUDIO_SECTION_LABEL_KEYS } from "@/lib/workspace-nav-i18n";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { workspace } from "@/styles/workspace-design";

type ArtistWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  /** When set (e.g. on /studio), highlights that section in the sidebar */
  activeSection?: StudioSectionId | null;
  /** Overrides section highlight (e.g. /personal-archive) */
  activeNavId?: string | null;
  saleSignalCount?: number;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function ArtistWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  activeNavId = null,
  saleSignalCount = 0,
  accountActive = false,
  catalogueActive = false,
}: ArtistWorkspaceShellLayoutProps) {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const sb = useSupabaseBrowserLazy();

  const navItems = useMemo(
    () =>
      appendPersonalArchiveNavItem(
        STUDIO_SECTION_IDS.map((id) => ({
          id,
          label: t(STUDIO_SECTION_LABEL_KEYS[id]),
          showDot: id === "Ownership" && saleSignalCount > 0,
        })),
        t
      ),
    [saleSignalCount, t]
  );

  return (
    <WorkspaceShell
      atmosphereClassName={workspace.atmosphere.environment}
      navItems={navItems}
      activeId={activeNavId ?? activeSection ?? ""}
      onSelect={(id) => {
        if (isStudioSectionId(id)) {
          navigateToStudioSection(router, id);
        }
      }}
      isLightChrome
      sidebarFooter={
        <WorkspaceShellFooterLinks
          isLight
          accountActive={accountActive}
          catalogueActive={catalogueActive}
        />
      }
      sidebarActivity={<WorkspaceSidebarActivityFeed userId={userId} />}
      onSignOut={async () => {
        await sb().auth.signOut();
        deferredRouterPush(
          router,
          "/login?next=" + encodeURIComponent("/studio")
        );
      }}
    >
      {children}
    </WorkspaceShell>
  );
}
