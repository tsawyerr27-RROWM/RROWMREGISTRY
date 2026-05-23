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
  STUDIO_SECTION_IDS,
  isStudioSectionId,
  navigateToStudioSection,
  type StudioSectionId,
} from "@/lib/studio-workspace-nav";
import { workspace } from "@/styles/workspace-design";

type ActivityRow = {
  id: string;
  message: string;
  created_at?: string;
  at?: string;
};

type ArtistWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  /** When set (e.g. on /studio), highlights that section in the sidebar */
  activeSection?: StudioSectionId | null;
  saleSignalCount?: number;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function ArtistWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  saleSignalCount = 0,
  accountActive = false,
  catalogueActive = false,
}: ArtistWorkspaceShellLayoutProps) {
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
      STUDIO_SECTION_IDS.map((id) => ({
        id,
        label: id,
        showDot: id === "Ownership" && saleSignalCount > 0,
      })),
    [saleSignalCount]
  );

  const sidebarActivity =
    activityFeed.length === 0 ? (
      <p className="text-xs text-neutral-500">No recent activity yet.</p>
    ) : (
      <div
        className={
          activityFeed.length > 3
            ? "max-h-[14rem] space-y-3 overflow-y-auto overscroll-y-contain pr-1"
            : "space-y-3"
        }
      >
        {activityFeed.map((item) => (
          <div key={item.id} className="text-xs text-neutral-600">
            <p>{item.message}</p>
            <p className="mt-1 text-[10px] text-neutral-400">
              {new Date((item.created_at ?? item.at) || Date.now()).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );

  return (
    <WorkspaceShell
      atmosphereClassName={workspace.atmosphere.environment}
      navItems={navItems}
      activeId={activeSection ?? ""}
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
      sidebarActivity={sidebarActivity}
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
