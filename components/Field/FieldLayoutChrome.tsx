"use client";

import { usePathname } from "next/navigation";

import { FieldExplorerSubNav } from "@/components/Field/FieldExplorerSubNav";
import { FIELD_ROOT, isFieldSubnavPath } from "@/lib/field-nav";
import { fieldV2 } from "@/styles/field-v2";

type Props = {
  children: React.ReactNode;
};

export function FieldLayoutChrome({ children }: Props) {
  const pathname = usePathname();
  const showExplorerSubNav = isFieldSubnavPath(pathname);
  const isSignatureRoot = pathname === FIELD_ROOT;

  return (
    <div
      className={`${fieldV2.scope} relative min-h-[100dvh] overflow-x-clip bg-[var(--v2-white)] text-[var(--v2-ink)] selection:bg-black/10`}
    >
      {!isSignatureRoot ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[var(--v2-cool-grey)]/[0.06] to-transparent"
          aria-hidden
        />
      ) : null}
      <div
        className={`relative z-10 flex min-h-[inherit] flex-col ${isSignatureRoot ? "" : "pt-16 md:pt-20"}`}
      >
        {showExplorerSubNav ? <FieldExplorerSubNav /> : null}
        {children}
      </div>
    </div>
  );
}
