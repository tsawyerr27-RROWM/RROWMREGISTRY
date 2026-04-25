"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type EnquiryModalProps = {
  open: boolean;
  onClose: () => void;
  listingId: string;
  artworkTitle: string;
};

export function EnquiryModal({
  open,
  onClose,
  listingId,
  artworkTitle,
}: EnquiryModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(() => message.trim(), [message]);

  if (!open) return null;

  const send = async () => {
    setError(null);
    if (!trimmed) {
      setError("Add a short message.");
      return;
    }
    setSending(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id ?? null;
    if (!uid) {
      setSending(false);
      setError("Please sign in to send an enquiry.");
      return;
    }
    const { error: insErr } = await supabase.from("market_enquiries").insert({
      listing_id: listingId,
      buyer_user_id: uid,
      message: trimmed,
      status: "open",
    });
    setSending(false);
    if (insErr) {
      setError(insErr.message || "Could not send enquiry.");
      return;
    }
    setMessage("");
    onClose();
  };

  return (
    <div className="liquid-glass-backdrop backdrop-blur-xl fixed inset-0 z-[200] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-black/[0.08] bg-white/90 p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)] backdrop-blur">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
          Send enquiry
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          About <span className="font-medium text-neutral-800">{artworkTitle}</span>
        </p>

        <label className="mt-5 block text-sm font-medium text-neutral-700">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          placeholder="Introduce yourself and your intent."
        />

        {error ? <p className="mt-3 text-xs text-red-700">{error}</p> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Close
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => void send()}
            className="rounded-2xl bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

