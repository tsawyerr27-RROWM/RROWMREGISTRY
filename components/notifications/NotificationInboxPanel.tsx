"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  isNotificationUnread,
  resolveNotificationHref,
  type NotificationRow,
} from "@/lib/notifications";

type Props = {
  variant?: "panel" | "page";
  limit?: number;
  className?: string;
  onUnreadCountChange?: (count: number) => void;
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

export function NotificationInboxPanel({
  variant = "panel",
  limit = 12,
  className = "",
  onUnreadCountChange,
}: Props) {
  const { t, region } = useLocalePreferences();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

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
        onUnreadCountChange?.(0);
        return;
      }
      const next = payload.notifications ?? [];
      const count = payload.unreadCount ?? 0;
      setNotifications(next);
      setUnreadCount(count);
      onUnreadCountChange?.(count);
    } catch {
      setError(t("notifications.inbox.loadError"));
      setNotifications([]);
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [limit, onUnreadCountChange, t]);

  useEffect(() => {
    void load();
  }, [load]);

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
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        onUnreadCountChange?.(next);
        return next;
      });
      return updated;
    },
    [onUnreadCountChange]
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
      onUnreadCountChange?.(0);
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, onUnreadCountChange, unreadCount]);

  const shellClass =
    variant === "page"
      ? "rounded-[1.25rem] border border-neutral-900/[0.07] bg-[#fafaf8]/90 p-6 md:p-9"
      : "";

  return (
    <section className={`${shellClass} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className={
              variant === "page"
                ? "font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]"
                : "font-serif text-lg font-normal tracking-tight text-neutral-950"
            }
          >
            {t("notifications.inbox.title")}
          </h2>
          {variant === "page" ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {t("notifications.inbox.intro")}
            </p>
          ) : null}
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

      <div className={variant === "page" ? "mt-8" : "mt-4"}>
        {loading ? (
          <p className="text-sm text-neutral-500">{t("common.processing")}</p>
        ) : error ? (
          <p className="text-sm text-neutral-600">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm leading-relaxed text-neutral-500">
            {t("notifications.inbox.empty")}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-900/[0.06]">
            {notifications.map((notification) => {
              const href = resolveNotificationHref(notification);
              const unread = isNotificationUnread(notification);
              const timeLabel = formatRelativeTime(
                notification.created_at,
                region.locale
              );

              const content = (
                <>
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                        unread ? "bg-neutral-700" : "bg-transparent"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="font-serif text-base font-normal text-neutral-950">
                          {notification.title}
                        </p>
                        {timeLabel ? (
                          <time
                            dateTime={notification.created_at}
                            className="text-[11px] text-neutral-400"
                          >
                            {timeLabel}
                          </time>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </>
              );

              return (
                <li key={notification.id} className="py-4 first:pt-0 last:pb-0">
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => {
                        void markRead(notification);
                      }}
                      className="block rounded-xl transition hover:bg-neutral-900/[0.02] -mx-2 px-2 py-1"
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void markRead(notification);
                      }}
                      className="block w-full rounded-xl text-left transition hover:bg-neutral-900/[0.02] -mx-2 px-2 py-1"
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {variant === "panel" && notifications.length > 0 ? (
        <div className="mt-4 border-t border-neutral-900/[0.06] pt-4">
          <Link
            href="/studio/inbox"
            className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-500"
          >
            {t("notifications.inbox.viewAll")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
