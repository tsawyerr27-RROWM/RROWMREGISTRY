"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const GALLERY_NAV_LABELS: Record<GallerySectionId, string> = {
  studio: "Overview",
  "record-depth": "Record depth",
  roster: "Artists",
  catalogue: "Works",
  verification: "Continuity & certs",
  invitations: "Invitations",
};

type ActivityRow = {
  id: string;
  message: string;
  created_at?: string;
};

type GalleryWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  activeSection?: GallerySectionId | null;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function GalleryWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  accountActive = false,
  catalogueActive = false,
}: GalleryWorkspaceShellLayoutProps) {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const [activityFeed, setActivityFeed] = useState<ActivityRow[]>([]);

  const fetchActivity = useCallback(async () => {
    const supabase = sb();
    const { data, error } = await supabase
      .from("activity_events")
      .select("id, message, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    setActivityFeed((data as ActivityRow[]) || []);
  }, [sb, userId]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  const navItems = useMemo(
    () =>
      GALLERY_SECTION_IDS.map((id) => ({
        id,
        label: GALLERY_NAV_LABELS[id],
      })),
    []
  );

  const sidebarActivity =
    activityFeed.length === 0 ? (
      <p className="text-[13px] text-neutral-500">No recent catalogue activity.</p>
    ) : (
      <div
        className={
          activityFeed.length > 3
            ? "max-h-[14rem] space-y-3 overflow-y-auto overscroll-y-contain pr-1"
            : "space-y-3"
        }
      >
        {activityFeed.map((item) => (
          <div key={item.id} className="text-[13px] leading-snug text-neutral-600">
            {item.message}
          </div>
        ))}
      </div>
    );

  return (
    <WorkspaceShell
      atmosphereClassName="ds-page-environment"
      navItems={navItems}
      activeId={activeSection ?? ""}
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
      sidebarActivity={sidebarActivity}
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
