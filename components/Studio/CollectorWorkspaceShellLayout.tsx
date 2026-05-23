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
  COLLECTOR_SECTION_IDS,
  isCollectorSectionId,
  navigateToCollectorSection,
  type CollectorSectionId,
} from "@/lib/collector-workspace-nav";

type ActivityRow = {
  id: string;
  message: string;
  created_at?: string;
};

type CollectorWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  activeSection?: CollectorSectionId | null;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function CollectorWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  accountActive = false,
  catalogueActive = false,
}: CollectorWorkspaceShellLayoutProps) {
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
      COLLECTOR_SECTION_IDS.map((id) => ({
        id,
        label: id === "workspace" ? "Workspace" : id === "works" ? "Works" : "Attention",
      })),
    []
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
              {new Date(item.created_at || Date.now()).toLocaleString()}
            </p>
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
      sidebarActivity={sidebarActivity}
      activityHeading="Recent notes"
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
