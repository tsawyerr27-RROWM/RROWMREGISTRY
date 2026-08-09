"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

import { NotificationInboxPanel } from "@/components/notifications/NotificationInboxPanel";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useMaxWidth767 } from "@/hooks/useMaxWidth767";

type Props = {
  className?: string;
  tone?: "light" | "dark";
};

function BellIcon({ className }: { className?: string }) {
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

function findScrollRegion(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>("[data-notification-scroll]");
}

export function NotificationInboxBell({ className = "", tone = "light" }: Props) {
  const { t } = useLocalePreferences();
  const pathname = usePathname();
  const menuId = useId();
  const isMobile = useMaxWidth767();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const portalRootRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=1", {
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const payload = (await res.json()) as { unreadCount?: number };
      setUnreadCount(payload.unreadCount ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const updateAnchor = useCallback(() => {
    if (!buttonRef.current) {
      setAnchor(null);
      return;
    }
    setAnchor(buttonRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!open) return;
    void refreshUnreadCount();
  }, [open, refreshUnreadCount]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    updateAnchor();

    const onLayout = () => updateAnchor();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, updateAnchor]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (sheetRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const sheet = sheetRef.current;
    if (!sheet) return;

    const onWheel = (event: WheelEvent) => {
      const scrollEl = findScrollRegion(sheet);
      if (!scrollEl) {
        event.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const delta = event.deltaY;
      const canScroll = scrollHeight > clientHeight + 1;

      event.preventDefault();

      if (!canScroll) return;

      const nextTop = Math.max(
        0,
        Math.min(scrollTop + delta, scrollHeight - clientHeight)
      );
      scrollEl.scrollTop = nextTop;
    };

    sheet.addEventListener("wheel", onWheel, { passive: false });
    return () => sheet.removeEventListener("wheel", onWheel);
  }, [open]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, open]);

  useEffect(() => {
    return () => {
      const portalRoot = portalRootRef.current;
      if (portalRoot?.parentNode) {
        portalRoot.parentNode.removeChild(portalRoot);
      }
      portalRootRef.current = null;
      document.body.style.overflow = "";
    };
  }, []);

  const buttonClass =
    tone === "dark"
      ? "text-white/85 hover:text-white"
      : "text-neutral-600 hover:text-neutral-950";

  const desktopSheetStyle =
    !isMobile && anchor
      ? (() => {
          const margin = 16;
          const gap = 10;
          const spaceBelow = window.innerHeight - anchor.bottom - margin;
          const estimatedHeight = Math.min(512, window.innerHeight - margin * 2);
          const placeAbove = spaceBelow < estimatedHeight && anchor.top > estimatedHeight;
          return {
            top: placeAbove
              ? Math.max(margin, anchor.top - gap - estimatedHeight)
              : Math.min(anchor.bottom + gap, window.innerHeight - margin),
            right: Math.max(margin, window.innerWidth - anchor.right),
            maxHeight: `min(32rem, calc(100dvh - ${margin * 2}px))`,
          } as const;
        })()
      : undefined;

  const portal =
    open && mounted
      ? createPortal(
          <div
            ref={portalRootRef}
            className="command-inbox-portal fixed inset-0 z-[60] md:pointer-events-none"
          >
            <button
              type="button"
              className="command-inbox-backdrop fixed inset-0 bg-[var(--v2-ink)]/28 md:hidden motion-reduce:transition-none"
              aria-label="Close inbox"
              onClick={() => setOpen(false)}
            />

            <div
              id={menuId}
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("notifications.inbox.title")}
              style={desktopSheetStyle}
              className={`command-inbox-sheet pointer-events-auto fixed flex max-h-[min(85dvh,40rem)] w-full flex-col overflow-hidden v2-surface-glass-dark v2-radius-modal p-1.5 shadow-[var(--v2-shadow-cinematic)] motion-reduce:transition-none md:max-h-[min(32rem,calc(100dvh-6rem))] md:w-[min(440px,calc(100vw-2rem))] ${
                isMobile
                  ? "inset-x-0 bottom-0 rounded-b-none rounded-t-[var(--v2-radius-modal)]"
                  : ""
              }`}
            >
              <div className="v2-surface-paper v2-radius-card flex min-h-0 flex-1 flex-col overflow-hidden">
                <NotificationInboxPanel
                  variant="panel"
                  limit={8}
                  className="min-h-0 flex-1 p-4"
                  onUnreadCountChange={setUnreadCount}
                  onNavigate={() => setOpen(false)}
                  onClose={() => setOpen(false)}
                  showClose={isMobile}
                />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="dialog"
          aria-label={
            unreadCount > 0
              ? `${t("nav.inbox")} · ${unreadCount}`
              : t("nav.inbox")
          }
          onClick={() => {
            setOpen((prev) => !prev);
          }}
          className={`rrowm-command-bar-icon-btn v2-motion-hover-subtle relative ${buttonClass}`}
        >
          <BellIcon className="h-[1.125rem] w-[1.125rem]" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--v2-ink)] ring-2 ring-white/90" />
          ) : null}
        </button>
      </div>
      {portal}
    </>
  );
}
