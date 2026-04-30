"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSessionSafe, getSupabaseBrowserClient } from "@/lib/supabase";

const LOGIN_NEXT = "/login?next=" + encodeURIComponent("/studio");

/** Scroll distance (px) after which the header is near minimum opacity */
const FADE_RANGE = 420;

export default function Header() {
  const pathname = usePathname();
  /** Site chrome is hidden when printing certificates (Save as PDF / print). */
  const hideChromeWhenPrinting = pathname?.startsWith("/certificate") ?? false;
  const [scrollY, setScrollY] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const isRegistrySurface =
    pathname?.startsWith("/registry") ||
    pathname?.startsWith("/artist") ||
    pathname?.startsWith("/artwork") ||
    pathname?.startsWith("/verify") ||
    pathname?.startsWith("/certificate");

  const isAppShell =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/gallery-dashboard") ||
    pathname?.startsWith("/studio") ||
    pathname?.startsWith("/account") ||
    pathname?.startsWith("/admin");

  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/get-started");

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
    let mounted = true;
    (async () => {
      const s = await getSessionSafe();
      if (mounted) {
        setSession(s);
        setHydrated(true);
      }
    })();
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e: unknown, s: unknown) => {
      setSession(((s as any) ?? null) as Session | null);
      setHydrated(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fadeT = Math.min(1, scrollY / FADE_RANGE);
  /** Whole header fades out as you scroll; hover brings it back for interaction */
  const baseShellOpacity = Math.max(0.14, 1 - fadeT * 0.86);
  const shellOpacity = hovered ? Math.max(baseShellOpacity, 0.96) : baseShellOpacity;

  const onArtistStudio =
    pathname === "/studio" || pathname?.startsWith("/dashboard");

  const onAbout =
    pathname === "/about" || pathname?.startsWith("/about/");

  /** Certificates / Ownership studio uses a dark bg — dashboard page dispatches this */
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
    if (!pathname?.startsWith("/studio") && !pathname?.startsWith("/dashboard")) {
      setDashboardHeaderDark(false);
    }
  }, [pathname]);

  const headerOnDarkStudio = onArtistStudio && dashboardHeaderDark;

  /** Dark nav copy reads on frosted glass over light page content site-wide */
  const linkClass = headerOnDarkStudio
    ? "text-sm font-medium text-white hover:text-white/90 rrowm-motion transition-colors whitespace-nowrap [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
    : "text-sm font-medium text-neutral-800 hover:text-neutral-950 rrowm-motion transition-colors whitespace-nowrap [text-shadow:0_1px_0_rgba(255,255,255,0.65)]";

  const subtleClass = headerOnDarkStudio
    ? "text-sm font-medium text-white/80 hover:text-white rrowm-motion transition-colors whitespace-nowrap [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
    : "text-sm font-medium text-neutral-500 hover:text-neutral-900 rrowm-motion transition-colors whitespace-nowrap [text-shadow:0_1px_0_rgba(255,255,255,0.5)]";

  /** Slightly richer frost on registry-style routes; still light enough for dark nav text */
  const glassTint = headerOnDarkStudio
    ? "from-black/55 via-black/30 to-black/12"
    : isRegistrySurface
      ? "from-white/[0.42] via-white/[0.14] to-white/[0.02]"
      : isAppShell
        ? "from-white/[0.38] via-white/[0.16] to-white/[0.04]"
        : "from-white/[0.45] via-white/[0.12] to-transparent";

  const borderGlass = headerOnDarkStudio
    ? "shadow-[inset_0_-12px_24px_-16px_rgba(0,0,0,0.35)]"
    : "shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.55),inset_0_-16px_32px_-20px_rgba(148,163,184,0.12)]";

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <header
      className={`ds-z-floating fixed left-0 right-0 top-0 transition-opacity duration-500 ease-out${
        hideChromeWhenPrinting ? " print:hidden" : ""
      }`}
      style={{ opacity: shellOpacity }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Liquid glass layer */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${glassTint} backdrop-blur-xl backdrop-saturate-[1.08] md:backdrop-blur-2xl ${borderGlass}`}
        aria-hidden
      />
      {/* Specular highlight */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent opacity-70 ${
          headerOnDarkStudio ? "via-white/15" : "via-white/40"
        } to-transparent`}
        aria-hidden
      />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 md:py-5">
        <Link href="/" className="group relative z-10 flex shrink-0 items-center">
          <Image
            src="/rrowm.svg"
            alt="RROWM"
            width={128}
            height={50}
            className={`h-[2.75rem] w-auto max-w-[160px] object-contain object-left transition duration-300 md:h-[3rem] md:max-w-[170px] group-hover:opacity-90 ${
              headerOnDarkStudio
                ? "brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            }`}
            priority
          />
        </Link>

        <div className="relative z-10 hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex md:gap-8">
          <Link href="/registry" className={linkClass}>
            Registry
          </Link>
          <Link
            href="/about"
            className={
              onAbout
                ? `${linkClass} font-semibold underline decoration-neutral-400 underline-offset-4 ${
                    headerOnDarkStudio ? "decoration-white/40" : ""
                  }`
                : linkClass
            }
          >
            About
          </Link>
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
          <Link href="/registry" className={`${linkClass} text-xs`}>
            Registry
          </Link>
          <Link
            href="/about"
            className={
              onAbout
                ? `${linkClass} text-xs font-semibold underline decoration-neutral-400 underline-offset-4`
                : `${linkClass} text-xs`
            }
          >
            About
          </Link>
          {hydrated && session ? (
            <Link href="/account" className={`${subtleClass} text-xs`}>
              Account
            </Link>
          ) : null}
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
          {hydrated && session ? (
            <>
              <Link
                href="/account"
                className={`${subtleClass} hidden whitespace-nowrap sm:inline`}
              >
                My account
              </Link>
              <Link
                href="/studio"
                className={`hidden rounded-xl px-4 py-2 text-sm font-medium rrowm-motion transition-[transform,background-color,box-shadow] sm:inline-flex ${
                  headerOnDarkStudio
                    ? "bg-white text-neutral-950 shadow-[0_12px_36px_-16px_rgba(0,0,0,0.4)] hover:bg-white/95"
                    : "bg-neutral-950 text-white shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] hover:bg-neutral-900"
                }`}
              >
                Studio
              </Link>
              <button
                type="button"
                className={`min-h-[44px] min-w-[44px] rounded-xl px-3 py-2 text-xs font-medium transition sm:min-h-0 sm:min-w-0 sm:px-4 sm:text-sm ${subtleClass}`}
                onClick={async () => {
                  const supabase = getSupabaseBrowserClient();
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href={LOGIN_NEXT}
                className={`${subtleClass} hidden sm:inline`}
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                className={`rounded-xl px-4 py-2 text-sm font-medium shadow-[0_12px_32px_-18px_rgba(0,0,0,0.15)] rrowm-motion transition-[transform,background-color,box-shadow] ${
                  isAuthPage
                    ? "bg-white/70 text-neutral-900 backdrop-blur-md hover:bg-white/90"
                    : "bg-neutral-950 text-white hover:bg-neutral-900"
                }`}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
