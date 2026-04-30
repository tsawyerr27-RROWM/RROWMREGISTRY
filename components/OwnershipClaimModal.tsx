"use client";

import { useState } from "react";
import { getSessionSafe, getSupabaseBrowserClient } from "@/lib/supabase";

interface Props {
  artworkId: string;
  onClose: () => void;
}

export default function OwnershipClaimModal({ artworkId, onClose }: Props) {

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submitClaim = async () => {

    setLoading(true);

    const session = await getSessionSafe();
    const user = session?.user;

    if (!user) {
      alert("Please login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("ownership_claims")
      .insert({
        artwork_id: artworkId,
        collector_id: user.id,
        note
      });

    if (error) {
      console.error(error);
      alert("Claim failed");
    } else {
      alert("Claim submitted for review");
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-6">

      <div className="bg-neutral-900 p-8 rounded-2xl w-[400px]">

        <h2 className="text-xl mb-4">
          Claim Ownership
        </h2>

        <textarea
          placeholder="Optional message"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-3 bg-neutral-800 rounded"
        />

        <button
          onClick={submitClaim}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Submit Claim
        </button>

      </div>

    </div>
  );
}