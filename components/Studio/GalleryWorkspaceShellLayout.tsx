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
  GALLERY_SECTION_IDS,
  isGallerySectionId,
  navigateToGallerySection,
  type GallerySectionId,
} from "@/lib/gallery-workspace-nav";
import { appendPersonalArchiveNavItem } from "@/lib/personal-archive-nav";
import { GALLERY_SECTION_LABEL_KEYS } from "@/lib/workspace-nav-i18n";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type ActivityRow = {
  id: string;
  message: string;
  created_at?: string;
};

type GalleryWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  activeSection?: GallerySectionId | null;
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

  const navItems = useMemo(
    () =>
      appendPersonalArchiveNavItem(
        GALLERY_SECTION_IDS.map((id) => ({
          id,
          label: t(GALLERY_SECTION_LABEL_KEYS[id]),
        })),
        t
      ),
    [t]
  );

  return (
    <WorkspaceShell
      atmosphereClassName="ds-page-environment"
      navItems={navItems}
      activeId={activeNavId ?? activeSection ?? ""}
      onSelect={(id) => {
        if (isGallerySectionId(id)) {
          navigateToGallerySection(router, id);
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
