"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryPremium } from "@/styles/registry-premium";
import { fillMessage } from "@/lib/locale-messages";
import type { RegistryStewardInvitePreview } from "@/lib/registry-steward-invite-preview";
import { fieldRecordHref } from "@/lib/field-nav";

function StewardInviteSeal() {
  return (
    <div
      className="relative mx-auto flex h-24 w-24 items-center justify-center"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full border border-neutral-400/70 bg-[#fafaf8]" />
      <div className="absolute inset-3 rounded-full border border-neutral-600/60" />
      <div className="absolute inset-6 rounded-full border border-neutral-700/50" />
      <span className="relative text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-500">
        RROWM
      </span>
    </div>
  );
}

function formatExpiry(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function StewardInviteAcceptanceView() {
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();
  const token = String(searchParams.get("token") || "").trim();

  const [preview, setPreview] = useState<RegistryStewardInvitePreview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!token || token.length < 32) {
      setLoading(false);
      setPreview(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const res = await fetch(
          `/api/registry/steward-invites/preview?token=${encodeURIComponent(token)}`
        );
        if (!res.ok) {
          if (!cancelled) {
            setPreview(null);
            setFetchError(true);
          }
          return;
        }
        const data = (await res.json()) as RegistryStewardInvitePreview;
        if (!cancelled) setPreview(data);
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <p className="text-sm text-neutral-500">{t("registry.stewardAccept.loading")}</p>
    );
  }

  if (!token || token.length < 32 || fetchError || !preview) {
    return (
      <StatePanel
        title={t("registry.stewardAccept.invalidTitle")}
        body={t("registry.stewardAccept.invalidBody")}
      />
    );
  }

  if (preview.status === "expired") {
    return (
      <StatePanel
        title={t("registry.stewardAccept.expiredTitle")}
        body={t("registry.stewardAccept.expiredBody")}
        registryId={preview.registryId}
      />
    );
  }

  if (preview.status === "accepted") {
    return (
      <StatePanel
        title={t("registry.stewardAccept.acceptedTitle")}
        body={fillMessage(t("registry.stewardAccept.acceptedBody"), {
          title: preview.artworkTitle,
        })}
        registryId={preview.registryId}
      />
    );
  }

  if (preview.status === "invalid") {
    return (
      <StatePanel
        title={t("registry.stewardAccept.invalidTitle")}
        body={t("registry.stewardAccept.invalidBody")}
      />
    );
  }

  const roleLabel =
    preview.inviteKind === "authorship"
      ? t("registry.stewardInvite.kind.authorship")
      : t("registry.stewardInvite.kind.custody");

  const ctaLabel =
    preview.inviteKind === "authorship"
      ? t("registry.stewardAccept.ctaAuthorship")
      : t("registry.stewardAccept.ctaCustody");

  const expiryLine = formatExpiry(preview.expiresAt);

  return (
    <article
      className={`${registryPremium.paper.gradient} overflow-hidden rounded-[1.15rem] border border-neutral-300/70 shadow-[0_36px_88px_-40px_rgba(15,23,42,0.18)]`}
    >
      <div className={`m-3 border border-neutral-300/50 ${registryPremium.frame.inner}`}>
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-neutral-500">
                {t("registry.stewardAccept.kicker")}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
                {t("registry.stewardAccept.heading")}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                {t("registry.stewardAccept.lede")}
              </p>
            </div>
            <StewardInviteSeal />
          </div>

          <section className="mt-10 border-t border-neutral-900/[0.06] pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
              {t("registry.stewardAccept.recordLabel")}
            </p>
            {preview.registryId ? (
              <p className="mt-2 font-mono text-[11px] text-neutral-500">
                {preview.registryId}
              </p>
            ) : null}
            <h2 className="mt-2 font-serif text-2xl font-normal text-neutral-950">
              {preview.artworkTitle}
            </h2>
            {preview.artistNameOnFile ? (
              <p className="mt-2 text-sm text-neutral-600">
                {fillMessage(t("registry.stewardAccept.artistOnFile"), {
                  name: preview.artistNameOnFile,
                })}
              </p>
            ) : null}
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-900/[0.06] bg-white/70 px-4 py-4">
              <p className="text-xs text-neutral-500">
                {t("registry.stewardAccept.invitedBy")}
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {preview.inviterName}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-900/[0.06] bg-white/70 px-4 py-4">
              <p className="text-xs text-neutral-500">
                {t("registry.stewardAccept.invitedAs")}
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">{roleLabel}</p>
              {preview.custodyTransferLabel ? (
                <p className="mt-1 text-xs text-neutral-600">
                  {preview.custodyTransferLabel}
                </p>
              ) : null}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-neutral-900/[0.05] bg-white/60 px-5 py-5">
            <p className="text-sm font-medium text-neutral-800">
              {t("registry.stewardAccept.roleHeading")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {preview.roleExplanation}
            </p>
            <p className="mt-4 text-xs text-neutral-500">
              {fillMessage(t("registry.stewardAccept.recipientLine"), {
                email: preview.recipientEmail,
              })}
              {expiryLine
                ? ` · ${fillMessage(t("registry.stewardAccept.expiresLine"), { date: expiryLine })}`
                : null}
            </p>
          </section>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={preview.targetHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {ctaLabel}
            </Link>
            {preview.registryId ? (
              <Link
                href={fieldRecordHref(preview.registryId)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-neutral-200 bg-white/80 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white"
              >
                {t("registry.stewardAccept.viewRecord")}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatePanel({
  title,
  body,
  registryId,
}: {
  title: string;
  body: string;
  registryId?: string;
}) {
  const { t } = useLocalePreferences();

  return (
    <article
      className={`${registryPremium.paper.gradient} rounded-[1.15rem] border border-neutral-300/70 px-8 py-12 shadow-sm`}
    >
      <StewardInviteSeal />
      <h1 className="mt-8 font-serif text-2xl font-normal text-neutral-950">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">{body}</p>
      {registryId ? (
        <Link
          href={fieldRecordHref(registryId)}
          className="mt-8 inline-flex text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4"
        >
          {t("registry.stewardAccept.viewRecord")}
        </Link>
      ) : null}
    </article>
  );
}
