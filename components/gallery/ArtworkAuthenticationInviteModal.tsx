"use client";

import { useEffect, useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import { translateCanonicalPhrase } from "@/lib/representation-i18n";
import { workspace } from "@/styles/workspace-design";

export type ArtworkAuthInviteTarget = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  catalogue_artist_name?: string | null;
  artist_id?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  artwork: ArtworkAuthInviteTarget | null;
  artistNameOnFile: string;
  institutionOnFile?: boolean;
  artistAttestationOnFile?: boolean;
  defaultEmail?: string;
  isAdmin: boolean;
  onSent?: () => void;
};

const fieldClass = workspace.modal.field;
const labelClass = "mb-2 block text-sm font-semibold text-neutral-600";

export function ArtworkAuthenticationInviteModal({
  isOpen,
  onClose,
  artwork,
  artistNameOnFile,
  institutionOnFile = true,
  artistAttestationOnFile = false,
  defaultEmail = "",
  isAdmin,
  onSent,
}: Props) {
  const { t, region } = useLocalePreferences();
  const [email, setEmail] = useState(defaultEmail);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setNote("");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, defaultEmail, artwork?.id]);

  if (!artwork) return null;

  const title =
    (artwork.title || "").trim() || t("gallery.participation.untitledWork");
  const reg = artwork.registry_id?.trim() || "";

  const submit = async () => {
    if (!isAdmin) {
      setError(t("gallery.artworkAuth.adminOnlyError"));
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("gallery.artworkAuth.invalidEmail"));
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/artwork-authentication/send-invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artwork_id: artwork.id,
          artist_email: trimmed,
          artist_name: artistNameOnFile,
          message: note.trim() || null,
          lang: region.lang,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
        emailDeliveryError?: string;
      };
      if (!res.ok) {
        setError(j.error || t("gallery.artworkAuth.sendFailed"));
        return;
      }
      if (j.emailDeliveryError) {
        setSuccess(
          `${fillMessage(t("gallery.artworkAuth.inviteOnFile"), { email: trimmed })} ${j.emailDeliveryError}`
        );
      } else {
        setSuccess(
          j.emailSent
            ? fillMessage(t("gallery.artworkAuth.inviteSent"), { email: trimmed })
            : fillMessage(t("gallery.artworkAuth.inviteOnFile"), { email: trimmed })
        );
      }
      onSent?.();
    } catch {
      setError(t("gallery.artworkAuth.networkError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      tone="light"
      panelClassName="max-h-[90vh] w-full max-w-xl overflow-auto"
    >
      <div className="p-8 md:p-10">
        <InfoTooltip text={t("gallery.artworkAuth.modalLead")} />
        <h2 className="mt-2 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
          {t("gallery.artworkAuth.modalTitle")}
        </h2>

        <div className="mt-6 flex gap-4 rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 p-4">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200/80 ring-1 ring-neutral-900/[0.06]">
            {artwork.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artwork.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">{title}</p>
            {reg ? (
              <p className="mt-0.5 font-mono text-[10px] text-neutral-500">{reg}</p>
            ) : null}
            <p className="mt-2 text-[12px] text-neutral-600">
              {t("gallery.artworkAuth.artistOnFile")} {artistNameOnFile}
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] text-neutral-500">
              <li>
                {institutionOnFile
                  ? translateCanonicalPhrase("institutionAttestationOnFile", t)
                  : t("gallery.artworkAuth.institutionContinuityPending")}
              </li>
              <li>
                {artistAttestationOnFile
                  ? translateCanonicalPhrase("artistAttestationOnFile", t)
                  : translateCanonicalPhrase("artistAttestationMayDeepen", t)}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className={labelClass} htmlFor="artwork-auth-invite-email">
              {t("gallery.invitations.artistEmail")}
            </label>
            <input
              id="artwork-auth-invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder={t("gallery.invitations.emailPlaceholder")}
              disabled={!isAdmin || busy}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="artwork-auth-invite-note">
              {t("gallery.artworkAuth.personalNote")}
            </label>
            <textarea
              id="artwork-auth-invite-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${fieldClass} resize-none`}
              placeholder={t("gallery.artworkAuth.notePlaceholder")}
              disabled={!isAdmin || busy}
            />
          </div>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-neutral-500">
          {t("gallery.artworkAuth.modalOutcome")}
        </p>

        {error ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 text-sm text-emerald-900/90" role="status">
            {success}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            disabled={busy || !isAdmin || Boolean(success)}
            onClick={() => void submit()}
            className="flex-1 rounded-2xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? t("common.sending") : t("gallery.artworkAuth.ctaSend")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-neutral-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            {success ? t("gallery.artworkAuth.close") : t("common.cancel")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
