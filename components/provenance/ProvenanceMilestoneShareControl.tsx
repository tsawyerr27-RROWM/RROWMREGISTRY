"use client";

import { useCallback, useMemo, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useCanNativeShare } from "@/hooks/useCanNativeShare";
import {
  buildProvenanceMilestoneShareText,
  buildProvenanceMilestoneShareTitle,
  buildProvenanceMilestoneShareUrl,
  provenanceMilestoneShareOgImageUrl,
  type ProvenanceMilestoneShareContext,
} from "@/lib/provenance-share";

type Props = {
  context: ProvenanceMilestoneShareContext;
  className?: string;
};

export function ProvenanceMilestoneShareControl({ context, className = "" }: Props) {
  const { t } = useLocalePreferences();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = useMemo(
    () => buildProvenanceMilestoneShareUrl(context.registryId, context.eventId),
    [context.eventId, context.registryId]
  );
  const shareImageUrl = useMemo(
    () =>
      provenanceMilestoneShareOgImageUrl(context.registryId, context.eventId),
    [context.eventId, context.registryId]
  );
  const shareTitle = useMemo(
    () => buildProvenanceMilestoneShareTitle(context, t),
    [context, t]
  );
  const shareText = useMemo(
    () => buildProvenanceMilestoneShareText(context, t),
    [context, t]
  );

  const copyLink = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt(t("provenance.share.copyPrompt"), shareUrl);
        return;
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("provenance.share.copyPrompt"), shareUrl);
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

  const downloadShareImage = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(shareImageUrl);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `rrowm-provenance-${context.registryId}-${context.eventId}.png`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(shareImageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }, [context.eventId, context.registryId, shareImageUrl]);

  const canNativeShare = useCanNativeShare();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex min-h-[40px] items-center rounded-xl border border-neutral-900/[0.1] bg-white/85 px-3.5 py-2 text-xs font-medium text-neutral-900 shadow-sm transition hover:bg-white"
      >
        {copied ? t("provenance.share.copied") : t("provenance.share.copyLink")}
      </button>
      {canNativeShare ? (
        <button
          type="button"
          onClick={() => void shareNative()}
          className="inline-flex min-h-[40px] items-center rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
        >
          {t("provenance.share.shareMilestone")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void downloadShareImage()}
        disabled={downloading}
        className="inline-flex min-h-[40px] items-center rounded-xl border border-neutral-900/[0.08] bg-white/75 px-3.5 py-2 text-xs font-medium text-neutral-800 transition hover:bg-white disabled:opacity-60"
      >
        {downloading
          ? t("provenance.share.downloadingImage")
          : t("provenance.share.downloadImage")}
      </button>
    </div>
  );
}
