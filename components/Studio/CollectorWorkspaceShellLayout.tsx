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
  buildCollectorNavItems,
  isCollectorSectionId,
  navigateToCollectorSection,
  type CollectorSectionId,
} from "@/lib/studio-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type CollectorWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  activeSection?: CollectorSectionId | null;
  activeNavId?: string | null;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function CollectorWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  activeNavId = null,
  accountActive = false,
  catalogueActive = false,
}: CollectorWorkspaceShellLayoutProps) {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const sb = useSupabaseBrowserLazy();

  const navItems = useMemo(() => buildCollectorNavItems(t), [t]);

  return (
    <WorkspaceShell
      atmosphereClassName="ds-page-environment"
      navItems={navItems}
      activeId={activeNavId ?? activeSection ?? ""}
      onSelect={(id) => {
        if (isCollectorSectionId(id)) {
          navigateToCollectorSection(router, id);
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
          emptyMessage={t("studio.shell.noActivity")}
        />
      }
      activityHeading={t("studio.shell.recentNotes")}
      onSignOut={async () => {
        await sb().auth.signOut();
        deferredRouterPush(
          router,
          "/login?next=" + encodeURIComponent("/collector-studio")
        );
      }}
    >
      {children}
    </WorkspaceShell>
  );
}
