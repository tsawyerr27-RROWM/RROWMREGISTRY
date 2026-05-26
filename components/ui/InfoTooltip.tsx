"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type Props = {
  text: ReactNode;
  theme?: Theme;
  className?: string;
};

const ICON = (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      d="M12 16v-4M12 8h.01"
    />
  </svg>
);

const themeStyles: Record<Theme, { icon: string; bubble: string }> = {
  light: {
    icon: "text-neutral-400 transition group-hover/tip:text-neutral-600",
    bubble:
      "border-neutral-200/90 bg-white text-neutral-600 shadow-lg",
  },
  dark: {
    icon: "text-white/40 transition group-hover/tip:text-white/70",
    bubble:
      "border-white/10 bg-neutral-900 text-white/80 shadow-lg",
  },
};

/**
 * Viewport-aware info tooltip. Measures on hover and flips vertically /
 * shifts horizontally so the bubble never clips out of view.
 */
export function InfoTooltip({ text, theme = "light", className = "" }: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: boolean;
    shiftX: number;
  }>({ top: true, shiftX: 0 });

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const tRect = trigger.getBoundingClientRect();
    const bRect = bubble.getBoundingClientRect();
    const pad = 8;

    const fitsAbove = tRect.top - bRect.height - pad > 0;
    const top = fitsAbove;

    const idealLeft = tRect.left + tRect.width / 2 - bRect.width / 2;
    let shiftX = 0;
    if (idealLeft < pad) shiftX = pad - idealLeft;
    else if (idealLeft + bRect.width > window.innerWidth - pad)
      shiftX = window.innerWidth - pad - (idealLeft + bRect.width);

    setPos({ top, shiftX });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);

  const s = themeStyles[theme];

  return (
    <span
      ref={triggerRef}
      className={`group/tip relative inline-flex cursor-help ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="button"
      aria-label="More information"
    >
      <span className={s.icon}>{ICON}</span>

      <span
        ref={bubbleRef}
        style={{
          transform: `translateX(calc(-50% + ${pos.shiftX}px))`,
          visibility: open ? "visible" : "hidden",
        }}
        className={`pointer-events-none absolute left-1/2 z-20 w-64 rounded-lg border px-3 py-2 text-[11px] leading-snug font-medium text-left transition-opacity ${
          pos.top ? "bottom-full mb-2" : "top-full mt-2"
        } ${s.bubble} ${open ? "opacity-100" : "opacity-0"}`}
      >
        {text}
      </span>
    </span>
  );
}
