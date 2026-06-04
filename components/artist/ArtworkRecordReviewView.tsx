"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArchivalAuthorshipContributionModal } from "@/components/Studio/ArchivalAuthorshipContributionModal";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { ArtworkAuthenticationInvitePreview } from "@/lib/artwork-authentication-invite";
import { fillMessage } from "@/lib/locale-messages";
import { translateCanonicalPhrase } from "@/lib/representation-i18n";
import { workspace } from "@/styles/workspace-design";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type Props = {
  preview: ArtworkAuthenticationInvitePreview;
  done: boolean;
  busy: boolean;
  err: string | null;
  contributeOpen: boolean;
  contributeBusy: boolean;
  loginHref: string;
  signupHref: string;
  onAccept: () => void | Promise<void>;
  onOpenContribute: () => void;
  onCloseContribute: () => void;
  onContribute: (payload: {
    authorship_statement: string;
    chronology_contribution: string;
  }) => void | Promise<void>;
};

export function ArtworkRecordReviewView({
  preview,
  done,
  busy,
  err,
  contributeOpen,
  contributeBusy,
  loginHref,
  signupHref,
  onAccept,
  onOpenContribute,
  onCloseContribute,
  onContribute,
}: Props) {
  const router = useRouter();
  const { t } = useLocalePreferences();
  const publicRecordHref = preview.registryId?.trim()
    ? `/artwork/${encodeURIComponent(preview.registryId.trim())}`
    : null;

  const hasArtworkData = Boolean(
    preview.artworkTitle?.trim() &&
      preview.artworkTitle !== t("gallery.artworkAuth.review.workOnFile")
  ) || Boolean(preview.imageUrl);

  if (preview.completed || done) {
    return (
      <>
        <div className="space-y-6">
          <ArtworkRecordCard preview={preview} />
          <StatusShell tone="success">
            <p className="font-serif text-xl text-neutral-950">
              {t("gallery.artworkAuth.review.authenticatedTitle")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {translateCanonicalPhrase("artistAttestationOnFile", t)}.{" "}
              {t("gallery.artworkAuth.review.authenticatedBody")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {publicRecordHref ? (
                <Link
                  href={publicRecordHref}
                  className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {t("gallery.artworkAuth.review.viewPublicRecord")}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={onOpenContribute}
                className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
              >
                {t("gallery.artworkAuth.review.contributeAuthorship")}
              </button>
              <Link
                href="/studio/creative"
                className="rounded-xl px-5 py-2.5 text-sm text-neutral-600 underline"
              >
                {t("gallery.artworkAuth.review.artistStudio")}
              </Link>
            </div>
          </StatusShell>
        </div>
        <ArchivalAuthorshipContributionModal
          isOpen={contributeOpen}
          onClose={onCloseContribute}
          artworkTitle={preview.artworkTitle || ""}
          registryId={preview.registryId}
          institutionName={preview.galleryName}
          busy={contributeBusy}
          onSubmit={onContribute}
        />
      </>
    );
  }

  if (preview.cancelled) {
    return (
      <div className="space-y-6">
        {hasArtworkData ? <ArtworkRecordCard preview={preview} /> : null}
        <StatusShell>
          <p className="text-sm leading-relaxed text-neutral-700">
            {t("gallery.artworkAuth.review.withdrawn")}
          </p>
        </StatusShell>
        <JoinPlatformCTA
          hasArtworkData={hasArtworkData}
          signupHref={signupHref}
          loginHref={loginHref}
          publicRecordHref={publicRecordHref}
        />
      </div>
    );
  }

  if (preview.expired) {
    return (
      <div className="space-y-6">
        {hasArtworkData ? <ArtworkRecordCard preview={preview} /> : null}
        <StatusShell>
          <p className="text-sm leading-relaxed text-neutral-700">
            {t("gallery.artworkAuth.review.expired")}
          </p>
        </StatusShell>
        <JoinPlatformCTA
          hasArtworkData={hasArtworkData}
          signupHref={signupHref}
          loginHref={loginHref}
          publicRecordHref={publicRecordHref}
        />
      </div>
    );
  }

  if (!preview.valid && !hasArtworkData) {
    return (
      <StatusShell>
        <p className="text-sm leading-relaxed text-neutral-700">
          {t("gallery.artworkAuth.review.unavailable")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {t("gallery.artworkAuth.review.joinRegistry")}
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
          >
            {t("gallery.artworkAuth.review.signIn")}
          </Link>
        </div>
      </StatusShell>
    );
  }

  return (
    <div className="space-y-6">
      <ArtworkRecordCard preview={preview} />

      {publicRecordHref ? (
        <p className="text-center text-[13px] text-neutral-600">
          <Link
            href={publicRecordHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4"
          >
            {t("gallery.artworkAuth.review.openPublicRecord")}
          </Link>{" "}
          {t("gallery.artworkAuth.review.openPublicRecordHint")}
        </p>
      ) : null}

      {preview.requiresAuth ? (
        <div
          className={`${workspace.panel.shell} space-y-4 border-amber-900/10 bg-amber-50/30`}
        >
          <p className="text-sm leading-relaxed text-neutral-800">
            {preview.maskedRecipientEmail ? (
              <>
                {fillMessage(t("gallery.artworkAuth.review.signInPrompt"), {
                  email: preview.maskedRecipientEmail,
                })}
              </>
            ) : (
              <>{t("gallery.artworkAuth.review.signInPromptGeneric")}</>
            )}
          </p>
          <p className="text-[12px] text-neutral-600">
            {translateCanonicalPhrase("notApprovalWorkflow", t)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={signupHref}
              className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {t("gallery.artworkAuth.review.joinToReview")}
            </Link>
            <Link
              href={loginHref}
              className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
            >
              {t("gallery.artworkAuth.review.signIn")}
            </Link>
          </div>
        </div>
      ) : preview.valid ? (
        <div className={`${workspace.panel.shell} space-y-4`}>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onAccept()}
            className="w-full rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? t("common.recording") : t("gallery.artworkAuth.review.authenticateCta")}
          </button>
          {publicRecordHref ? (
            <button
              type="button"
              onClick={() => router.push(publicRecordHref)}
              className="w-full rounded-xl border border-neutral-900/10 bg-white px-6 py-3 text-sm font-medium text-neutral-800"
            >
              {t("gallery.artworkAuth.review.viewRecordFirst")}
            </button>
          ) : null}
          <p className="text-center text-[12px] text-neutral-500">
            {translateCanonicalPhrase("notApprovalWorkflow", t)}
          </p>
        </div>
      ) : (
        <JoinPlatformCTA
          hasArtworkData={hasArtworkData}
          signupHref={signupHref}
          loginHref={loginHref}
          publicRecordHref={publicRecordHref}
        />
      )}

      {err ? (
        <p className="text-sm text-red-800" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}

function ArtworkRecordCard({
  preview,
}: {
  preview: ArtworkAuthenticationInvitePreview;
}) {
  const { t } = useLocalePreferences();
  return (
    <>
      <header className={workspace.panel.shell}>
        <InfoTooltip text={t("gallery.artworkAuth.review.cardTooltip")} />
        <h1 className="mt-3 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-3xl">
          {preview.artworkTitle || t("gallery.artworkAuth.review.workOnFile")}
        </h1>
        {preview.registryId ? (
          <p className={`mt-2 ${workspace.type.registryId}`}>
            {preview.registryId}
          </p>
        ) : null}
      </header>

      {preview.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-900/[0.08] bg-white shadow-[0_20px_48px_-28px_rgba(15,23,42,0.15)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.imageUrl}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : null}

      <div
        className={`${workspace.panel.shell} space-y-3 text-sm text-neutral-700`}
      >
        <p>
          <span className="font-medium text-neutral-900">
            {t("gallery.artworkAuth.review.artistLabel")}:
          </span>{" "}
          {preview.artistNameOnFile || t("gallery.fallback.artist")}
        </p>
        <p>
          <span className="font-medium text-neutral-900">
            {t("gallery.artworkAuth.review.institutionLabel")}:
          </span>{" "}
          {preview.galleryName || t("gallery.fallback.gallery")}
        </p>
        <ul className="space-y-1 text-[12px] text-neutral-500">
          <li>
            {preview.institutionOnFile
              ? translateCanonicalPhrase("institutionAttestationOnFile", t)
              : t("gallery.artworkAuth.institutionContinuityPending")}
          </li>
          <li>
            {preview.artistAttestationOnFile
              ? translateCanonicalPhrase("artistAttestationOnFile", t)
              : translateCanonicalPhrase("artistAttestationMayDeepen", t)}
          </li>
        </ul>
        {preview.personalMessage ? (
          <p className="border-t border-neutral-900/[0.06] pt-4 text-[13px] italic text-neutral-600">
            {preview.personalMessage}
          </p>
        ) : null}
      </div>
    </>
  );
}

function JoinPlatformCTA({
  hasArtworkData,
  signupHref,
  loginHref,
  publicRecordHref,
}: {
  hasArtworkData: boolean;
  signupHref: string;
  loginHref: string;
  publicRecordHref: string | null;
}) {
  const { t } = useLocalePreferences();
  if (!hasArtworkData) return null;

  return (
    <div
      className={`${workspace.panel.shell} space-y-4 border-amber-900/10 bg-amber-50/30`}
    >
      <p className="text-sm leading-relaxed text-neutral-800">
        {t("gallery.artworkAuth.review.joinPlatformPrompt")}
      </p>
      <p className="text-[12px] text-neutral-600">
        {translateCanonicalPhrase("notApprovalWorkflow", t)}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={signupHref}
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {t("gallery.artworkAuth.review.joinRegistry")}
        </Link>
        <Link
          href={loginHref}
          className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
        >
          {t("gallery.artworkAuth.review.signIn")}
        </Link>
        {publicRecordHref ? (
          <Link
            href={publicRecordHref}
            className="rounded-xl px-5 py-2.5 text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4"
          >
            {t("gallery.artworkAuth.review.viewPublicRecord")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function StatusShell({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success";
}) {
  const cls =
    tone === "success"
      ? "border-emerald-900/15 bg-emerald-50/50"
      : "border-neutral-200 bg-white";
  return (
    <div className={`rounded-2xl border px-6 py-8 ${cls}`}>{children}</div>
  );
}
