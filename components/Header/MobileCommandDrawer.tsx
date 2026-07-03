"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { FooterRegionSelector } from "@/components/LandingPage/FooterRegionSelector";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { RegionId } from "@/lib/regions";

export type MobileCommandNavItem = {
  href: string;
  label: string;
  active: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  exploreItems: readonly MobileCommandNavItem[];
  sessionActive: boolean;
  loginHref: string;
  accountHref: string;
  signingOut: boolean;
  onSignOut: () => void;
  regionId: RegionId;
  onRegionChange: (id: RegionId) => void;
  regionLabelId: string;
};

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function drawerNavItemClass(active: boolean, cta = false): string {
  return [
    "mobile-command-drawer__nav-item motion-reduce:transition-none",
    active ? "mobile-command-drawer__nav-item--active" : "",
    cta ? "mobile-command-drawer__nav-item--cta" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function DrawerSection({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mobile-command-drawer__section">
      <div className="mobile-command-drawer__section-head">
        <h3 className="v2-type-display text-[1.2rem] leading-none text-[var(--v2-ink)]">
          {title}
        </h3>
        <span className="mobile-command-drawer__section-index" aria-hidden>
          {index}
        </span>
      </div>
      {children}
    </section>
  );
}

export function MobileCommandDrawer({
  open,
  onClose,
  exploreItems,
  sessionActive,
  loginHref,
  accountHref,
  signingOut,
  onSignOut,
  regionId,
  onRegionChange,
  regionLabelId,
}: Props) {
  const { t } = useLocalePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="mobile-command-drawer-portal fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        className="mobile-command-drawer-backdrop absolute inset-0 bg-[var(--v2-near-black)]/15 motion-reduce:transition-none"
        aria-label="Close menu"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.drawer.title")}
        className="mobile-command-drawer absolute inset-y-0 right-0 flex w-[min(100%,22.5rem)] max-w-full flex-col p-2 motion-reduce:transition-none v2-surface-glass-dark v2-shadow-cinematic"
      >
        <div className="mobile-command-drawer__shell v2-surface-paper v2-radius-card flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="mobile-command-drawer__header flex shrink-0 items-center justify-end gap-3 py-3 pr-3">
            <button
              type="button"
              onClick={onClose}
              className="mobile-command-drawer__close inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border motion-reduce:transition-none"
              aria-label="Close menu"
            >
              <CloseIcon className="h-[1.125rem] w-[1.125rem] text-[var(--v2-ink-muted)]" />
            </button>
          </header>

          <div className="mobile-command-drawer__scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
            <DrawerSection index="01" title={t("nav.drawer.explore")}>
              <ul className="mobile-command-drawer__nav">
                {exploreItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={drawerNavItemClass(item.active)}
                      aria-current={item.active ? "page" : undefined}
                    >
                      <span className="mobile-command-drawer__nav-label">{item.label}</span>
                      <span className="mobile-command-drawer__nav-meta">
                        {item.active ? "ON FILE" : "OPEN"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </DrawerSection>

            <DrawerSection index="02" title={t("nav.drawer.account")}>
              <ul className="mobile-command-drawer__nav">
                {sessionActive ? (
                  <>
                    <li>
                      <Link
                        href={accountHref}
                        onClick={onClose}
                        className={drawerNavItemClass(false)}
                      >
                        <span className="mobile-command-drawer__nav-label">
                          {t("nav.myAccount")}
                        </span>
                        <span className="mobile-command-drawer__nav-meta">STUDIO</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        disabled={signingOut}
                        onClick={() => {
                          onClose();
                          onSignOut();
                        }}
                        className={`${drawerNavItemClass(false)} disabled:opacity-50`}
                      >
                        <span className="mobile-command-drawer__nav-label">
                          {signingOut ? "…" : t("nav.signOut")}
                        </span>
                        <span className="mobile-command-drawer__nav-meta">EXIT</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href={loginHref}
                        onClick={onClose}
                        className={drawerNavItemClass(false)}
                      >
                        <span className="mobile-command-drawer__nav-label">{t("nav.signIn")}</span>
                        <span className="mobile-command-drawer__nav-meta">LOGIN</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/get-started"
                        onClick={onClose}
                        className={drawerNavItemClass(false, true)}
                      >
                        <span className="mobile-command-drawer__nav-label">{t("nav.takePart")}</span>
                        <span className="mobile-command-drawer__nav-meta">JOIN</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </DrawerSection>

            <DrawerSection index="03" title={t("nav.drawer.preferences")}>
              <div className="mobile-command-drawer__prefs">
                <span
                  id={regionLabelId}
                  className="v2-type-label block text-[10px] tracking-[0.2em] text-[var(--v2-ink-muted)]"
                >
                  {t("nav.regionLabel")}
                </span>
                <div className="mt-3">
                  <FooterRegionSelector
                    regionId={regionId}
                    onRegionChange={onRegionChange}
                    labelId={regionLabelId}
                    menuPlacement="down"
                    className="w-full max-w-none"
                  />
                </div>
              </div>
            </DrawerSection>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}

export function MobileCommandMenuButton({
  open,
  onClick,
  className = "",
}: {
  open: boolean;
  onClick: () => void;
  tone?: "light" | "dark";
  className?: string;
}) {
  const { t } = useLocalePreferences();

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={t("nav.drawer.openMenu")}
      onClick={onClick}
      className={`rrowm-command-bar-icon-btn v2-motion-hover-subtle lg:hidden ${
        open ? "border-[var(--v2-cobalt-signal-dim)] bg-white/90 text-[var(--v2-ink)]" : ""
      } ${className}`}
    >
      <MenuIcon className="h-[1.125rem] w-[1.125rem]" />
    </button>
  );
}
