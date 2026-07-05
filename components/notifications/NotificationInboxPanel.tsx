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
import { registryV2 } from "@/styles/registry-v2";

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
        className={`${semanticStampClass("certification")} mt-0.5 shrink-0 scale-[0.78] origin-left ${
          unread ? "" : "opacity-70"
        }`}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={`mt-1.5 shrink-0 ${semanticDotClass(semanticEvent)} ${
        unread ? "" : "opacity-65"
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
    "group block w-full border-l-2 py-3 pl-3 pr-1 text-left",
    accent,
    "transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
    unread ? "bg-[var(--v2-paper-bone)]/35" : "opacity-90",
    "hover:bg-[var(--v2-paper-bone)]/55",
  ].join(" ");
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
      <div className="flex items-start gap-2.5">
        {notificationSignalMarker(semanticEvent, unread)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p
              className={`font-serif text-[15px] leading-snug tracking-[-0.01em] text-[var(--v2-ink)] ${
                unread ? "font-medium" : "font-normal"
              }`}
            >
              {notification.title}
            </p>
            {timeLabel ? (
              <time
                dateTime={notification.created_at}
                className={`${registryV2.type.monoId} shrink-0 text-[10px] text-[var(--v2-ink-muted)]`}
              >
                {timeLabel}
              </time>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--v2-ink-soft)]">
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
      <section key={section}>
        <h3 className={`${registryV2.type.metaLabel} mb-2 text-[var(--v2-ink-muted)]`}>
          {t(labelKey)}
        </h3>
        <ul className="divide-y divide-[var(--v2-border)] border-y border-[var(--v2-border)]">
          {items.map(renderNotificationItem)}
        </ul>
      </section>
    );
  };

  const grouped = groupNotificationsByInboxSection(notifications);

  const listBody = loading ? (
    <p className="text-sm text-[var(--v2-ink-muted)]">{t("common.processing")}</p>
  ) : error ? (
    <p className="text-sm text-[var(--v2-ink-soft)]">{error}</p>
  ) : notifications.length === 0 ? (
    <p className="py-6 text-center text-sm leading-relaxed text-[var(--v2-ink-muted)]">
      {t("notifications.inbox.empty")}
    </p>
  ) : (
    <div className="space-y-5">
      {NOTIFICATION_INBOX_SECTIONS.map((section) =>
        renderSection(section, grouped[section])
      )}
    </div>
  );

  const scrollRegionClass =
    "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(120,90,40,0.18)_transparent]";

  if (variant === "page") {
    return (
      <section
        className={`field-explorer-hero ${registryV2.surface.filingMajor} p-6 md:p-9 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`${registryV2.type.sectionTitle} text-[1.75rem] md:text-[1.85rem]`}>
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
              className={`${registryV2.type.monoId} shrink-0 text-[10px] text-[var(--v2-ink-muted)] underline decoration-[var(--v2-border)] underline-offset-4 transition hover:text-[var(--v2-ink)] disabled:opacity-50 motion-reduce:transition-none`}
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
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}
    >
      <header className="relative z-[2] shrink-0 border-b border-[var(--v2-border)] pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`${registryV2.type.metaLabel} text-[var(--v2-ink-muted)]`}>
              {t("nav.inbox")}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h2
                className={`${registryV2.type.sectionTitle} min-w-0 text-[1.35rem] leading-[1.08] md:text-[1.5rem]`}
              >
                {t("notifications.inbox.title")}
              </h2>
              {unreadCount > 0 ? (
                <span className="studio-execution-stamp studio-execution-stamp--active tabular-nums">
                  {unreadCount}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={markingAll}
                className={`${registryV2.type.monoId} hidden min-h-[44px] items-center px-2 text-[10px] text-[var(--v2-ink-muted)] underline decoration-[var(--v2-border)] underline-offset-4 transition hover:text-[var(--v2-ink)] disabled:opacity-50 motion-reduce:transition-none sm:inline-flex md:min-h-0`}
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
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--v2-ink-muted)] transition hover:bg-[var(--v2-paper-bone)]/60 hover:text-[var(--v2-ink)] motion-reduce:transition-none"
                aria-label={t("common.cancel")}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            disabled={markingAll}
            className={`${registryV2.type.monoId} mt-2 min-h-[44px] text-left text-[10px] text-[var(--v2-ink-muted)] underline decoration-[var(--v2-border)] underline-offset-4 transition hover:text-[var(--v2-ink)] disabled:opacity-50 motion-reduce:transition-none sm:hidden`}
          >
            {markingAll
              ? t("common.processing")
              : t("notifications.inbox.markAllRead")}
          </button>
        ) : null}
      </header>

      {actionError ? (
        <p className="relative z-[2] shrink-0 pt-2 text-xs leading-relaxed text-red-800/90">
          {actionError}
        </p>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        {fadeTop ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-5 bg-gradient-to-b from-[var(--v2-paper-bone,#f4efe6)] to-transparent"
            aria-hidden
          />
        ) : null}
        <div
          ref={scrollRef}
          data-notification-scroll
          onScroll={updateScrollFades}
          className={scrollRegionClass}
        >
          {listBody}
        </div>
        {fadeBottom ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-5 bg-gradient-to-t from-[var(--v2-paper-bone,#f4efe6)] to-transparent"
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
            className={`${registryV2.type.monoId} inline-flex min-h-[44px] items-center text-[10px] text-[var(--v2-ink-soft)] underline decoration-[var(--v2-border)] underline-offset-4 transition hover:text-[var(--v2-ink)] motion-reduce:transition-none sm:min-h-0`}
          >
            {t("notifications.inbox.viewAll")}
          </Link>
        </footer>
      ) : null}
    </section>
  );
}
