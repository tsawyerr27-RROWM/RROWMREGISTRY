"use client";

import type { DealEditorSection, DealEditorSectionId } from "@/lib/deal-editor";

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
      aria-label="Proposal sections"
      className="lg:sticky lg:top-[calc(5rem+env(safe-area-inset-top,0px)+7.5rem)] lg:self-start"
    >
      <p className="text-sm font-medium text-neutral-700">Proposal outline</p>
      <ol className="mt-4 space-y-1">
        {sections.map((section, index) => {
          const active = section.id === activeId;
          const complete = completedIds.has(section.id);
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-700 hover:bg-white/70 hover:text-neutral-950"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                    active
                      ? "bg-white/15 text-white"
                      : complete
                        ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-900/10"
                        : "bg-neutral-100 text-neutral-500"
                  }`}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${active ? "text-white" : ""}`}>
                    {section.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
