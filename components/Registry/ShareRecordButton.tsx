"use client";

import { useState } from "react";

export function ShareRecordButton({ url }: { url: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Copy this link:", url);
        }
      }}
      className="liquid-glass-inset w-full border-0 px-4 py-3 text-sm font-medium text-neutral-800 shadow-none transition hover:bg-white/85"
    >
      {done ? "Link copied" : "Copy link"}
    </button>
  );
}
