"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AccountPanel } from "@/components/account/account-ui";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";

type AccountStatus = "active" | "deactivated" | "pending_deletion" | "deleted";

type Props = {
  email: string | null;
  authProvider: string;
  onExportComplete?: (exportId: string) => void;
};

export function DataExportPanel({ email, authProvider, onExportComplete }: Props) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCsrf = useCallback(async () => {
    const res = await fetch("/api/account/csrf", { credentials: "include" });
    if (res.ok) {
      const j = (await res.json()) as { csrfToken?: string };
      setCsrfToken(j.csrfToken ?? null);
    }
  }, []);

  useEffect(() => {
    void loadCsrf();
  }, [loadCsrf]);

  const requestExport = async () => {
    if (!csrfToken) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/account/export", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(
          authProvider !== "email" && !needsPassword ? {} : { password }
        ),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        requiresPassword?: boolean;
        exportId?: string;
        downloadUrl?: string;
      };
      if (res.status === 401 && j.requiresPassword) {
        setNeedsPassword(true);
        setError("Enter your password to confirm.");
        return;
      }
      if (!res.ok) {
        setError(j.error || "Export failed.");
        return;
      }
      setMessage(
        j.downloadUrl
          ? `Export ready. A download link was sent to ${email ?? "your email"}.`
          : "Export requested."
      );
      if (j.exportId) onExportComplete?.(j.exportId);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="liquid-glass-tile flex flex-col gap-6 px-4 py-6 md:px-6">
      <p className="text-sm leading-relaxed text-neutral-600">
        Download a copy of your profile, registry records, certificates, activity
        history, and related metadata. Exports are generated asynchronously and
        delivered by email when ready.
      </p>
      {needsPassword && authProvider === "email" ? (
        <div>
          <label htmlFor="export-password" className="text-sm font-medium text-neutral-900">
            Password
          </label>
          <input
            id="export-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="liquid-glass-inset mt-2 w-full max-w-sm border-0 px-4 py-3 text-[15px] text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900/15"
            autoComplete="current-password"
          />
        </div>
      ) : null}
      {error ? (
        <p className="text-sm text-neutral-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-neutral-600" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy || !csrfToken}
        onClick={() => void requestExport()}
        className="w-fit rounded-xl border border-neutral-900/10 bg-white/80 px-6 py-3 text-sm font-medium text-neutral-900 transition hover:border-neutral-900/20 disabled:opacity-50"
      >
        {busy ? "Preparing export…" : "Download my data"}
      </button>
    </div>
  );
}

type DeactivateProps = {
  accountStatus: AccountStatus;
  authProvider: string;
  onStatusChange?: () => void;
};

