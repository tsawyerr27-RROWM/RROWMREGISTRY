"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { NotificationInboxPanel } from "@/components/notifications/NotificationInboxPanel";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

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
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    const onWheel = (event: WheelEvent) => {
      const scrollEl = findScrollRegion(dropdown);
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

    dropdown.addEventListener("wheel", onWheel, { passive: false });
    return () => dropdown.removeEventListener("wheel", onWheel);
  }, [open]);

  const buttonClass =
    tone === "dark"
      ? "text-white/85 hover:text-white"
      : "text-neutral-600 hover:text-neutral-950";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={
          unreadCount > 0
            ? `${t("nav.inbox")} · ${unreadCount}`
            : t("nav.inbox")
        }
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className={`relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition sm:min-h-0 sm:min-w-0 sm:px-2 ${buttonClass}`}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-2 h-2 w-2 rounded-full bg-amber-800 ring-2 ring-white/90 sm:right-0.5 sm:top-1.5" />
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          ref={dropdownRef}
          className="ds-z-floating absolute right-0 top-[calc(100%+0.625rem)] z-50 flex max-h-[min(28rem,calc(100dvh-5.5rem))] w-[min(22.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.5rem] border border-[color:rgba(185,145,90,0.16)] bg-gradient-to-b from-[#fffcf7] via-[#faf6ef] to-[#f3efe6] p-4 shadow-[0_28px_72px_-28px_rgba(40,25,10,0.22),0_8px_24px_-12px_rgba(120,90,40,0.12),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl"
        >
          <NotificationInboxPanel
            variant="panel"
            limit={8}
            className="min-h-0 flex-1"
            onUnreadCountChange={setUnreadCount}
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
