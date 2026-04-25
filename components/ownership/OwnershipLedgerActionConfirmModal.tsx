"use client";

import ModalShell from "@/components/ui/ModalShell";

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

const COPY: Record<
  OwnershipLedgerConfirmVariant,
  { title: string; body: string; confirmLabel: string }
> = {
  admin_verify: {
    title: "Verify this ownership step?",
    body: `You are about to mark this ownership transfer as verified. In plain terms, you are telling the registry that this change of hands is correct and should be treated as trusted, permanent history for the artwork—similar to signing off on a formal record.

Only continue if you have checked the sale or transfer details and you are comfortable that they are accurate. Reversing or editing this kind of decision later is difficult, so it deserves a deliberate second look.`,
    confirmLabel: "Yes, verify ownership",
  },
  request_verification: {
    title: "Request verification for this transfer?",
    body: `You are asking to move this ownership step forward in the verification process. That request becomes part of the work’s provenance story and may be visible to others who rely on the registry.

Use this when you believe the transfer details are correct and you want them reviewed—not as a casual click. Make sure what you see in the ledger matches what actually happened.`,
    confirmLabel: "Yes, submit request",
  },
};

export function OwnershipLedgerActionConfirmModal({
  isOpen,
  onClose,
  variant,
  onConfirm,
  pending,
}: Props) {
  const copy = COPY[variant];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => {
        if (!pending) onClose();
      }}
      panelClassName="liquid-glass rrowm-modal-surface relative max-w-lg w-full overflow-hidden rounded-2xl p-6 ring-1 ring-black/[0.06] shadow-[0_28px_64px_-28px_rgba(0,0,0,0.35)] sm:p-8"
      overlayClassName="liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-4 sm:p-8"
      closeClassName="liquid-glass-close absolute right-4 top-4 rounded-2xl px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-white/85 hover:text-neutral-900 disabled:opacity-40"
    >
      <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
        {copy.title}
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
        {copy.body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-neutral-800">
        Are you sure you want to continue?
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void onConfirm()}
          className="rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Working…" : copy.confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
