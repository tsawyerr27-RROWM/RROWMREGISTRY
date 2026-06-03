"use client";

import { StudioShell } from "@/components/Studio/StudioShell";
import type { OrganisationSectionId } from "@/lib/studio-nav";

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
  return (
    <StudioShell
      role="gallery"
      userId={userId}
      activeId={activeNavId ?? activeSection ?? ""}
      accountActive={accountActive}
      catalogueActive={catalogueActive}
      navigateOnSectionSelect
    >
      {children}
    </StudioShell>
  );
}
