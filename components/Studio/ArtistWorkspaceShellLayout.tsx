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
  buildCreativeNavItems,
  isCreativeSectionId,
  navigateToCreativeSection,
  type CreativeSectionId,
} from "@/lib/studio-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { workspace } from "@/styles/workspace-design";

type ArtistWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  /** When set (e.g. on /studio), highlights that section in the sidebar */
  activeSection?: CreativeSectionId | null;
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
      buildCreativeNavItems(t, { ownershipSaleSignalCount: saleSignalCount }),
    [saleSignalCount, t]
  );

  return (
    <WorkspaceShell
      atmosphereClassName={workspace.atmosphere.environment}
      navItems={navItems}
      activeId={activeNavId ?? activeSection ?? ""}
      onSelect={(id) => {
        if (isCreativeSectionId(id)) {
          navigateToCreativeSection(router, id);
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
