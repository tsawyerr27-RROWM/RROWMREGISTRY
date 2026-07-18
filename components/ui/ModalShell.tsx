"use client";

import { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { studioV2 } from "@/styles/studio-v2";
import { workspaceModal } from "@/styles/workspace-design";

export type ModalTone = "light" | "dark" | "silver";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  innerClassName?: string;
  overlayClassName?: string;
  closeClassName?: string;
  tone?: ModalTone;
  ariaLabel?: string;
  /** Use v2 glass shell + paper inner (default for studio filing modals) */
  variant?: "v2" | "legacy";
};

const legacyTonePresets: Record<
  ModalTone,
  { overlay: string; panelGlass: string; panelSize: string; close: string }
> = {
  light: {
    overlay: workspaceModal.overlay,
    panelGlass: workspaceModal.panelGlassLight,
    panelSize: workspaceModal.panelSize,
    close: workspaceModal.closeLight,
  },
  dark: {
    overlay: workspaceModal.overlay,
    panelGlass: workspaceModal.panelGlassDark,
    panelSize: `${workspaceModal.panelSize} text-white`,
    close: workspaceModal.closeDark,
  },
  silver: {
    overlay: workspaceModal.overlaySilver,
    panelGlass: workspaceModal.panelGlassSilver,
    panelSize: workspaceModal.panelSize,
    close: workspaceModal.closeSilver,
  },
};

const subscribeToClient = () => () => {};

export default function ModalShell({
  isOpen,
  onClose,
  children,
  panelClassName,
  innerClassName,
  overlayClassName,
  closeClassName,
  tone = "light",
  ariaLabel = "Dialog",
  variant = "v2",
}: ModalShellProps) {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) =>
          !element.hasAttribute("hidden") &&
          element.getClientRects().length > 0 &&
          !element.closest('[inert],[aria-hidden="true"]')
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  if (variant === "legacy") {
    const preset = legacyTonePresets[tone];
    return createPortal(
      <div
        className={overlayClassName ?? preset.overlay}
        onClick={onClose}
        role="presentation"
      >
        <div
          ref={panelRef}
          className={[
            "ds-z-modal relative rrowm-modal-surface mx-auto w-full shrink-0",
            preset.panelGlass,
            panelClassName ?? preset.panelSize,
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          tabIndex={-1}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className={closeClassName ?? preset.close}
            aria-label="Close"
          >
            Close
          </button>
          {children}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className={overlayClassName ?? studioV2.modal.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={[
          "ds-z-modal relative mx-auto w-full shrink-0",
          studioV2.modal.panel,
          studioV2.motion.modal,
          panelClassName ?? "max-w-2xl",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className={closeClassName ?? studioV2.modal.close}
          aria-label="Close"
        >
          Close
        </button>
        <div className={[studioV2.modal.inner, innerClassName].filter(Boolean).join(" ")}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
