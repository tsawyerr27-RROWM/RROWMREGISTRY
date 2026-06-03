"use client";

import type { ReactNode } from "react";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { workspace } from "@/styles/workspace-design";

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

/** Archival governance block — matches workspace panel chrome (Phases B–E). */
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
    <section
      id={id}
      className={`scroll-mt-28 ${workspace.panel.shell} ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <InfoTooltip text={description} />
          <h2 className="mt-2 font-serif text-[1.35rem] font-normal text-neutral-950 md:text-[1.75rem]">
            {title}
          </h2>
        </div>
        {(badge || actions) ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {badge}
            {actions}
          </div>
        ) : null}
      </div>
      <div className={workspace.panel.body}>{children}</div>
    </section>
  );
}
