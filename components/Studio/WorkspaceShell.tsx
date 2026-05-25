"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { workspace } from "@/styles/workspace-design";

export type WorkspaceNavItem = {
  id: string;
  label: string;
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

/**
 * Shared workspace chrome: artist-style sticky sidebar, mobile tabs, activity + sign-out.
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
  activityHeading = "Activity",
  onSignOut,
  isTransitioning = false,
  children,
}: WorkspaceShellProps) {
  const isLight = isLightChrome;

  return (
    <div
      className={`relative min-h-[100dvh] pt-[calc(5rem+env(safe-area-inset-top,0px))] transition-[background] duration-500 ease-out ${atmosphereClassName}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <div
        className={`relative z-10 mx-auto flex w-full max-w-[1600px] min-h-[calc(100dvh-5rem-env(safe-area-inset-top,0px))] ${
          isLight ? "text-neutral-800" : "text-white"
        }`}
      >
        <aside className="hidden w-72 shrink-0 px-6 py-10 lg:block lg:w-80 lg:px-8 xl:px-10 xl:py-12">
          <div className="sticky top-24 py-2 pr-6 transition-colors duration-300 xl:pr-8">
            <div className="flex flex-col gap-8 text-[13px]">
              {navItems.map((item) => {
                const active = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === activeId) return;
                      onSelect(item.id);
                    }}
                    className={`${workspace.nav.item} rounded-xl px-3 py-2 -mx-3 ${
                      active
                        ? isLight
                          ? `${workspace.type.navItemActive} bg-gradient-to-r from-neutral-950/[0.08] via-[#151a24]/[0.06] to-transparent ring-1 ring-neutral-900/[0.06]`
                          : "text-sm font-medium text-white bg-white/[0.08]"
                        : isLight
                          ? `${workspace.type.navItemIdle} hover:bg-neutral-900/[0.03]`
                          : "text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.04]"
                    } transition-[background-color,color] duration-300`}
                  >
                    <span className={workspace.nav.label}>
                      <span>{item.label}</span>
                      {item.showDot ? (
                        <span className={workspace.nav.dot} aria-hidden />
                      ) : null}
                    </span>
                    <span
                      className={`${workspace.nav.underline} ${
                        active ? "w-8 opacity-70" : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-35"
                      } ${isLight ? "bg-neutral-900" : "bg-white"}`}
                    />
                  </button>
                );
              })}
            </div>

            <div
              className={`mt-10 pt-6 ${isLight ? "border-t border-black/10" : ""}`}
            >
              {sidebarFooter}
            </div>

            {sidebarActivity ? (
              <div
                className={`mt-8 pt-6 ${isLight ? "border-t border-black/10" : ""}`}
              >
                <p
                  className={`text-sm font-medium ${
                    isLight ? "text-neutral-500" : "text-white/70"
                  }`}
                >
                  {activityHeading}
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

            <button
              type="button"
              className={`mt-10 w-full text-left text-sm font-medium transition-colors ${
                isLight
                  ? "text-neutral-400 hover:text-neutral-700"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => void onSignOut()}
            >
              Sign out
            </button>
          </div>
        </aside>

        <div
          className={`flex min-h-0 flex-1 flex-col px-5 pb-16 pt-8 transition-all duration-300 md:px-10 md:pt-10 lg:px-14 xl:px-20 xl:pb-24 xl:pt-12 ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <div className="mb-8 flex gap-6 overflow-x-auto pb-0 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color] duration-200 ${
                  activeId === item.id
                    ? isLight
                      ? "bg-neutral-950/[0.08] text-neutral-950 ring-1 ring-neutral-900/[0.06]"
                      : "bg-white/[0.1] text-white"
                    : isLight
                      ? "text-neutral-500 hover:bg-neutral-900/[0.03] hover:text-neutral-800"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white/90"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.showDot ? (
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-300/80" />
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          {children}
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
          My account
        </p>
      ) : (
        <Link href="/account" className={`mb-4 block text-sm font-medium transition ${link}`}>
          My account →
        </Link>
      )}
      {catalogueActive ? (
        <p
          className={`block text-sm font-medium ${catalogueClass}`}
          aria-current="page"
        >
          Browse catalogue
        </p>
      ) : (
        <Link href="/registry" className={`block text-sm font-medium transition ${link}`}>
          Browse catalogue →
        </Link>
      )}
      {extra}
    </>
  );
}
