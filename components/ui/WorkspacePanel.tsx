import type { ReactNode } from "react";

import { workspace } from "@/styles/workspace-design";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/** Premium floating panel — account, settings, workspace sections */
export function WorkspacePanel({
  title,
  description,
  children,
  className = "",
}: Props) {
  return (
    <section className={`${workspace.panel.shell} ${className}`}>
      <h2 className={workspace.panel.title}>{title}</h2>
      {description ? (
        <p className={workspace.panel.description}>{description}</p>
      ) : null}
      <div className={workspace.panel.body}>{children}</div>
    </section>
  );
}
