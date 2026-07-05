"use client";

import { translateActivityMessage } from "@/lib/activity-i18n";
import { useAccountActivityFeed } from "@/hooks/useAccountActivityFeed";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  userId: string;
  /** Max rows — default 10 */
  limit?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  /** When this value changes, the feed refetches (e.g. after catalogue mutations). */
  refreshKey?: number;
  /** compact: gallery sidebar; default: artist/collector shells */
  variant?: "default" | "compact";
};

export function WorkspaceSidebarActivityFeed({
  userId,
  limit = 10,
  emptyMessage,
  loadingMessage,
  refreshKey = 0,
  variant = "default",
}: Props) {
  const { t } = useLocalePreferences();
  const { items, loading } = useAccountActivityFeed(userId, limit, refreshKey);

  const resolvedEmpty = emptyMessage ?? t("studio.shell.noActivity");
  const resolvedLoading = loadingMessage ?? t("studio.activity.loading");

  if (loading) {
    return (
      <p
        className={
          variant === "compact"
            ? "text-[13px] text-neutral-400"
            : "text-xs text-neutral-400"
        }
      >
        {resolvedLoading}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p
        className={
          variant === "compact"
            ? "text-[13px] text-neutral-500"
            : "text-xs text-neutral-500"
        }
      >
        {resolvedEmpty}
      </p>
    );
  }

  const scrollClass =
    items.length > 3
      ? "max-h-[14rem] space-y-3 overflow-y-auto overscroll-y-contain pr-1"
      : "space-y-3";

  return (
    <div className={scrollClass}>
      {items.map((item) => {
        const when = new Date(
          (item.created_at ?? item.at) || Date.now()
        ).toLocaleString();
        const text = translateActivityMessage(item, t);

        if (variant === "compact") {
          return (
            <div key={item.id} className="text-[13px] leading-snug text-neutral-600">
              {text}
            </div>
          );
        }

        return (
          <div key={item.id} className="text-xs text-neutral-600">
            <p>{text}</p>
            <p className="mt-1 text-[10px] text-neutral-400">{when}</p>
          </div>
        );
      })}
    </div>
  );
}
