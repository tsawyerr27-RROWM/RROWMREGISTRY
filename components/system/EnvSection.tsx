import type { ReactNode } from "react";
import { GlassPanel } from "./GlassPanel";

type Rhythm = "open" | "contained";

/**
 * Composes marketing / long-form sections: alternating open bleed vs frosted shell.
 * Does not alter children’s logic — only environmental chrome.
 */
export function EnvSection({
  rhythm,
  children,
  className = "",
  panelClassName = "",
}: {
  rhythm: Rhythm;
  children: ReactNode;
  className?: string;
  /** Extra classes on the glass panel when `rhythm="contained"` */
  panelClassName?: string;
}) {
  if (rhythm === "open") {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`mx-auto w-full max-w-7xl px-6 md:px-10 ${className}`}
    >
      <GlassPanel className={panelClassName}>{children}</GlassPanel>
    </div>
  );
}
