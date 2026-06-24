"use client";

import type { ReactNode } from "react";

import { StudioContentSlab } from "@/components/Studio/StudioContentSlab";

type Props = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Archival governance block — studio slab chrome aligned with workspace heroes. */
export function GovernanceSectionShell({
  id,
  eyebrow,
  title,
  description,
  badge,
  actions,
  children,
  className = "",
}: Props) {
  return (
    <StudioContentSlab
      id={id}
      overline={eyebrow}
      title={title}
      subtitle={description}
      headerExtra={badge}
      actions={actions}
      scrollMargin
      className={className}
    >
      {children}
    </StudioContentSlab>
  );
}
