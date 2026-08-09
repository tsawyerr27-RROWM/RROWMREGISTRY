"use client";

import { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RrowmLogo } from "@/components/brand/RrowmLogo";
import type { Session } from "@supabase/supabase-js";
import { signOutAndRedirect } from "@/lib/auth-sign-out";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { FooterRegionSelector } from "@/components/LandingPage/FooterRegionSelector";
import {
  MobileCommandDrawer,
  MobileCommandMenuButton,
} from "@/components/Header/MobileCommandDrawer";
import { NotificationInboxBell } from "@/components/notifications/NotificationInboxBell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  fieldExplorerHref,
  fieldExplorerRecordsHref,
} from "@/lib/field-nav";

const LOGIN_FALLBACK = "/login";
const COMMAND_BAR_THRESHOLD = 72;

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

export default function Header({ initialPathname = "" }: { initialPathname?: string }) {
  const sb = useSupabaseBrowserLazy();
  const { regionId, setRegionId, t } = useLocalePreferences();
  const regionLabelId = useId();
  const pathname = usePathname();
  const resolvedPathname =
    pathname && pathname.length > 0 ? pathname : initialPathname;
  const hideChromeWhenPrinting = resolvedPathname?.startsWith("/certificate") ?? false;
  const [scrollY, setScrollY] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [actorRole, setActorRole] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFieldSignatureRoot = resolvedPathname === "/field";

  const isHome = resolvedPathname === "/";

  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/get-started");

  const isMarketingPublic =
    isHome ||
    isAuthPage ||
    pathname === "/about" ||
    pathname?.startsWith("/about/") ||
    pathname === "/contact";

  const isRegistrySurface =
    pathname?.startsWith("/registry") ||
    pathname?.startsWith("/artist") ||
    pathname?.startsWith("/artwork") ||
    pathname?.startsWith("/verify") ||
    pathname?.startsWith("/certificate");

  const isAppShell =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/gallery-dashboard") ||
    pathname?.startsWith("/studio/") ||
    pathname === "/studio" ||
    pathname === "/account" ||
    pathname?.startsWith("/account/") ||
    pathname === "/collector-studio" ||
    pathname === "/institutional-studio-dashboard" ||
    pathname === "/personal-archive" ||
    pathname?.startsWith("/admin");

  const onStudio =
    isAppShell ||
    pathname === "/studio" ||
    pathname?.startsWith("/dashboard");

  const onRegistry =
    isRegistrySurface ||
    pathname?.startsWith("/field/explorer/records") ||
    pathname?.startsWith("/field/record/");

  const onAbout =
    pathname === "/about" || pathname?.startsWith("/about/");

  const onField =
    (pathname === "/field" || pathname?.startsWith("/field/")) && !onRegistry && !onAbout;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // The header is global. If the browser Supabase client is unavailable
    // (misconfigured env), degrade to a signed-out header instead of throwing
    // and white-screening every page.
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const supabase = sb();
      const result = supabase.auth.onAuthStateChange((event, nextSession) => {
        setSession(nextSession ?? null);
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          setHydrated(true);
        }
      });
      subscription = result.data.subscription;
    } catch (error) {
      console.error("[RROWM] Header auth subscription unavailable", error);
      setSession(null);
      setHydrated(true);
    }
    return () => subscription?.unsubscribe();
  }, [sb]);

  useEffect(() => {
    let cancelled = false;
    if (!session?.user?.id) {
      setActorRole(null);
      return;
    }
    void (async () => {
      try {
        const supabase = sb();
        const { data } = await supabase
          .from("actor_profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (!cancelled) setActorRole(data?.role ? String(data.role) : null);
      } catch (error) {
        console.error("[RROWM] Header actor-role lookup failed", error);
        if (!cancelled) setActorRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, sb]);

  const studioHref =
    actorRole === "collector"
      ? "/studio/collector"
      : actorRole === "gallery"
        ? "/studio/organisation"
        : "/studio/creative";

  const studioNavHref = hydrated && session ? studioHref : LOGIN_FALLBACK;

  const loginHref =
    pathname && pathname !== "/login"
      ? `${LOGIN_FALLBACK}?next=${encodeURIComponent(pathname)}`
      : LOGIN_FALLBACK;

  const onArtistStudio =
    pathname === "/studio/creative" ||
    pathname === "/studio" ||
    pathname?.startsWith("/dashboard");

  const [dashboardHeaderDark, setDashboardHeaderDark] = useState(false);

  useEffect(() => {
    const onAtmosphere = (e: Event) => {
      const ce = e as CustomEvent<{ headerDark?: boolean }>;
      setDashboardHeaderDark(!!ce.detail?.headerDark);
    };
    window.addEventListener("rrowm-dashboard-atmosphere", onAtmosphere);
    return () =>
      window.removeEventListener("rrowm-dashboard-atmosphere", onAtmosphere);
  }, []);

  useEffect(() => {
    if (
      pathname !== "/studio/creative" &&
      pathname !== "/studio" &&
      !pathname?.startsWith("/dashboard")
    ) {
      setDashboardHeaderDark(false);
    }
  }, [pathname]);

  const headerOnDarkStudio = onArtistStudio && dashboardHeaderDark;

  const fieldSignatureHeader =
    isFieldSignatureRoot && scrollY <= COMMAND_BAR_THRESHOLD;

  const commandBarFloated =
    headerOnDarkStudio ||
    scrollY > COMMAND_BAR_THRESHOLD ||
    (isMarketingPublic && scrollY > 48);

  const commandBarImmersiveDark = commandBarFloated || fieldSignatureHeader;

  const commandBarTone: "light" | "dark" = commandBarImmersiveDark ? "dark" : "light";

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutAndRedirect("/login");
    } catch {
      setSigningOut(false);
    }
  }, [signingOut]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinkClass = (active: boolean) =>
    `rrowm-command-bar-nav-link v2-motion-hover-subtle ${
      active
        ? "rrowm-command-bar-nav-link--active font-medium"
        : "rrowm-command-bar-nav-link--idle"
    }`;

  const utilityLinkClass = commandBarImmersiveDark
    ? "hidden text-[11px] font-medium tracking-wide text-white/70 transition hover:text-white lg:inline"
    : "hidden text-[11px] font-medium tracking-wide text-neutral-500 transition hover:text-neutral-900 lg:inline";

  const commandNavItems = [
    { href: studioNavHref, label: t("nav.studio"), active: onStudio },
    { href: fieldExplorerRecordsHref(), label: t("nav.registry"), active: onRegistry },
    { href: "/field", label: t("nav.fieldCommand"), active: onField },
    { href: "/about", label: t("nav.about"), active: onAbout },
  ] as const;

  return (
    <header
      data-rrowm-chrome-suppress-invite-signup
      className={`ds-z-floating fixed inset-x-0 top-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5${
        isMarketingPublic ? " rrowm-public" : ""
      }${hideChromeWhenPrinting ? " print:hidden" : ""}`}
    >
      <div
        className={`rrowm-command-bar mx-auto max-w-[min(100%,88rem)] transition-[padding] duration-500 ${
          commandBarFloated
            ? "rrowm-command-bar--floated"
            : fieldSignatureHeader
              ? "rrowm-command-bar--field-signature"
              : "rrowm-command-bar--quiet"
        }`}
      >
        <div
          className={`relative flex items-center gap-2.5 transition-[padding] duration-500 sm:gap-3 ${
            commandBarFloated || fieldSignatureHeader
              ? "px-1 py-1 sm:px-2"
              : "px-1 py-2 sm:px-2 sm:py-3"
          }`}
        >
          <Link
            href="/"
            className="rrowm-logo-slot group relative z-20 flex shrink-0 items-center v2-motion-hover-subtle"
            aria-label="RROWM home"
          >
            <RrowmLogo
              variant="header"
              priority
              sizes="(max-width: 767px) 88px, 220px"
              className={
                commandBarImmersiveDark ? "rrowm-logo-crisp--on-dark" : ""
              }
            />
          </Link>

          <div
            className={`relative min-w-0 flex-1 overflow-hidden transition-[border-radius,padding,box-shadow] duration-500 ${
              fieldSignatureHeader
                ? "rrowm-command-bar__field-signature-shell v2-radius-pill px-3 py-2 sm:px-5 sm:py-2.5"
                : commandBarFloated
                  ? "v2-surface-glass-dark v2-shadow-cinematic v2-radius-pill px-3 py-2 sm:px-5 sm:py-2.5"
                  : ""
            }`}
          >
            <div
              className="rrowm-command-bar__signal pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--v2-cobalt-signal)] to-transparent opacity-40"
              aria-hidden
            />

            <nav className="relative flex items-center justify-between gap-2 sm:gap-3">
            <div
              className={`relative z-10 hidden min-w-0 flex-1 items-center justify-center lg:flex ${
                commandBarImmersiveDark ? "rrowm-command-bar-capsule gap-7 px-8 py-2" : "gap-8 lg:gap-10"
              }`}
            >
              {commandNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(item.active)}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-1 sm:gap-2">
              <Link
                href={fieldExplorerHref()}
                className="rrowm-command-bar-icon-btn v2-motion-hover-subtle"
                aria-label={t("nav.search")}
              >
                <SearchIcon className="h-[1.125rem] w-[1.125rem]" />
              </Link>

              {hydrated && session ? (
                <>
                  <NotificationInboxBell tone={commandBarTone} />
                  <Link
                    href={studioHref}
                    className="rrowm-command-bar-icon-btn v2-motion-hover-subtle hidden lg:inline-flex"
                    aria-label={t("nav.studio")}
                  >
                    <ProfileIcon className="h-[1.125rem] w-[1.125rem]" />
                  </Link>
                  <span className="sr-only lg:not-sr-only lg:inline">
                    <Link href="/studio/account" className={utilityLinkClass}>
                      {t("nav.account")}
                    </Link>
                  </span>
                  <div className="hidden min-w-[10rem] xl:block">
                    <span id={regionLabelId} className="sr-only">
                      {t("nav.regionLabel")}
                    </span>
                    <FooterRegionSelector
                      regionId={regionId}
                      onRegionChange={setRegionId}
                      labelId={regionLabelId}
                      menuPlacement="down"
                      className="md:max-w-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={signingOut}
                    aria-busy={signingOut}
                    className={`hidden min-h-[44px] touch-manipulation rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] transition disabled:cursor-wait lg:inline-flex lg:min-h-0 lg:px-3.5 ${
                      commandBarImmersiveDark
                        ? "text-white/55 hover:text-white/90 disabled:text-white/30"
                        : "text-neutral-500 hover:text-neutral-900 disabled:text-neutral-300"
                    }`}
                    onClick={() => void handleSignOut()}
                  >
                    {signingOut ? "…" : t("nav.signOut")}
                  </button>
                  <MobileCommandMenuButton
                    open={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    tone={commandBarTone}
                  />
                </>
              ) : (
                <>
                  <Link href={loginHref} className={utilityLinkClass}>
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href="/get-started"
                    className={`v2-motion-hover-subtle hidden rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition sm:px-5 sm:py-2.5 sm:text-xs lg:inline-flex ${
                      commandBarImmersiveDark
                        ? "border border-white/18 bg-white/10 text-white hover:bg-white/16"
                        : isAuthPage
                          ? "border border-black/8 bg-white/70 text-neutral-900 backdrop-blur-md hover:bg-white/90"
                          : "border border-black/10 bg-neutral-950 text-white hover:bg-neutral-900"
                    }`}
                  >
                    {t("nav.takePart")}
                  </Link>
                  <MobileCommandMenuButton
                    open={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    tone={commandBarTone}
                  />
                </>
              )}
            </div>
          </nav>
          </div>
        </div>
      </div>

      <MobileCommandDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        exploreItems={commandNavItems}
        sessionActive={Boolean(hydrated && session)}
        loginHref={loginHref}
        accountHref="/studio/account"
        signingOut={signingOut}
        onSignOut={() => void handleSignOut()}
        regionId={regionId}
        onRegionChange={setRegionId}
        regionLabelId={regionLabelId}
      />
    </header>
  );
}
