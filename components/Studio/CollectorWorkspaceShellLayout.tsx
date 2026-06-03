"use client";

import { StudioShell } from "@/components/Studio/StudioShell";
import type { CollectorSectionId } from "@/lib/studio-nav";

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
  return (
    <StudioShell
      role="collector"
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
