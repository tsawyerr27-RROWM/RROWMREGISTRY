"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import {
  isNotificationUnread,
  resolveNotificationHref,
  type NotificationRow,
} from "@/lib/notifications";
import { STUDIO_INBOX_HREF } from "@/lib/studio-nav/studio-utility-nav";

type Props = {
  variant?: "panel" | "page";
  limit?: number;
  className?: string;
  onUnreadCountChange?: (count: number) => void;
  /** Called when the user follows an inbox link (e.g. close the header dropdown). */
  onNavigate?: () => void;
};

function formatRelativeTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absMs < 60_000) return rtf.format(Math.round(diffMs / 1000), "second");
  if (absMs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (absMs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  if (absMs < 2_592_000_000) return rtf.format(Math.round(diffMs / 86_400_000), "day");

  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function notificationItemClass(unread: boolean): string {
  if (unread) {
    return [
      "group block w-full rounded-2xl border border-amber-200/60 p-3.5 text-left",
      "bg-gradient-to-br from-amber-50/80 via-white to-white",
      "shadow-[0_8px_24px_-16px_rgba(120,90,40,0.2)] ring-1 ring-amber-100/90",
      "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "hover:-translate-y-0.5 hover:border-amber-200/80",
      "hover:shadow-[0_14px_32px_-16px_rgba(120,90,40,0.24)]",
    ].join(" ");
  }

  return [
    "group block w-full rounded-2xl border border-neutral-900/[0.06] p-3.5 text-left",
    "bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_16px_-12px_rgba(15,23,42,0.08)]",
    "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:-translate-y-0.5 hover:border-neutral-900/[0.1]",
    "hover:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.12)]",
  ].join(" ");
}

export function NotificationInboxPanel({
  variant = "panel",
  limit = 12,
  className = "",
  onUnreadCountChange,
  onNavigate,
}: Props) {
  const router = useRouter();
  const { t, region } = useLocalePreferences();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications?limit=${limit}`, {
        credentials: "same-origin",
      });
      const payload = (await res.json()) as {
        notifications?: NotificationRow[];
        unreadCount?: number;
        error?: string;
      };
      if (!res.ok) {
        setError(payload.error ?? t("notifications.inbox.loadError"));
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      const next = payload.notifications ?? [];
      const count = payload.unreadCount ?? 0;
      setNotifications(next);
      setUnreadCount(count);
    } catch {
      setError(t("notifications.inbox.loadError"));
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [limit, t]);

  const updateScrollFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setFadeTop(false);
      setFadeBottom(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 2;
    setFadeTop(canScroll && scrollTop > 4);
    setFadeBottom(canScroll && scrollTop + clientHeight < scrollHeight - 4);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading) return;
    onUnreadCountChange?.(unreadCount);
  }, [loading, onUnreadCountChange, unreadCount]);

  useEffect(() => {
    if (variant !== "panel") return;
    updateScrollFades();
  }, [variant, loading, error, notifications.length, updateScrollFades]);

  const markRead = useCallback(
    async (notification: NotificationRow) => {
      if (!isNotificationUnread(notification)) return notification;

      const res = await fetch(
        `/api/notifications/${encodeURIComponent(notification.id)}/read`,
        { method: "PATCH", credentials: "same-origin" }
      );
      if (!res.ok) return notification;

      const payload = (await res.json()) as { notification?: NotificationRow };
      const updated = payload.notification ?? {
        ...notification,
        read_at: new Date().toISOString(),
      };

      setNotifications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return updated;
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const readAt = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: item.read_at ?? readAt }))
      );
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount]);

  const renderNotificationItem = (notification: NotificationRow) => {
    const href = resolveNotificationHref(notification);
    const unread = isNotificationUnread(notification);
    const timeLabel = formatRelativeTime(notification.created_at, region.locale);

    const content = (
      <div className="flex items-start gap-3">
        <span
          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
            unread
              ? "bg-amber-700/80 shadow-[0_0_0_3px_rgba(180,130,60,0.12)]"
              : "bg-transparent"
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-serif text-[15px] font-normal leading-snug text-neutral-950">
              {notification.title}
            </p>
            {timeLabel ? (
              <time
                dateTime={notification.created_at}
                className="text-[11px] tabular-nums text-neutral-400"
              >
                {timeLabel}
              </time>
            ) : null}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">
            {notification.body}
          </p>
        </div>
      </div>
    );

    return (
      <li key={notification.id}>
        {href ? (
          <Link
            href={href}
            onClick={() => {
              void markRead(notification);
              onNavigate?.();
            }}
            className={notificationItemClass(unread)}
          >
            {content}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              void markRead(notification);
            }}
            className={notificationItemClass(unread)}
          >
            {content}
          </button>
        )}
      </li>
    );
  };

  const listBody = loading ? (
    <p className="px-1 text-sm text-neutral-500">{t("common.processing")}</p>
  ) : error ? (
    <p className="px-1 text-sm text-neutral-600">{error}</p>
  ) : notifications.length === 0 ? (
    <p className="px-1 text-sm leading-relaxed text-neutral-500">
      {t("notifications.inbox.empty")}
    </p>
  ) : (
    <ul className="space-y-2.5 pr-0.5">{notifications.map(renderNotificationItem)}</ul>
  );

  const scrollRegionClass =
    "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(120,90,40,0.22)_transparent]";

  if (variant === "page") {
    return (
      <section
        className={`rounded-[1.25rem] border border-neutral-900/[0.07] bg-[#fafaf8]/90 p-6 md:p-9 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]">
              {t("notifications.inbox.title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {t("notifications.inbox.intro")}
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={markingAll}
              className="shrink-0 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-500 disabled:opacity-50"
            >
              {markingAll
                ? t("common.processing")
                : t("notifications.inbox.markAllRead")}
            </button>
          ) : null}
        </div>
        <div className="mt-8">{listBody}</div>
      </section>
    );
  }

  return (
    <section
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}
    >
      <header className="relative shrink-0 pb-3">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:rgba(185,145,90,0.38)] to-transparent"
          aria-hidden
        />
        <div className="flex items-start justify-between gap-4 pt-0.5">
          <div>
            <h2 className="font-serif text-lg font-normal tracking-tight text-neutral-950">
              {t("notifications.inbox.title")}
            </h2>
            {unreadCount > 0 ? (
              <p className="mt-1 text-[11px] font-medium text-amber-900/70">
                {unreadCount} unread
              </p>
            ) : null}
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={markingAll}
              className="shrink-0 rounded-full border border-neutral-900/[0.08] bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition hover:border-neutral-900/[0.12] hover:bg-white disabled:opacity-50"
            >
              {markingAll
                ? t("common.processing")
                : t("notifications.inbox.markAllRead")}
            </button>
          ) : null}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {fadeTop ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-7 bg-gradient-to-b from-[#f8f4ec] via-[#f8f4ec]/80 to-transparent"
            aria-hidden
          />
        ) : null}
        <div
          ref={scrollRef}
          data-notification-scroll
          onScroll={updateScrollFades}
          className={`${scrollRegionClass} px-0.5 py-0.5`}
        >
          {listBody}
        </div>
        {fadeBottom ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-7 bg-gradient-to-t from-[#f3efe6] via-[#f3efe6]/80 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>

      {notifications.length > 0 ? (
        <footer className="relative z-[2] mt-3 shrink-0 border-t border-[color:rgba(185,145,90,0.12)] pt-3">
          <Link
            href={STUDIO_INBOX_HREF}
            onClick={(event) => {
              event.preventDefault();
              deferredRouterPush(router, STUDIO_INBOX_HREF);
              onNavigate?.();
            }}
            className="inline-flex items-center text-[13px] font-medium text-neutral-800 underline decoration-[color:rgba(185,145,90,0.35)] underline-offset-4 transition hover:text-neutral-950 hover:decoration-[color:rgba(185,145,90,0.55)]"
          >
            {t("notifications.inbox.viewAll")}
          </Link>
        </footer>
      ) : null}
    </section>
  );
}
