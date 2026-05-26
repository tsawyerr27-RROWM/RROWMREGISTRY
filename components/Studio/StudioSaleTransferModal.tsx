"use client";

import { useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

type SaleEvent = {
  id: string;
  declared_value?: number | null;
  currency?: string | null;
  created_at?: string | null;
  value_type?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  artworkId: string;
  userId: string;
  sellerId: string;
  saleEvent: SaleEvent;
  onSuccess: () => Promise<void> | void;
  onToast: (kind: "success" | "error", message: string) => void;
};

export function StudioSaleTransferModal({
  isOpen,
  onClose,
  artworkId,
  userId,
  sellerId,
  saleEvent,
  onSuccess,
  onToast,
}: Props) {
  const [buyerMode, setBuyerMode] = useState<"user" | "external">("external");
  const [buyerUserId, setBuyerUserId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerType, setBuyerType] = useState<
    "collector" | "gallery" | "institution" | "private" | "unknown"
  >("collector");
  const [saleType, setSaleType] = useState<"primary" | "secondary">(
    "secondary"
  );
  const [saleDate, setSaleDate] = useState("");
  const [note, setNote] = useState("");
  const [ownerVisibility, setOwnerVisibility] = useState("private");
  const [ownerName, setOwnerName] = useState("");
  const [ownerLocation, setOwnerLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const prefillPrice =
    typeof saleEvent.declared_value === "number"
      ? saleEvent.declared_value
      : Number(saleEvent.declared_value || 0);
  const prefillCurrency = String(saleEvent.currency || "USD");
  const prefillDate = saleEvent.created_at
    ? new Date(saleEvent.created_at).toISOString().slice(0, 10)
    : "";

  const inputCls =
    "liquid-glass-inset mt-2 w-full px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900/15";

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => !submitting && onClose()}
      tone="silver"
      panelClassName="relative max-h-[92vh] w-full max-w-lg overflow-y-auto p-6 md:p-8"
    >
      <InfoTooltip text="Link this transfer to the recorded sale so the ledger stays accurate. This is a lasting provenance step. Double-check before saving." />
      <h2 className="font-serif text-xl font-normal text-neutral-950">
        Complete sale · ownership
      </h2>
      <p className="liquid-glass-inset !rounded-xl mt-4 px-3 py-2 text-sm text-neutral-700 tabular-nums">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: prefillCurrency,
          maximumFractionDigits: 0,
        }).format(prefillPrice)}{" "}
        · {String(saleEvent.value_type || "").replaceAll("_", " ")}
      </p>

      <form
        className="mt-6 grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const supabase = getSupabaseBrowserClient();
          const buyerUid =
            buyerMode === "user" ? buyerUserId.trim() || null : null;
          const buyerNm =
            buyerMode === "external" ? buyerName.trim() || null : null;
          const buyerTp =
            buyerMode === "external" ? buyerType : null;

          if (buyerUid && !isUuid(buyerUid)) {
            onToast("error", "Buyer user id must be a valid UUID.");
            return;
          }
          if (buyerMode === "user" && !buyerUid) {
            onToast("error", "Buyer user id is required.");
            return;
          }
          if (buyerMode === "external" && !buyerNm) {
            onToast("error", "Buyer name is required.");
            return;
          }

          const saleDateIso = saleDate
            ? new Date(saleDate).toISOString()
            : saleEvent.created_at || new Date().toISOString();

          setSubmitting(true);
          const { error: insertErr } = await supabase
            .from("ownership_events")
            .insert({
              artwork_id: artworkId,
              transfer_type: "sale",
              to_user_id: buyerUid,
              to_name: buyerNm,
              to_type: buyerTp,
              value_event_id: saleEvent.id,
              sale_type: saleType,
              sale_price: prefillPrice || null,
              sale_currency: prefillCurrency || null,
              sale_date: saleDateIso,
              notes: note || null,
              note: note || null,
              location: ownerLocation || null,
              owner_visibility: ownerVisibility,
              owner_name: ownerName || null,
              owner_location: ownerLocation || null,
              created_by: userId,
            });

          if (insertErr) {
            console.error(insertErr);
            onToast(
              "error",
              `Could not record transfer: ${summarizeRpcError(insertErr)}`
            );
            setSubmitting(false);
            return;
          }

          if (buyerUid) {
            const { error: ownerUpdateErr } = await supabase
              .from("artworks")
              .update({
                current_owner_id: buyerUid,
                test_owner_id: buyerUid,
              })
              .eq("id", artworkId);
            if (ownerUpdateErr) {
              onToast(
                "error",
                "Transfer recorded, but could not update current owner."
              );
              setSubmitting(false);
              return;
            }
          }

          await onSuccess();
          setSubmitting(false);
          onToast("success", "Ownership transfer recorded");
          onClose();
        }}
      >
        <input type="hidden" name="seller" value={sellerId} readOnly />

        <label className="block">
          <span className="text-sm font-semibold text-neutral-500">
            Buyer
          </span>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <select
              value={buyerMode}
              onChange={(e) =>
                setBuyerMode(e.target.value as "user" | "external")
              }
              className={inputCls}
            >
              <option value="external">External buyer</option>
              <option value="user">Existing user (UUID)</option>
            </select>
            {buyerMode === "user" ? (
              <input
                value={buyerUserId}
                onChange={(e) => setBuyerUserId(e.target.value)}
                className={inputCls}
                placeholder="Buyer user id"
              />
            ) : (
              <input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className={inputCls}
                placeholder="Buyer name"
              />
            )}
          </div>
          {buyerMode === "external" ? (
            <select
              value={buyerType}
              onChange={(e) =>
                setBuyerType(
                  e.target.value as typeof buyerType
                )
              }
              className={inputCls}
            >
              <option value="collector">Collector</option>
              <option value="gallery">Gallery</option>
              <option value="institution">Institution</option>
              <option value="private">Private</option>
              <option value="unknown">Unknown</option>
            </select>
          ) : null}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-neutral-500">
              Sale type
            </span>
            <select
              value={saleType}
              onChange={(e) =>
                setSaleType(e.target.value as "primary" | "secondary")
              }
              className={inputCls}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-neutral-500">
              Date of sale
            </span>
            <input
              type="date"
              value={saleDate || prefillDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-neutral-500">
            Notes
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="Optional context"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-neutral-500">
            Owner visibility
          </span>
          <select
            value={ownerVisibility}
            onChange={(e) => setOwnerVisibility(e.target.value)}
            className={inputCls}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-neutral-500">
              Display name (optional)
            </span>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-neutral-500">
              Location (optional)
            </span>
            <input
              value={ownerLocation}
              onChange={(e) => setOwnerLocation(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="liquid-glass-inset px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white/70 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save transfer"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
