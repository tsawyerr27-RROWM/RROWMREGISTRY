"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useId,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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
      "border-neutral-200/90 bg-white text-neutral-600 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.22)]",
  },
  dark: {
    icon: "text-white/40 transition group-hover/tip:text-white/70",
    bubble:
      "border-white/10 bg-neutral-900 text-white/80 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]",
  },
};

function provisionalCoords(trigger: DOMRect): { top: number; left: number } {
  const pad = 12;
  const gap = 10;
  const estWidth = Math.min(320, window.innerWidth - pad * 2);
  return {
    top: trigger.bottom + gap,
    left: Math.max(
      pad,
      Math.min(
        trigger.left + trigger.width / 2 - estWidth / 2,
        window.innerWidth - pad - estWidth
      )
    ),
  };
}

function computeBubblePosition(
  trigger: HTMLElement,
  bubble: HTMLElement
): { top: number; left: number } {
  const tRect = trigger.getBoundingClientRect();
  const bRect = bubble.getBoundingClientRect();
  const pad = 12;
  const gap = 10;

  const bubbleWidth =
    bRect.width || bubble.offsetWidth || Math.min(320, window.innerWidth - pad * 2);
  const bubbleHeight = bRect.height || bubble.offsetHeight || 48;

  const fitsAbove = tRect.top - bubbleHeight - gap >= pad;
  let top = fitsAbove
    ? tRect.top - bubbleHeight - gap
    : tRect.bottom + gap;

  let left = tRect.left + tRect.width / 2 - bubbleWidth / 2;
  left = Math.max(pad, Math.min(left, window.innerWidth - pad - bubbleWidth));

  if (top < pad) top = pad;
  if (top + bubbleHeight > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - pad - bubbleHeight);
  }

  return { top, left };
}

function usePrefersHover() {
  const [prefersHover, setPrefersHover] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setPrefersHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return prefersHover;
}

/**
 * Viewport-aware info tooltip. Renders the callout in a portal with fixed
 * positioning so parent overflow/stacking contexts cannot clip the bubble.
 */
export function InfoTooltip({ text, theme = "light", className = "" }: Props) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const prefersHover = usePrefersHover();
  const s = themeStyles[theme];

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return false;

    setCoords(computeBubblePosition(trigger, bubble));
    return true;
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    if (trigger) {
      setCoords(provisionalCoords(trigger.getBoundingClientRect()));
    }

    if (updatePosition()) return;

    let frame = 0;
    let attempts = 0;
    const retry = () => {
      if (updatePosition()) return;
      attempts += 1;
      if (attempts < 6) {
        frame = window.requestAnimationFrame(retry);
      }
    };
    frame = window.requestAnimationFrame(retry);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open, text, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    window.visualViewport?.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.visualViewport?.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || prefersHover) return;

    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown);
  }, [open, prefersHover]);

  const bubbleClassName = `ds-z-tooltip pointer-events-none w-[min(20rem,calc(100vw-1.5rem))] max-w-sm whitespace-normal rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed font-medium text-left ${s.bubble}`;

  const bubble =
    open && typeof document !== "undefined" ? (
      <div
        ref={bubbleRef}
        id={tooltipId}
        role="tooltip"
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
        }}
        className={bubbleClassName}
      >
        {text}
      </div>
    ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        className={`group/tip relative inline-flex cursor-help align-middle ${className}`}
        onMouseEnter={() => {
          if (prefersHover) setOpen(true);
        }}
        onMouseLeave={() => {
          if (prefersHover) setOpen(false);
        }}
        onFocus={() => {
          if (prefersHover) setOpen(true);
        }}
        onBlur={() => {
          if (prefersHover) setOpen(false);
        }}
        onClick={(event) => {
          if (prefersHover) return;
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        tabIndex={0}
        role="button"
        aria-label="More information"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
      >
        <span className={s.icon}>{ICON}</span>
      </span>
      {bubble ? createPortal(bubble, document.body) : null}
    </>
  );
}
