"use client";

export default function LiquidGlassSeal() {
  return (
    <div
      className="relative w-24 h-24 rounded-full flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(22,163,74,0.2), rgba(34,197,94,0.25))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "2px solid rgba(255,255,255,0.6)",
        boxShadow:
          "0 8px 32px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 40px rgba(34,197,94,0.15)",
      }}
    >
      <svg
        className="w-10 h-10 text-white drop-shadow-sm"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