export function DeactivateAccountPanel({
  accountStatus,
  authProvider,
  onStatusChange,
}: DeactivateProps) {
  const [open, setOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/account/csrf", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { csrfToken?: string }) => setCsrfToken(j.csrfToken ?? null));
  }, []);

  const isDeactivated = accountStatus === "deactivated";

  const toggle = async () => {
    if (!csrfToken) return;
    setBusy(true);
    setError(null);
    const endpoint = isDeactivated ? "/api/account/reactivate" : "/api/account/deactivate";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(authProvider === "email" ? { password } : {}),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        requiresPassword?: boolean;
      };
      if (!res.ok) {
        setError(j.error || "Request failed.");
        return;
      }
      setOpen(false);
      onStatusChange?.();
      if (!isDeactivated) {
        window.location.href = "/";
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="liquid-glass-tile flex flex-col gap-5 px-4 py-6 md:px-6">
      <p className="text-sm leading-relaxed text-neutral-600">
        {isDeactivated
          ? "Your account is deactivated. Reactivate to restore sign-in and public profile visibility. Registry ownership is preserved."
          : "Temporarily disable sign-in and hide your public profile. Registry ownership and records on file are preserved. You may reactivate later."}
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-fit rounded-xl border border-neutral-900/10 bg-white/80 px-6 py-3 text-sm font-medium text-neutral-900 transition hover:border-neutral-900/20"
        >
          {isDeactivated ? "Reactivate account" : "Deactivate account"}
        </button>
      ) : (
        <div className="max-w-md space-y-4">
          {authProvider === "email" ? (
            <div>
              <label htmlFor="deact-password" className="text-sm font-medium text-neutral-900">
                Password confirmation
              </label>
              <input
                id="deact-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="liquid-glass-inset mt-2 w-full border-0 px-4 py-3 text-[15px] focus:outline-none focus:ring-1 focus:ring-neutral-900/15"
                autoComplete="current-password"
              />
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-neutral-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggle()}
              className="rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Processing…" : isDeactivated ? "Confirm reactivation" : "Confirm deactivation"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-neutral-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PrivacyDataSection({
  email,
  authProvider,
  accountStatus,
  deletionScheduledAt,
  onStatusChange,
}: {
  email: string | null;
  authProvider: string;
  accountStatus: AccountStatus;
  deletionScheduledAt: string | null;
  onStatusChange?: () => void;
}) {
  return (
    <AccountPanel
      id="account-privacy-data"
      title="Privacy & data"
      description="Export your data, temporarily deactivate your account, or permanently delete your account."
    >
      <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-neutral-500">
        These tools implement your rights under applicable data protection law.
        See our{" "}
        <Link
          href="/privacy"
          className="text-neutral-800 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
        >
          Privacy Policy
        </Link>{" "}
        for retention of registry records and the 30-day deletion recovery period.
      </p>
      <div className="flex flex-col gap-12">
        <div>
          <h3 className="text-[15px] font-medium text-neutral-900">Download my data</h3>
          <div className="mt-5">
            <DataExportPanel email={email} authProvider={authProvider} />
          </div>
        </div>

        <div className="border-t border-neutral-900/[0.06] pt-12">
          <h3 className="text-[15px] font-medium text-neutral-900">Deactivate account</h3>
          <div className="mt-5">
            <DeactivateAccountPanel
              accountStatus={accountStatus}
              authProvider={authProvider}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>

        <div className="border-t border-neutral-900/[0.06] pt-12">
          <DeleteAccountZone
            email={email}
            authProvider={authProvider}
            accountStatus={accountStatus}
            deletionScheduledAt={deletionScheduledAt}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </AccountPanel>
  );
}

const CONSEQUENCES = [
  "Your profile will be removed",
  "Private settings will be deleted",
  "You will lose access to your account",
  "Registry audit records may remain preserved",
  "Public provenance history may remain visible where required for record integrity",
] as const;

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

function DeleteAccountZone({
  authProvider,
  accountStatus,
  deletionScheduledAt,
  onStatusChange,
}: {
  email: string | null;
  authProvider: string;
  accountStatus: AccountStatus;
  deletionScheduledAt: string | null;
  onStatusChange?: () => void;
}) {
  const sb = useSupabaseBrowserLazy();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(deletionScheduledAt);

  useEffect(() => {
    void fetch("/api/account/csrf", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { csrfToken?: string }) => setCsrfToken(j.csrfToken ?? null));
  }, []);

  if (accountStatus === "pending_deletion" && scheduledAt) {
    return (
      <div className="rounded-xl border border-neutral-900/10 bg-neutral-950/[0.02] px-5 py-6">
        <p className="font-medium text-neutral-900">Account deletion scheduled</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Your account will be permanently deleted on{" "}
          {new Date(scheduledAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          . Check your email for a recovery link.
        </p>
        <CancelDeletionButton csrfToken={csrfToken} onCancelled={onStatusChange} />
      </div>
    );
  }

  const submitDeletion = async () => {
    if (!csrfToken || confirmation !== CONFIRM_PHRASE) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete/request", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          password: authProvider === "email" ? password : undefined,
          confirmation: CONFIRM_PHRASE,
          acknowledged: true,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        deletionScheduledAt?: string;
        requiresPassword?: boolean;
      };
      if (!res.ok) {
        setError(j.error || "Deletion request failed.");
        return;
      }
      setScheduledAt(j.deletionScheduledAt ?? null);
      setStep(4);
      await sb().auth.signOut();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-900/12 bg-neutral-950/[0.02] px-5 py-6 md:px-6">
      <div className="flex items-start gap-3">
        <InfoTooltip text="Permanent removal of account access. Registry records required for provenance integrity may remain preserved in anonymised form." />
        <div>
          <h3 className="font-serif text-lg text-neutral-950">Delete account</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
            Deleting your account permanently removes access to RROWM services. Some
            registry records may remain preserved where required to maintain provenance
            integrity and audit history.
          </p>
        </div>
      </div>

      {step === 0 ? (
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mt-6 rounded-xl border border-neutral-900/20 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-950 hover:text-white"
        >
          Delete account
        </button>
      ) : null}

      {step >= 1 && step < 4 ? (
        <div className="mt-8 max-w-lg space-y-6">
          {step === 1 ? (
            <>
              <p className="text-sm font-medium text-neutral-900">
                Step 1 · Confirm your identity
              </p>
              {authProvider === "email" ? (
                <div>
                  <label htmlFor="del-password" className="text-sm text-neutral-700">
                    Re-enter your password
                  </label>
                  <input
                    id="del-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="liquid-glass-inset mt-2 w-full border-0 px-4 py-3 text-[15px] focus:outline-none focus:ring-1 focus:ring-neutral-900/15"
                    autoComplete="current-password"
                  />
                </div>
              ) : (
                <p className="text-sm text-neutral-600">
                  OAuth account — ensure you signed in recently. If not, sign out and
                  sign in again before continuing.
                </p>
              )}
              <button
                type="button"
                disabled={authProvider === "email" && !password.trim()}
                onClick={() => setStep(2)}
                className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
              >
                Continue
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-sm font-medium text-neutral-900">
                Step 2 · Understand the consequences
              </p>
              <ul className="space-y-2 text-sm text-neutral-700">
                {CONSEQUENCES.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-neutral-400">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1"
                />
                I understand and wish to continue
              </label>
              <button
                type="button"
                disabled={!acknowledged}
                onClick={() => setStep(3)}
                className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
              >
                Continue
              </button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="text-sm font-medium text-neutral-900">
                Step 3 · Type confirmation phrase
              </p>
              <p className="text-sm text-neutral-600">
                Type{" "}
                <span className="font-mono font-semibold text-neutral-900">
                  {CONFIRM_PHRASE}
                </span>{" "}
                to confirm.
              </p>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className="liquid-glass-inset w-full border-0 px-4 py-3 font-mono text-[15px] focus:outline-none focus:ring-1 focus:ring-neutral-900/15"
              />
              {error ? (
                <p className="text-sm text-neutral-800" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                disabled={confirmation !== CONFIRM_PHRASE || busy}
                onClick={() => void submitDeletion()}
                className="rounded-xl border border-neutral-900 bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
              >
                {busy ? "Scheduling…" : "Schedule account deletion"}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-8 max-w-lg">
          <p className="font-medium text-neutral-900">Account deletion scheduled</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Your account will be permanently deleted in 30 days. You have been signed
            out. Check your email for recovery instructions.
          </p>
          <SignOutButton />
        </div>
      ) : null}
    </div>
  );
}

function CancelDeletionButton({
  csrfToken,
  onCancelled,
}: {
  csrfToken: string | null;
  onCancelled?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    if (!csrfToken) return;
    setBusy(true);
    const res = await fetch("/api/account/delete/cancel", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({}),
    });
    setBusy(false);
    if (res.ok) onCancelled?.();
  };
  return (
    <button
      type="button"
      disabled={busy || !csrfToken}
      onClick={() => void cancel()}
      className="mt-4 rounded-xl border border-neutral-900/10 px-5 py-2.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
    >
      {busy ? "Cancelling…" : "Cancel deletion"}
    </button>
  );
}

function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = "/";
      }}
      className="mt-4 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white"
    >
      Return to home
    </button>
  );
}
