"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deferredRouterRefresh } from "@/lib/deferred-app-router";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { normalizeVerificationStatus } from "@/lib/ownership-ledger";
import {
  OwnershipLedgerActionConfirmModal,
  type OwnershipLedgerConfirmVariant,
} from "@/components/ownership/OwnershipLedgerActionConfirmModal";

type Props = {
  eventId: string;
  /** Precomputed for this row */
  isLatest: boolean;
  verificationStatus: unknown;
  hasSession: boolean;
  userIsAdmin: boolean;
  loginNextPath: string;
};

export function OwnershipVerificationControls({
  eventId,
  isLatest,
  verificationStatus,
  hasSession,
  userIsAdmin,
  loginNextPath,
}: Props) {
  const router = useRouter();
  const status = normalizeVerificationStatus(verificationStatus);
  const [pending, setPending] = useState(false);
  const [confirmVariant, setConfirmVariant] =
    useState<OwnershipLedgerConfirmVariant | null>(null);

  const requestHref = `/login?next=${encodeURIComponent(loginNextPath)}`;

  const requestVerification = async () => {
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.rpc("ownership_request_verification", {
      p_event_id: eventId,
    });
    setPending(false);
    if (error) {
      alert(error.message || "Could not submit request.");
      return;
    }
    deferredRouterRefresh(router);
  };

  const adminVerify = async () => {
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      setPending(false);
      alert("Session expired. Sign in again.");
      return;
    }
    const res = await fetch("/api/admin/verify-ownership", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId }),
    });
    const json = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      alert(
        typeof json?.error === "string" ? json.error : "Verification failed."
      );
      return;
    }
    deferredRouterRefresh(router);
  };

  if (!hasSession && isLatest && status === "recorded") {
    return (
      <p className="mt-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Link
          href={requestHref}
          className="text-[11px] font-medium text-neutral-500 hover:text-emerald-800"
        >
          Request verification
        </Link>
        <span className="text-[11px] text-neutral-400">
          {" "}
          · sign in required
        </span>
      </p>
    );
  }

  const showRequest = hasSession && isLatest && status === "recorded";
  const showAdmin = userIsAdmin && status !== "verified";

  if (!showRequest && !showAdmin) return null;

  return (
    <>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {showRequest ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmVariant("request_verification")}
            className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
          >
            {pending ? "Submitting…" : "Request verification"}
          </button>
        ) : null}
        {showAdmin ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmVariant("admin_verify")}
            className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-emerald-700 disabled:opacity-50"
          >
            {pending ? "Verifying…" : "Verify ownership"}
          </button>
        ) : null}
      </p>
      <OwnershipLedgerActionConfirmModal
        isOpen={confirmVariant !== null}
        onClose={() => setConfirmVariant(null)}
        variant={confirmVariant ?? "admin_verify"}
        pending={pending}
        onConfirm={async () => {
          if (!confirmVariant) return;
          try {
            if (confirmVariant === "admin_verify") {
              await adminVerify();
            } else {
              await requestVerification();
            }
          } finally {
            setConfirmVariant(null);
          }
        }}
      />
    </>
  );
}
