"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import {
  groupNotificationsByInboxSection,
  NOTIFICATION_INBOX_SECTIONS,
  NOTIFICATION_INBOX_SECTION_LABEL_KEYS,
  type NotificationInboxSection,
} from "@/lib/notification-inbox-sections";
import {
  isNotificationUnread,
  resolveNotificationHref,
  type NotificationRow,
} from "@/lib/notifications";
import {
  notificationSemanticEvent,
  semanticAccentBorderClass,
  semanticDotClass,
  semanticStampClass,
  type RegistrySemanticEvent,
} from "@/lib/registry-semantic-signals";
import { STUDIO_INBOX_HREF } from "@/lib/studio-nav/studio-utility-nav";
import type { MessageKey } from "@/lib/locale-messages";

type Props = {
  variant?: "panel" | "page";
  limit?: number;
  className?: string;
  onUnreadCountChange?: (count: number) => void;
  /** Called when the user follows an inbox link (e.g. close the header dropdown). */
  onNavigate?: () => void;
  onClose?: () => void;
  showClose?: boolean;
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

function notificationSignalMarker(
  semanticEvent: RegistrySemanticEvent | null,
  unread: boolean
): ReactNode {
  if (semanticEvent === "certification") {
    return (
      <span
        className={`${semanticStampClass("certification")} mt-1 shrink-0 scale-[0.82] origin-left ${
          unread ? "" : "opacity-75"
        }`}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={`mt-2 shrink-0 ${semanticDotClass(semanticEvent)} ${
        unread ? "" : "opacity-70"
      }`}
      aria-hidden
    />
  );
}

function notificationItemClass(
  unread: boolean,
  semanticEvent: RegistrySemanticEvent | null
): string {
  const accent = semanticEvent
    ? semanticAccentBorderClass(semanticEvent)
    : "border-l-[var(--v2-border)]";

  return [
    "group block w-full border border-[var(--v2-border)] border-l-2 bg-white/95 px-3.5 py-3 text-left",
    accent,
    "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
    "hover:border-[var(--v2-border-strong)] hover:bg-white",
    unread
      ? "shadow-[0_8px_20px_-16px_rgba(15,23,42,0.14)] ring-1 ring-[var(--v2-border)]"
      : "opacity-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]",
  ].join(" ");
}

export function NotificationInboxPanel({
  variant = "panel",
  limit = 12,
  className = "",
  onUnreadCountChange,
  onNavigate,
  onClose,
  showClose = false,
}: Props) {
  const router = useRouter();
  const { t, region } = useLocalePreferences();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setActionError(payload.error ?? t("notifications.inbox.markReadError"));
        return notification;
      }

      const payload = (await res.json()) as { notification?: NotificationRow };
      const updated = payload.notification ?? {
        ...notification,
        read_at: new Date().toISOString(),
      };

      setNotifications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setActionError(null);
      return updated;
    },
    [t]
  );

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    setActionError(null);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setActionError(payload.error ?? t("notifications.inbox.markAllReadError"));
        return;
      }
      const readAt = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: item.read_at ?? readAt }))
      );
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, t, unreadCount]);

  const renderNotificationItem = (notification: NotificationRow) => {
    const href = resolveNotificationHref(notification);
    const unread = isNotificationUnread(notification);
    const timeLabel = formatRelativeTime(notification.created_at, region.locale);
    const semanticEvent = notificationSemanticEvent(notification.type);

    const content = (
      <div className="flex items-start gap-3">
        {notificationSignalMarker(semanticEvent, unread)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p
              className={`v2-type-display text-[15px] leading-snug text-[var(--v2-ink)] ${
                unread ? "font-medium" : "font-normal"
              }`}
            >
              {notification.title}
            </p>
            {timeLabel ? (
              <time
                dateTime={notification.created_at}
                className="v2-type-mono text-[10px] tabular-nums text-[var(--v2-ink-muted)]"
              >
                {timeLabel}
              </time>
            ) : null}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--v2-ink-soft)]">
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
            className={notificationItemClass(unread, semanticEvent)}
          >
            {content}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              void markRead(notification);
            }}
            className={notificationItemClass(unread, semanticEvent)}
          >
            {content}
          </button>
        )}
      </li>
    );
  };

  const renderSection = (section: NotificationInboxSection, items: NotificationRow[]) => {
    if (items.length === 0) return null;

    const labelKey = NOTIFICATION_INBOX_SECTION_LABEL_KEYS[
      section
    ] as MessageKey;

    return (
      <section key={section} className="space-y-2">
        <h3 className="v2-type-label px-0.5 text-[10px] tracking-[0.2em] text-[var(--v2-ink-muted)]">
          {t(labelKey)}
        </h3>
        <ul className="space-y-2">{items.map(renderNotificationItem)}</ul>
      </section>
    );
  };

  const grouped = groupNotificationsByInboxSection(notifications);

  const listBody = loading ? (
    <p className="px-0.5 text-sm text-[var(--v2-ink-muted)]">{t("common.processing")}</p>
  ) : error ? (
    <p className="px-0.5 text-sm text-[var(--v2-ink-soft)]">{error}</p>
  ) : notifications.length === 0 ? (
    <p className="px-0.5 text-sm leading-relaxed text-[var(--v2-ink-muted)]">
      {t("notifications.inbox.empty")}
    </p>
  ) : (
    <div className="space-y-5 pr-0.5">
      {NOTIFICATION_INBOX_SECTIONS.map((section) =>
        renderSection(section, grouped[section])
      )}
    </div>
  );

  const scrollRegionClass =
    "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(120,90,40,0.22)_transparent]";

  if (variant === "page") {
    return (
      <section
        className={`rounded-[1.25rem] border border-[var(--v2-border)] v2-surface-paper p-6 md:p-9 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="v2-type-display text-2xl font-normal tracking-tight text-[var(--v2-ink)] md:text-[1.75rem]">
              {t("notifications.inbox.title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--v2-ink-soft)]">
              {t("notifications.inbox.intro")}
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={markingAll}
              className="v2-type-mono shrink-0 text-[10px] text-[var(--v2-ink-muted)] underline decoration-[var(--v2-border)] underline-offset-4 transition hover:text-[var(--v2-ink)] disabled:opacity-50 motion-reduce:transition-none"
            >
              {markingAll
                ? t("common.processing")
                : t("notifications.inbox.markAllRead")}
            </button>
          ) : null}
        </div>
        {actionError ? (
          <p className="mt-3 text-xs leading-relaxed text-red-800/90">{actionError}</p>
        ) : null}
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
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--v2-cobalt-signal-dim)] to-transparent opacity-70"
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3 pt-0.5">
          <div className="min-w-0">
            <p className="v2-type-label text-[10px] tracking-[0.2em] text-[var(--v2-ink-muted)]">
              Command inbox
            </p>
            <h2 className="v2-type-display mt-1 text-lg font-normal tracking-tight text-[var(--v2-ink)]">
              {t("notifications.inbox.title")}
            </h2>
            {unreadCount > 0 ? (
              <p className="mt-1 v2-type-mono text-[10px] text-[var(--v2-ink-muted)]">
                {unreadCount} unread
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={markingAll}
                className="v2-type-mono rounded-full border border-[var(--v2-border)] bg-white/90 px-2.5 py-1 text-[10px] text-[var(--v2-ink-soft)] transition hover:border-[var(--v2-border-strong)] hover:text-[var(--v2-ink)] disabled:opacity-50 motion-reduce:transition-none"
              >
                {markingAll
                  ? t("common.processing")
                  : t("notifications.inbox.markAllRead")}
              </button>
            ) : null}
            {showClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--v2-border)] text-[var(--v2-ink-muted)] transition hover:text-[var(--v2-ink)] motion-reduce:transition-none"
                aria-label="Close inbox"
              >
                <span aria-hidden className="text-lg leading-none">
                  ×
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {actionError ? (
        <p className="shrink-0 px-0.5 pb-2 text-xs leading-relaxed text-red-800/90">
          {actionError}
        </p>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {fadeTop ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-6 bg-gradient-to-b from-white via-white/85 to-transparent"
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
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-6 bg-gradient-to-t from-white via-white/85 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>

      {notifications.length > 0 ? (
        <footer className="relative z-[2] mt-3 shrink-0 border-t border-[var(--v2-border)] pt-3">
          <Link
            href={STUDIO_INBOX_HREF}
            onClick={(event) => {
              event.preventDefault();
              deferredRouterPush(router, STUDIO_INBOX_HREF);
              onNavigate?.();
            }}
            className="v2-type-mono inline-flex items-center text-[10px] text-[var(--v2-ink-soft)] underline decoration-[var(--v2-border)] underline-offset-4 transition hover:text-[var(--v2-ink)] motion-reduce:transition-none"
          >
            {t("notifications.inbox.viewAll")}
          </Link>
        </footer>
      ) : null}
    </section>
  );
}
