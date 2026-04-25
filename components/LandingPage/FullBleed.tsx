import type { ReactNode } from "react";

/** Break out of centered page gutter to full viewport width (parent should use overflow-x-hidden). */
export function FullBleed({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
