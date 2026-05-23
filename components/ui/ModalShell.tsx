import { ReactNode } from "react";

import { workspaceModal } from "@/styles/workspace-design";

export type ModalTone = "light" | "dark" | "silver";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  overlayClassName?: string;
  closeClassName?: string;
  tone?: ModalTone;
};

const tonePresets: Record<
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

export default function ModalShell({
  isOpen,
  onClose,
  children,
  panelClassName,
  overlayClassName,
  closeClassName,
  tone = "light",
}: ModalShellProps) {
  if (!isOpen) return null;

  const preset = tonePresets[tone];

  return (
    <div
      className={overlayClassName ?? preset.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={[
          "ds-z-modal relative rrowm-modal-surface",
          preset.panelGlass,
          panelClassName ?? preset.panelSize,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className={closeClassName ?? preset.close}
          aria-label="Close"
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}
