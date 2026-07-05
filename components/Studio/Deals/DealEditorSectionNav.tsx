"use client";

import type { DealEditorSection, DealEditorSectionId } from "@/lib/deal-editor";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  sections: DealEditorSection[];
  activeId: DealEditorSectionId;
  completedIds: ReadonlySet<DealEditorSectionId>;
  onSelect: (id: DealEditorSectionId) => void;
};

export function DealEditorSectionNav({
  sections,
  activeId,
  completedIds,
  onSelect,
}: Props) {
  return (
    <nav
      aria-label="Proposal outline"
      className={`${studioV2.scope} lg:sticky lg:top-[calc(5rem+env(safe-area-inset-top,0px)+7.5rem)] lg:self-start`}
    >
      <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
        Filing steps
      </p>
      <p className="mt-2 font-serif text-[1.1rem] text-[var(--v2-ink)]">Proposal outline</p>
      <ol className="mt-4 space-y-1">
        {sections.map((section, index) => {
          const active = section.id === activeId;
          const complete = completedIds.has(section.id);
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition motion-reduce:transition-none ${
                  active
                    ? "border-[var(--v2-ink)] bg-[var(--v2-ink)] text-white"
                    : "border-[var(--v2-border)] text-[var(--v2-ink-muted)] hover:border-[var(--v2-border-strong)] hover:text-[var(--v2-ink)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full v2-type-mono text-[10px] ${
                    active
                      ? "bg-white/15 text-white"
                      : complete
                        ? "border border-[var(--v2-lime-transfer-dim)] bg-[var(--v2-lime-transfer-dim)]/40 text-[var(--v2-ink)]"
                        : "border border-[var(--v2-border)] bg-white text-[var(--v2-cool-grey)]"
                  }`}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm font-medium">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
