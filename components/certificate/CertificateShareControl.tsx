"use client";

import { useCallback, useMemo, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useCanNativeShare } from "@/hooks/useCanNativeShare";
import {
  buildCertificateShareText,
  buildCertificateShareTitle,
  certificateShareAbsoluteUrl,
  certificateShareDownloadImagePath,
  type CertificateShareContext,
} from "@/lib/certificate-share";
import { triggerSameOriginDownload } from "@/lib/trigger-same-origin-download";

type Props = {
  context: CertificateShareContext;
  className?: string;
};

export function CertificateShareControl({ context, className = "" }: Props) {
  const { t } = useLocalePreferences();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = useMemo(
    () => certificateShareAbsoluteUrl(context.registryId),
    [context.registryId]
  );
  const shareImageUrl = useMemo(
    () => certificateShareDownloadImagePath(context.registryId),
    [context.registryId]
  );
  const shareTitle = useMemo(
    () => buildCertificateShareTitle(context, t),
    [context, t]
  );
  const shareText = useMemo(
    () => buildCertificateShareText(context, t),
    [context, t]
  );

  const copyLink = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt(t("certificate.share.copyPrompt"), shareUrl);
        return;
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("certificate.share.copyPrompt"), shareUrl);
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
    const filename = `rrowm-certificate-${context.registryId}.png`;
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
          ? t("certificate.share.copied")
          : t("certificate.share.copyLink")}
      </button>
      {canNativeShare ? (
        <button
          type="button"
          onClick={() => void shareNative()}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("certificate.share.shareCertificate")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void downloadShareImage()}
        disabled={downloading}
        className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-white disabled:opacity-60"
      >
        {downloading
          ? t("certificate.share.downloadingImage")
          : t("certificate.share.downloadImage")}
      </button>
    </div>
  );
}
