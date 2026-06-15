"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";
import ModalShell from "@/components/ui/ModalShell";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import {
  chronologyContinuationKindLabel,
  type ProvenanceTransferType,
} from "@/lib/provenance-transfer";
import type { RegistryStewardInviteEligibility } from "@/lib/registry-steward-invite";
import type { RegistryStewardInviteKind } from "@/lib/registry-steward-invite";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  eligibility: RegistryStewardInviteEligibility;
  onSent?: () => void;
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none focus:border-neutral-400";

export function InviteRecordStewardModal({
  isOpen,
  onClose,
  eligibility,
  onSent,
}: Props) {
  const { t } = useLocalePreferences();
  const defaultKind = eligibility.kinds[0] ?? "authorship";
  const [kind, setKind] = useState<RegistryStewardInviteKind>(defaultKind);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [transferType, setTransferType] = useState<ProvenanceTransferType>(
    eligibility.custody?.transferTypes[0] ?? "private_transfer"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setKind(defaultKind);
    setEmail(eligibility.authorship?.defaultEmail ?? "");
    setNote("");
    setError(null);
    setSuccess(null);
    setTransferType(
      eligibility.custody?.transferTypes[0] ?? "private_transfer"
    );
  }, [isOpen, defaultKind, eligibility]);

  const kindOptions = useMemo(
    () =>
      eligibility.kinds.map((value: RegistryStewardInviteKind) => ({
        value,
        label:
          value === "authorship"
            ? t("registry.stewardInvite.kind.authorship")
            : t("registry.stewardInvite.kind.custody"),
      })),
    [eligibility.kinds, t]
  );

  const submit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("registry.stewardInvite.invalidEmail"));
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (!csrfToken) {
        setError(t("registry.stewardInvite.csrfError"));
        return;
      }

      const res = await fetch("/api/registry/steward-invites/send", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          artwork_id: eligibility.artwork.id,
          kind,
          recipient_email: trimmed,
          message: note.trim() || null,
          custody_transfer_type: kind === "custody" ? transferType : undefined,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
        emailDeliveryError?: string;
        landing_url?: string;
      };

      if (!res.ok) {
        setError(payload.error || t("registry.stewardInvite.sendFailed"));
        return;
      }

      if (payload.emailDeliveryError) {
        setSuccess(
          `${fillMessage(t("registry.stewardInvite.onFile"), { email: trimmed })} ${payload.emailDeliveryError}`
        );
      } else if (payload.emailSent) {
        setSuccess(fillMessage(t("registry.stewardInvite.sent"), { email: trimmed }));
      } else {
        setSuccess(fillMessage(t("registry.stewardInvite.onFile"), { email: trimmed }));
      }

      onSent?.();
    } catch {
      setError(t("registry.stewardInvite.networkError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      tone="light"
      panelClassName="max-h-[90vh] w-full max-w-lg overflow-auto"
    >
      <div className="space-y-5 p-8 md:p-10">
        <div>
          <InfoTooltip text={t("registry.stewardInvite.modalLead")} />
          <h2 className="mt-2 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
            {t("registry.stewardInvite.modalTitle")}
          </h2>
        </div>

        <div className="rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-4 py-3">
          <p className="font-mono text-[11px] text-neutral-500">
            {eligibility.artwork.registry_id}
          </p>
          <p className="mt-1 font-serif text-lg text-neutral-950">
            {eligibility.artwork.title}
          </p>
        </div>

        {kindOptions.length > 1 ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {t("registry.stewardInvite.kindLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {kindOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setKind(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    kind === option.value
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {kind === "authorship" && eligibility.authorship ? (
          <p className="text-sm text-neutral-600">
            {fillMessage(t("registry.stewardInvite.authorshipContext"), {
              artist: eligibility.authorship.artistNameOnFile,
              institution: eligibility.authorship.institutionName,
            })}
          </p>
        ) : null}

        {kind === "custody" ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-800">
                {t("registry.stewardInvite.custodyNarrative")}
              </label>
              <InfoTooltip text={t("registry.stewardInvite.custodyTooltip")} />
            </div>
            <select
              className={fieldClass}
              value={transferType}
              onChange={(e) =>
                setTransferType(e.target.value as ProvenanceTransferType)
              }
            >
              {(eligibility.custody?.transferTypes ?? []).map((value) => (
                <option key={value} value={value}>
                  {chronologyContinuationKindLabel(value)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t("registry.stewardInvite.recipientEmail")}
          </label>
          <input
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            {t("registry.stewardInvite.messageLabel")}{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            className={`${fieldClass} min-h-[88px] resize-y`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
          />
        </div>

        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        {success ? <p className="text-sm text-neutral-700">{success}</p> : null}

        <button
          type="button"
          disabled={busy || !email.trim()}
          onClick={() => void submit()}
          className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40"
        >
          {busy
            ? t("registry.stewardInvite.sending")
            : t("registry.stewardInvite.sendCta")}
        </button>
      </div>
    </ModalShell>
  );
}
