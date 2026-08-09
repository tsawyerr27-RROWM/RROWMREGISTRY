"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { RegistryCatalogueInfoTooltip } from "@/components/Registry/RegistryCatalogueInfoTooltip";
import { StudioMobileSectionSwitcher } from "@/components/Studio/StudioMobileSectionSwitcher";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { workspace } from "@/styles/workspace-design";

export type WorkspaceNavItem = {
  id: string;
  label: string;
  /** When set, navigates to route instead of in-page section */
  href?: string;
  /** e.g. pending actions */
  showDot?: boolean;
};

type WorkspaceShellProps = {
  /** Page background (Tailwind classes), e.g. `rrowm-grad-studio` or `ds-page-environment` */
  atmosphereClassName?: string;
  navItems: WorkspaceNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Light sidebar/main text (studio “Studio/Artworks”); dark for certificate-style sections */
  isLightChrome?: boolean;
  sidebarFooter: ReactNode;
  sidebarActivity?: ReactNode;
  activityHeading?: string;
  onSignOut: () => void | Promise<void>;
  /** Optional fade when switching sections (parent controls `isTransitioning`) */
  isTransitioning?: boolean;
  children: ReactNode;
};

function WorkspaceSignOutButton({
  onSignOut,
  isLight,
  className = "",
}: {
  onSignOut: () => void | Promise<void>;
  isLight: boolean;
  className?: string;
}) {
  const { t } = useLocalePreferences();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onSignOut();
    } catch {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      aria-busy={busy}
      className={`relative z-20 min-h-[44px] touch-manipulation text-left text-sm font-medium transition-colors disabled:cursor-wait ${
        isLight
          ? "text-neutral-400 hover:text-neutral-700 disabled:text-neutral-300"
          : "text-white/60 hover:text-white disabled:text-white/35"
      } ${className}`}
      onClick={() => void handleClick()}
    >
      {busy ? "Signing out…" : t("nav.signOut")}
    </button>
  );
}

/**
 * Shared workspace chrome: artist-style sticky sidebar, mobile section switcher, activity + sign-out.
 * Role-specific nav labels and main content are passed by each page.
 */
