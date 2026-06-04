"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PersonalArchivePageContent } from "@/components/archive/PersonalArchivePageContent";
import { ArtistWorkspaceShellLayout } from "@/components/Studio/ArtistWorkspaceShellLayout";
import { CollectorWorkspaceShellLayout } from "@/components/Studio/CollectorWorkspaceShellLayout";
import { GalleryWorkspaceShellLayout } from "@/components/Studio/GalleryWorkspaceShellLayout";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import { PERSONAL_ARCHIVE_NAV_ID } from "@/lib/personal-archive";

type Role = "artist" | "collector" | "gallery";

export function PersonalArchiveShell() {
  const router = useRouter();
  const pathname = usePathname();
  const sb = useSupabaseBrowserLazy();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = sb();
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.user?.id) {
        if (!cancelled) {
          deferredRouterPush(
            router,
            "/login?next=" + encodeURIComponent(pathname || "/studio/archive")
          );
        }
        return;
      }

      const uid = session.user.id;
      const { data: actor } = await supabase
        .from("actor_profiles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      const r = actor?.role;
      if (r === "artist" || r === "collector" || r === "gallery") {
        if (!cancelled) {
          setUserId(uid);
          setRole(r);
          setReady(true);
        }
      } else if (!cancelled) {
        deferredRouterPush(
          router,
          "/login?next=" + encodeURIComponent(pathname || "/studio/archive")
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, sb]);

  if (!ready || !userId || !role) {
    return (
      <div className="ds-page-environment flex min-h-screen items-center justify-center pt-20">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  const content = <PersonalArchivePageContent />;
  const activeNavId = PERSONAL_ARCHIVE_NAV_ID;

  if (role === "artist") {
    return (
      <ArtistWorkspaceShellLayout userId={userId} activeNavId={activeNavId}>
        {content}
      </ArtistWorkspaceShellLayout>
    );
  }
  if (role === "collector") {
    return (
      <CollectorWorkspaceShellLayout userId={userId} activeNavId={activeNavId}>
        {content}
      </CollectorWorkspaceShellLayout>
    );
  }
  return (
    <GalleryWorkspaceShellLayout userId={userId} activeNavId={activeNavId}>
      {content}
    </GalleryWorkspaceShellLayout>
  );
}
