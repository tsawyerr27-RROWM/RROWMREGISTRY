"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { WorkspaceSidebarActivityFeed } from "@/components/Studio/WorkspaceSidebarActivityFeed";
import {
  WorkspaceShell,
  WorkspaceShellFooterLinks,
  type WorkspaceNavItem,
} from "@/components/Studio/WorkspaceShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { signOutAndRedirect } from "@/lib/auth-sign-out";
import {
  buildCollectorNavItems,
  buildCreativeNavItems,
  buildOrganisationNavItems,
  isCollectorSectionId,
  isCreativeSectionId,
  isOrganisationSectionId,
  navigateToCollectorSection,
  navigateToCreativeSection,
  navigateToOrganisationSection,
  type CollectorNavFlags,
  type CreativeNavFlags,
  type OrganisationNavFlags,
} from "@/lib/studio-nav";
import { workspace } from "@/styles/workspace-design";

export type StudioRole = "artist" | "collector" | "gallery";

const SIGN_OUT_NEXT: Record<StudioRole, string> = {
  artist: "/studio/creative",
  collector: "/studio/collector",
  gallery: "/studio/organisation",
};

const DEFAULT_ATMOSPHERE: Record<StudioRole, string> = {
  artist: workspace.atmosphere.environment,
  collector: "ds-page-environment",
  gallery: "ds-page-environment",
};

export type StudioShellProps = {
  role: StudioRole;
  userId: string;
  children: ReactNode;
  activeId: string;
  /** Dashboard pages: in-page section switching. Layout wrappers: route navigation. */
  onSelect?: (id: string) => void;
  /** Pre-built nav (dashboard pages with attention dots). Omit to build from flags. */
  navItems?: WorkspaceNavItem[];
  creativeNavFlags?: CreativeNavFlags;
  collectorNavFlags?: CollectorNavFlags;
  organisationNavFlags?: OrganisationNavFlags;
  /** Shorthand for layout wrappers — maps to creative ownership dot */
  saleSignalCount?: number;
  accountActive?: boolean;
  catalogueActive?: boolean;
  atmosphereClassName?: string;
  isLightChrome?: boolean;
  isTransitioning?: boolean;
  sidebarActivity?: ReactNode;
  activityHeading?: string;
  sidebarFooter?: ReactNode;
  footerExtra?: ReactNode;
  signOutNext?: string;
  /**
   * When true and `onSelect` is omitted, section clicks navigate to the role home
   * with sessionStorage section memory (account / archive / registry layouts).
   */
  navigateOnSectionSelect?: boolean;
};

export function StudioShell({
  role,
  userId,
  children,
  activeId,
  onSelect,
  navItems,
  creativeNavFlags,
  collectorNavFlags,
  organisationNavFlags,
  saleSignalCount = 0,
  accountActive = false,
  catalogueActive = false,
  atmosphereClassName,
  isLightChrome = true,
  isTransitioning = false,
  sidebarActivity,
  activityHeading,
  sidebarFooter,
  footerExtra,
  signOutNext,
  navigateOnSectionSelect = false,
}: StudioShellProps) {
  const router = useRouter();
  const { t } = useLocalePreferences();

  const resolvedNavItems = useMemo(() => {
    if (navItems) return navItems;
    switch (role) {
      case "artist":
        return buildCreativeNavItems(t, {
          ownershipSaleSignalCount: saleSignalCount,
          ...creativeNavFlags,
        });
      case "collector":
        return buildCollectorNavItems(t, collectorNavFlags);
      case "gallery":
        return buildOrganisationNavItems(t, organisationNavFlags);
      default:
        return [];
    }
  }, [
    navItems,
    role,
    t,
    saleSignalCount,
    creativeNavFlags,
    collectorNavFlags,
    organisationNavFlags,
  ]);

  const defaultSidebarActivity = useMemo(() => {
    if (role === "collector") {
      return (
        <WorkspaceSidebarActivityFeed
          userId={userId}
          emptyMessage={t("studio.shell.noActivity")}
        />
      );
    }
    if (role === "gallery") {
      return (
        <WorkspaceSidebarActivityFeed
          userId={userId}
          variant="compact"
          emptyMessage={t("gallery.shell.noCatalogueActivity")}
        />
      );
    }
    return <WorkspaceSidebarActivityFeed userId={userId} />;
  }, [role, userId, t]);

  const resolvedActivityHeading = useMemo(() => {
    if (activityHeading !== undefined) return activityHeading;
    if (role === "collector") return t("studio.shell.recentNotes");
    if (role === "gallery") return t("studio.shell.catalogueActivity");
    return undefined;
  }, [activityHeading, role, t]);

  const resolvedFooter =
    sidebarFooter ??
    (
      <WorkspaceShellFooterLinks
        isLight={isLightChrome}
        accountActive={accountActive}
        catalogueActive={catalogueActive}
        extra={footerExtra}
      />
    );

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
      return;
    }
    if (!navigateOnSectionSelect) return;

    if (role === "artist" && isCreativeSectionId(id)) {
      navigateToCreativeSection(router, id);
    } else if (role === "collector" && isCollectorSectionId(id)) {
      navigateToCollectorSection(router, id);
    } else if (role === "gallery" && isOrganisationSectionId(id)) {
      navigateToOrganisationSection(router, id);
    }
  };

  const handleSignOut = async () => {
    const next = signOutNext ?? SIGN_OUT_NEXT[role];
    await signOutAndRedirect("/login?next=" + encodeURIComponent(next));
  };

  return (
    <WorkspaceShell
      atmosphereClassName={atmosphereClassName ?? DEFAULT_ATMOSPHERE[role]}
      navItems={resolvedNavItems}
      activeId={activeId}
      onSelect={handleSelect}
      isLightChrome={isLightChrome}
      isTransitioning={isTransitioning}
      sidebarFooter={resolvedFooter}
      sidebarActivity={sidebarActivity ?? defaultSidebarActivity}
      activityHeading={resolvedActivityHeading}
      onSignOut={handleSignOut}
    >
      {children}
    </WorkspaceShell>
  );
}