export function WorkspaceShell({
  atmosphereClassName = workspace.atmosphere.environment,
  navItems,
  activeId,
  onSelect,
  isLightChrome = true,
  sidebarFooter,
  sidebarActivity,
  activityHeading,
  onSignOut,
  isTransitioning = false,
  children,
}: WorkspaceShellProps) {
  const { t } = useLocalePreferences();
  const pathname = usePathname();
  const isLight = isLightChrome;
  const resolvedActivityHeading =
    activityHeading ?? t("studio.shell.activity");

  const navItemClass = (active: boolean) =>
    `${workspace.nav.item} v2-motion-hover-subtle rounded-xl px-3 py-2.5 -mx-3 ${
      active
        ? isLight
          ? `${workspace.type.navItemActive} v2-surface-archive-sheet bg-[var(--v2-cobalt-signal-dim)]/30 pl-4`
          : "v2-type-label text-white bg-white/[0.08]"
        : isLight
          ? `${workspace.type.navItemIdle} hover:bg-black/[0.03]`
          : "v2-type-label text-white/60 hover:text-white hover:bg-white/[0.04]"
    } transition-[background-color,color] duration-300`;

  const navLabel = (item: WorkspaceNavItem, active: boolean) => (
    <>
      <span className={workspace.nav.label}>
        <span>{item.label}</span>
        {item.showDot ? <span className={workspace.nav.dot} aria-hidden /> : null}
      </span>
      <span
        className={`${workspace.nav.underline} ${
          active ? "w-8 opacity-70" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-35"
        } ${isLight ? "bg-neutral-900" : "bg-white"}`}
      />
    </>
  );

  return (
    <div
      className={`relative min-h-[100dvh] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] transition-[background] duration-500 ease-out ${atmosphereClassName}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-[calc(5rem+env(safe-area-inset-top,0px))] flex justify-center"
        aria-hidden
      >
        <span className="v2-surface-signal-line h-8 opacity-35" />
      </div>
      <div
        className={`relative z-10 mx-auto flex w-full min-w-0 max-w-[1600px] min-h-[calc(100dvh-5.5rem-env(safe-area-inset-top,0px))] ${
          isLight ? "text-[var(--v2-ink-soft)]" : "text-white"
        }`}
      >
        <aside className="hidden w-[280px] shrink-0 py-10 pl-5 pr-3 lg:block xl:py-12">
          <div className="rrowm-workspace-sidebar v2-surface-paper v2-radius-card sticky top-28 p-5 py-6 pr-4 transition-colors duration-300 xl:pr-5">
            <div className="flex flex-col gap-3 text-[13px]">
              {navItems.map((item) => {
                const active =
                  activeId === item.id ||
                  Boolean(item.href && pathname?.startsWith(item.href));
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={navItemClass(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      {navLabel(item, active)}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === activeId) return;
                      onSelect(item.id);
                    }}
                    className={navItemClass(active)}
                  >
                    {navLabel(item, active)}
                  </button>
                );
              })}
            </div>

            <div
              className={`mt-10 border-t pt-6 ${isLight ? "border-[var(--v2-border)]" : "border-white/10"}`}
            >
              {sidebarFooter}
            </div>

            {sidebarActivity ? (
              <div
                className={`mt-8 border-t pt-6 ${isLight ? "border-[var(--v2-border)]" : "border-white/10"}`}
              >
                <p
                  className={`v2-type-label ${
                    isLight ? "text-[var(--v2-cool-grey)]" : "text-white/70"
                  }`}
                >
                  {resolvedActivityHeading}
                </p>
                <div
                  className={`mt-3 ${
                    isLight ? "text-neutral-600" : "text-white/90"
                  }`}
                >
                  {sidebarActivity}
                </div>
              </div>
            ) : null}

            <WorkspaceSignOutButton
              onSignOut={onSignOut}
              isLight={isLight}
              className="mt-10 w-full"
            />
          </div>
        </aside>

        <div
          className={`flex min-h-0 min-w-0 w-full flex-1 flex-col px-4 pb-16 pt-8 transition-all duration-300 md:px-6 md:pt-10 lg:px-8 xl:pb-20 xl:px-10 xl:pt-10 ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <StudioMobileSectionSwitcher
            sections={navItems}
            activeId={activeId}
            isLight={isLight}
            onSelect={(id) => {
              const item = navItems.find((entry) => entry.id === id);
              if (item?.href) return;
              if (id === activeId) return;
              onSelect(id);
            }}
          />

          <div
            className={`mb-8 flex flex-col gap-4 border-b pb-6 lg:hidden ${
              isLight ? "border-[var(--v2-border)]" : "border-white/10"
            }`}
          >
            <div className="text-[13px]">{sidebarFooter}</div>
            <WorkspaceSignOutButton onSignOut={onSignOut} isLight={isLight} />
          </div>

          <div key={activeId} className="studio-reveal min-h-0 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shared footer links block (My account, registry, optional extra). */
export function WorkspaceShellFooterLinks({
  isLight = true,
  extra,
  accountActive = false,
  catalogueActive = false,
}: {
  isLight?: boolean;
  extra?: ReactNode;
  /** True when the current page is /account */
  accountActive?: boolean;
  /** True when the current page is the public catalogue (/registry…) */
  catalogueActive?: boolean;
}) {
  const { t } = useLocalePreferences();
  const link =
    isLight
      ? "text-neutral-500 hover:text-neutral-800"
      : "text-white hover:text-white/90";
  const activeClass = isLight ? "text-neutral-900" : "text-white";
  const accountClass = accountActive ? activeClass : link;
  const catalogueClass = catalogueActive ? activeClass : link;
  return (
    <>
      {accountActive ? (
        <p
          className={`mb-4 block text-sm font-medium ${accountClass}`}
          aria-current="page"
        >
          {t("nav.myAccount")}
        </p>
      ) : (
        <Link href="/studio/account" className={`mb-4 block text-sm font-medium transition ${link}`}>
          {t("nav.myAccount")}
        </Link>
      )}
      <div className="flex items-center gap-2">
        {catalogueActive ? (
          <p
            className={`text-sm font-medium ${catalogueClass}`}
            aria-current="page"
          >
            {t("studio.shell.browseCatalogue")}
          </p>
        ) : (
          <Link href={fieldExplorerRecordsHref()} className={`text-sm font-medium transition ${link}`}>
            {t("studio.shell.browseCatalogue")}
          </Link>
        )}
        <RegistryCatalogueInfoTooltip theme={isLight ? "light" : "dark"} />
      </div>
      {extra}
    </>
  );
}
