"use client";

import { useCallback, useMemo, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useCanNativeShare } from "@/hooks/useCanNativeShare";
import type { ProfileShareContext } from "@/lib/profile-presence-summary";
import {
  buildProfileShareText,
  buildProfileShareTitle,
  profileShareAbsoluteUrl,
} from "@/lib/profile-presence-summary";

type Props = {
  context: ProfileShareContext;
  className?: string;
};

export function ProfileShareControl({ context, className = "" }: Props) {
  const { t } = useLocalePreferences();
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => profileShareAbsoluteUrl(context),
    [context]
  );
  const shareTitle = useMemo(
    () => buildProfileShareTitle(context, t),
    [context, t]
  );
  const shareText = useMemo(
    () => buildProfileShareText(context, t),
    [context, t]
  );

  const copyLink = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt(t("profile.presence.share.copyPrompt"), shareUrl);
        return;
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("profile.presence.share.copyPrompt"), shareUrl);
    }
  }, [shareUrl, t]);

  const shareNative = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      /* cancelled or unavailable */
    }
  }, [shareText, shareTitle, shareUrl]);

  const canNativeShare = useCanNativeShare();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.1] bg-white/80 px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-white"
      >
        {copied
          ? t("profile.presence.share.copied")
          : t("profile.presence.share.copyLink")}
      </button>
      {canNativeShare ? (
        <button
          type="button"
          onClick={() => void shareNative()}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("profile.presence.share.shareProfile")}
        </button>
      ) : null}
    </div>
  );
}
