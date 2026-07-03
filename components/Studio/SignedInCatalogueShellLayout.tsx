"use client";

import { useEffect, useState } from "react";

import { ArtistWorkspaceShellLayout } from "@/components/Studio/ArtistWorkspaceShellLayout";
import { CollectorWorkspaceShellLayout } from "@/components/Studio/CollectorWorkspaceShellLayout";
import { GalleryWorkspaceShellLayout } from "@/components/Studio/GalleryWorkspaceShellLayout";
import { RegistryCatalogueShellProvider } from "@/components/Registry/RegistryCatalogueShellContext";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";

type WorkspaceRole = "artist" | "collector" | "gallery";

type SignedInCatalogueShellLayoutProps = {
  children: React.ReactNode;
};

export function SignedInCatalogueShellLayout({
  children,
}: SignedInCatalogueShellLayoutProps) {
  const sb = useSupabaseBrowserLazy();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<WorkspaceRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = sb();
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.user?.id) {
        if (!cancelled) {
          setUserId(null);
          setRole(null);
          setReady(true);
        }
        return;
      }

      const uid = session.user.id;
      const { data: actor } = await supabase
        .from("actor_profiles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      if (cancelled) return;

      const r = actor?.role;
      if (r === "artist" || r === "collector" || r === "gallery") {
        setUserId(uid);
        setRole(r);
      } else {
        setUserId(null);
        setRole(null);
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [sb]);

  if (!ready) {
    return <>{children}</>;
  }

  if (!userId || !role) {
    return <>{children}</>;
  }

  if (role === "artist") {
    return (
      <RegistryCatalogueShellProvider>
        <ArtistWorkspaceShellLayout userId={userId} catalogueActive>
          {children}
        </ArtistWorkspaceShellLayout>
      </RegistryCatalogueShellProvider>
    );
  }

  if (role === "collector") {
    return (
      <RegistryCatalogueShellProvider>
        <CollectorWorkspaceShellLayout userId={userId} catalogueActive>
          {children}
        </CollectorWorkspaceShellLayout>
      </RegistryCatalogueShellProvider>
    );
  }

  return (
    <RegistryCatalogueShellProvider>
      <GalleryWorkspaceShellLayout userId={userId} catalogueActive>
        {children}
      </GalleryWorkspaceShellLayout>
    </RegistryCatalogueShellProvider>
  );
}
