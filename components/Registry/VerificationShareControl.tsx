"use client";

import { useCallback, useMemo, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useCanNativeShare } from "@/hooks/useCanNativeShare";
import { triggerSameOriginDownload } from "@/lib/trigger-same-origin-download";
import {
  buildVerificationShareText,
  buildVerificationShareTitle,
  buildVerificationShareUrl,
  verificationShareDownloadImagePath,
  type VerificationShareContext,
} from "@/lib/verification-share";

type Props = {
  context: VerificationShareContext;
  className?: string;
};

export function VerificationShareControl({ context, className = "" }: Props) {
  const { t } = useLocalePreferences();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = useMemo(
    () => buildVerificationShareUrl(context.registryId),
    [context.registryId]
  );
  const shareImageUrl = useMemo(
    () => verificationShareDownloadImagePath(context.registryId),
    [context.registryId]
  );
  const shareTitle = useMemo(
    () => buildVerificationShareTitle(context, t),
    [context, t]
  );
  const shareText = useMemo(
    () => buildVerificationShareText(context, t),
    [context, t]
  );

  const copyLink = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt(t("verification.share.copyPrompt"), shareUrl);
        return;
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("verification.share.copyPrompt"), shareUrl);
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

  const downloadShareImage = useCallback(() => {
    setDownloading(true);
    const filename = `rrowm-verification-${context.registryId}.png`;
    try {
      triggerSameOriginDownload(shareImageUrl, filename);
    } catch {
      window.open(shareImageUrl, "_blank", "noopener,noreferrer");
    } finally {
      window.setTimeout(() => setDownloading(false), 600);
    }
  }, [context.registryId, shareImageUrl]);

  const canNativeShare = useCanNativeShare();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.1] bg-white/80 px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-white"
      >
        {copied
          ? t("verification.share.copied")
          : t("verification.share.copyLink")}
      </button>
      {canNativeShare ? (
        <button
          type="button"
          onClick={() => void shareNative()}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("verification.share.shareVerification")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void downloadShareImage()}
        disabled={downloading}
        className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-white disabled:opacity-60"
      >
        {downloading
          ? t("verification.share.downloadingImage")
          : t("verification.share.downloadImage")}
      </button>
    </div>
  );
}
