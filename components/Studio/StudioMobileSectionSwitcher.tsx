"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { studioV2 } from "@/styles/studio-v2";

export type StudioMobileSection = {
  id: string;
  label: string;
  /** Route navigation — closes sheet; navigation handled by link */
  href?: string;
  showDot?: boolean;
};

type Props = {
  sections: readonly StudioMobileSection[];
  activeId: string;
  onSelect: (id: string) => void;
  isLight?: boolean;
};

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      className={`${className ?? ""} transition-transform duration-300 motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function sectionIsActive(
  section: StudioMobileSection,
  activeId: string,
  pathname: string | null
): boolean {
  return (
    activeId === section.id ||
    Boolean(section.href && pathname?.startsWith(section.href))
  );
}

export function StudioMobileSectionSwitcher({
  sections,
  activeId,
  onSelect,
  isLight = true,
}: Props) {
  const { t } = useLocalePreferences();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const activeSection =
    sections.find((section) => sectionIsActive(section, activeId, pathname)) ??
    sections[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, activeId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSelect = (id: string) => {
    setOpen(false);
    if (id === activeId) return;
    onSelect(id);
  };

  const rowClass = (active: boolean) =>
    [
      "studio-section-switcher__row motion-reduce:transition-none",
      active ? "studio-section-switcher__row--active" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const portal =
    open && mounted
      ? createPortal(
          <div className="studio-section-switcher-portal fixed inset-0 z-[65] lg:hidden">
            <button
              type="button"
              className="studio-section-switcher-backdrop absolute inset-0 bg-[var(--v2-near-black)]/15 motion-reduce:transition-none"
              aria-label={t("studio.shell.closeSectionSwitcher")}
              onClick={() => setOpen(false)}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("studio.shell.sectionSwitcherTitle")}
              className="studio-section-switcher-sheet pointer-events-auto fixed inset-x-0 bottom-0 flex max-h-[min(72dvh,28rem)] w-full flex-col overflow-hidden v2-surface-glass-dark v2-radius-modal rounded-b-none p-1.5 shadow-[var(--v2-shadow-cinematic)] motion-reduce:transition-none"
            >
              <div className="studio-section-switcher__shell v2-surface-paper v2-radius-card flex min-h-0 flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--v2-border)] px-4 py-3">
                  <p className="v2-type-label text-[10px] tracking-[0.22em] text-[var(--v2-ink-muted)]">
                    {t("studio.shell.section")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--v2-border)] text-[var(--v2-ink-muted)] transition hover:border-[var(--v2-border-strong)] hover:text-[var(--v2-ink)] motion-reduce:transition-none"
                    aria-label={t("studio.shell.closeSectionSwitcher")}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      ×
                    </span>
                  </button>
                </header>

                <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                  {sections.map((section) => {
                    const active = sectionIsActive(section, activeId, pathname);
                    const inner = (
                      <>
                        <span className="studio-section-switcher__row-label">{section.label}</span>
                        <span className="flex items-center gap-2">
                          {section.showDot ? (
                            <span
                              className="inline-flex h-2 w-2 rounded-full bg-[var(--v2-amber-exception)]"
                              aria-hidden
                            />
                          ) : null}
                          {active ? (
                            <span className="v2-type-mono text-[9px] uppercase tracking-[0.16em] text-[var(--v2-ink-muted)]">
                              {t("studio.shell.onFile")}
                            </span>
                          ) : null}
                        </span>
                      </>
                    );

                    if (section.href) {
                      return (
                        <li key={section.id}>
                          <Link
                            href={section.href}
                            onClick={() => setOpen(false)}
                            className={rowClass(active)}
                            aria-current={active ? "page" : undefined}
                          >
                            {inner}
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(section.id)}
                          className={rowClass(active)}
                          aria-current={active ? "page" : undefined}
                        >
                          {inner}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={`${studioV2.scope} mb-6 lg:hidden`}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={t("studio.shell.openSectionSwitcher")}
          onClick={() => setOpen((prev) => !prev)}
          className={`studio-section-switcher__trigger ${studioV2.surface.filingSheetMajor} flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3 text-left motion-reduce:transition-none ${
            isLight ? "text-[var(--v2-ink)]" : "text-white"
          }`}
        >
          <div className="min-w-0">
            <p
              className={`v2-type-label text-[10px] tracking-[0.22em] ${
                isLight ? "text-[var(--v2-ink-muted)]" : "text-white/60"
              }`}
            >
              {t("studio.shell.section")}
            </p>
            <p
              className={`v2-type-display mt-1 truncate text-[1.2rem] leading-none tracking-[-0.02em] ${
                isLight ? "text-[var(--v2-ink)]" : "text-white"
              }`}
            >
              {activeSection?.label ?? "-"}
            </p>
          </div>
          <ChevronIcon
            open={open}
            className={`h-5 w-5 shrink-0 ${isLight ? "text-[var(--v2-ink-muted)]" : "text-white/55"}`}
          />
        </button>
      </div>
      {portal}
    </>
  );
}
