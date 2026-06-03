"use client";

import ModalShell from "@/components/ui/ModalShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";

export type OwnershipLedgerConfirmVariant =
  | "admin_verify"
  | "request_verification";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  variant: OwnershipLedgerConfirmVariant;
  onConfirm: () => void | Promise<void>;
  pending: boolean;
};

const COPY_KEYS: Record<
  OwnershipLedgerConfirmVariant,
  { title: MessageKey; body: MessageKey; confirmLabel: MessageKey }
> = {
  admin_verify: {
    title: "studio.ledger.confirm.adminVerify.title",
    body: "studio.ledger.confirm.adminVerify.body",
    confirmLabel: "studio.ledger.confirm.adminVerify.confirm",
  },
  request_verification: {
    title: "studio.ledger.confirm.requestVerification.title",
    body: "studio.ledger.confirm.requestVerification.body",
    confirmLabel: "studio.ledger.confirm.requestVerification.confirm",
  },
};

export function OwnershipLedgerActionConfirmModal({
  isOpen,
  onClose,
  variant,
  onConfirm,
  pending,
}: Props) {
  const { t } = useLocalePreferences();
  const copyKeys = COPY_KEYS[variant];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => {
        if (!pending) onClose();
      }}
      tone="silver"
    >
      <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
        {t(copyKeys.title)}
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
        {t(copyKeys.body)
          .split("\n\n")
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </div>
      <p className="mt-4 text-sm font-medium text-neutral-800">
        {t("studio.ledger.confirm.areYouSure")}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void onConfirm()}
          className="rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? t("studio.ledger.confirm.working") : t(copyKeys.confirmLabel)}
        </button>
      </div>
    </ModalShell>
  );
}
