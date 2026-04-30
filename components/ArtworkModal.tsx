"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function ArtworkModal({
  userId,
  onClose,
  onCreated,
}: {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [medium, setMedium] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    const supabase = getSupabaseBrowserClient();
    let imageUrl = null;

    if (imageFile) {
      const filePath = `${userId}/${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("artwork-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("artworks").insert({
      artist_id: userId,
      title,
      year,
      medium,
      dimensions,
      image_url: imageUrl,
      verification_status: "unverified",
    });

    if (!error) {
      onCreated();
      onClose();
    }
  };

  return (
    <div className="liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center">
      <div className="bg-neutral-900 border border-white/10 rounded-3xl p-12 w-[600px] space-y-6 animate-modal">

        <h3 className="text-2xl font-semibold">Register Artwork</h3>

        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
        <input placeholder="Year" value={year} onChange={e => setYear(e.target.value)} className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
        <input placeholder="Medium" value={medium} onChange={e => setMedium(e.target.value)} className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
        <input placeholder="Dimensions" value={dimensions} onChange={e => setDimensions(e.target.value)} className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />

        <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} />

        <div className="flex justify-end gap-6 pt-6">
          <button onClick={onClose} className="text-white/50">Cancel</button>
          <button onClick={handleSubmit} className="bg-white text-black px-6 py-3 rounded-xl">
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}
