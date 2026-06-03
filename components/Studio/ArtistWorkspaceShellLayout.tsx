"use client";

import { StudioShell } from "@/components/Studio/StudioShell";
import type { CreativeSectionId } from "@/lib/studio-nav";

type ArtistWorkspaceShellLayoutProps = {
  children: React.ReactNode;
  userId: string;
  /** When set (e.g. on /studio), highlights that section in the sidebar */
  activeSection?: CreativeSectionId | null;
  /** Overrides section highlight (e.g. /personal-archive) */
  activeNavId?: string | null;
  saleSignalCount?: number;
  accountActive?: boolean;
  catalogueActive?: boolean;
};

export function ArtistWorkspaceShellLayout({
  children,
  userId,
  activeSection = null,
  activeNavId = null,
  saleSignalCount = 0,
  accountActive = false,
  catalogueActive = false,
}: ArtistWorkspaceShellLayoutProps) {
  return (
    <StudioShell
      role="artist"
      userId={userId}
      activeId={activeNavId ?? activeSection ?? ""}
      saleSignalCount={saleSignalCount}
      accountActive={accountActive}
      catalogueActive={catalogueActive}
      navigateOnSectionSelect
    >
      {children}
    </StudioShell>
  );
}
