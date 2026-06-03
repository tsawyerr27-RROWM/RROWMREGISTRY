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
  buildOrganisationNavItems,
  isOrganisationSectionId,
  navigateToOrganisationSection,
  type OrganisationSectionId,
} from "@/lib/studio-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type ActivityRow = {
  id: string;
  message: string;
  created_at?: string;
};

type GalleryWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  activeSection?: OrganisationSectionId | null;
  activeNavId?: string | null;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function GalleryWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  activeNavId = null,
  accountActive = false,
  catalogueActive = false,
}: GalleryWorkspaceShellLayoutProps) {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const sb = useSupabaseBrowserLazy();

  const navItems = useMemo(() => buildOrganisationNavItems(t), [t]);

  return (
    <WorkspaceShell
      atmosphereClassName="ds-page-environment"
      navItems={navItems}
      activeId={activeNavId ?? activeSection ?? ""}
      onSelect={(id) => {
        if (isOrganisationSectionId(id)) {
          navigateToOrganisationSection(router, id);
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
      sidebarActivity={
        <WorkspaceSidebarActivityFeed
          userId={userId}
          variant="compact"
          emptyMessage={t("gallery.shell.noCatalogueActivity")}
        />
      }
      activityHeading={t("studio.shell.catalogueActivity")}
      onSignOut={async () => {
        await sb().auth.signOut();
        deferredRouterPush(
          router,
          "/login?next=" + encodeURIComponent("/institutional-studio-dashboard")
        );
      }}
    >
      {children}
    </WorkspaceShell>
  );
}
