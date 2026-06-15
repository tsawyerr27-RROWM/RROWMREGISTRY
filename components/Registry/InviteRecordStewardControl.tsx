"use client";

import { useCallback, useEffect, useState } from "react";

import { InviteRecordStewardModal } from "@/components/Registry/InviteRecordStewardModal";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { RegistryStewardInviteEligibility } from "@/lib/registry-steward-invite";

type Props = {
  artworkId: string;
  registryId: string;
  sessionUserId: string | null;
  className?: string;
};

export function InviteRecordStewardControl({
  artworkId,
  registryId,
  sessionUserId,
  className = "",
}: Props) {
  const { t } = useLocalePreferences();
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] =
    useState<RegistryStewardInviteEligibility | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!sessionUserId) {
      setEligibility(null);
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        artwork_id: artworkId,
        registry_id: registryId,
      });
      const res = await fetch(
        `/api/registry/steward-invites/eligibility?${qs.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setEligibility(null);
        return;
      }
      const payload = (await res.json()) as RegistryStewardInviteEligibility & {
        eligible?: boolean;
      };
      if (!payload.eligible || !payload.kinds?.length) {
        setEligibility(null);
        return;
      }
      setEligibility(payload);
    } catch {
      setEligibility(null);
    } finally {
      setLoading(false);
    }
  }, [artworkId, registryId, sessionUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!sessionUserId || loading || !eligibility) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`liquid-glass-inset w-full border-0 px-4 py-3 text-sm font-medium text-neutral-900 shadow-none transition hover:bg-white/85 ${className}`}
      >
        {t("registry.stewardInvite.cta")}
      </button>
      <InviteRecordStewardModal
        isOpen={open}
        onClose={() => setOpen(false)}
        eligibility={eligibility}
        onSent={() => void load()}
      />
    </>
  );
}
