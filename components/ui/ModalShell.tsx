import { ReactNode } from "react";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName: string;
  overlayClassName?: string;
  closeClassName?: string;
};

export default function ModalShell({
  isOpen,
  onClose,
  children,
  panelClassName,
  overlayClassName = "liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-6 transition-opacity duration-300 ease-out md:p-8",
  closeClassName =
    "liquid-glass-close absolute right-5 top-5 z-10 rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 transition duration-200 ease-out hover:bg-white/75 hover:text-neutral-900 md:right-6 md:top-6",
}: ModalShellProps) {
  if (!isOpen) return null;

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div
        className={`ds-z-modal relative ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={closeClassName}
          aria-label="Close modal"
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}

