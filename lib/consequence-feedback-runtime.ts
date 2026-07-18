import {
  CONSEQUENCE_FEEDBACK_DURATION_MS,
  consequenceFeedbackBase,
  consequenceFeedbackOverlayClass,
  consequenceFeedbackSurfaceClass,
  consequenceFeedbackTargetClass,
  type ConsequenceFeedbackType,
} from "@/styles/consequence-feedback";

const OVERLAY_ID = "rrowm-consequence-overlay";

function classTokens(className: string): string[] {
  return className.split(/\s+/).filter(Boolean);
}

export type TriggerConsequenceFeedbackOptions = {
  /** Primary CTA (compress / acknowledge) */
  target?: HTMLElement | null;
  /** Panel or modal surface (heat glow, sweep, seal) */
  surface?: HTMLElement | null;
};

export function prefersReducedConsequenceFeedback(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureOverlay(): HTMLDivElement {
  let overlay = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("aria-hidden", "true");
    overlay.className = consequenceFeedbackBase.overlay;
    document.body.appendChild(overlay);
  }
  return overlay;
}

/**
 * Fire institutional consequence feedback for a consequential registry action.
 * No-op content change — visual acknowledgement only.
 */
export function triggerConsequenceFeedback(
  type: ConsequenceFeedbackType,
  options: TriggerConsequenceFeedbackOptions = {}
): void {
  if (typeof document === "undefined") return;

  const reduced = prefersReducedConsequenceFeedback();
  const duration = reduced ? 1 : CONSEQUENCE_FEEDBACK_DURATION_MS[type];
  const { target, surface } = options;

  if (target) {
    const targetClasses = classTokens(consequenceFeedbackTargetClass(type));
    target.classList.add(...targetClasses);
    if (reduced) {
      target.classList.add("v2-consequence-target--reduced");
    }
    window.setTimeout(() => {
      target.classList.remove(
        ...targetClasses,
        "v2-consequence-target--reduced"
      );
    }, duration);
  }

  if (surface) {
    const surfaceClasses = classTokens(consequenceFeedbackSurfaceClass(type));
    surface.classList.add(...surfaceClasses);
    window.setTimeout(() => {
      surface.classList.remove(...surfaceClasses);
    }, duration);
  }

  if (reduced) return;

  const overlay = ensureOverlay();
  overlay.className = consequenceFeedbackOverlayClass(type);

  if (type === "registryCommit") {
    document.body.classList.add(consequenceFeedbackBase.lock);
    window.setTimeout(() => {
      document.body.classList.remove(consequenceFeedbackBase.lock);
    }, 150);
  }

  window.setTimeout(() => {
    overlay.className = consequenceFeedbackBase.overlay;
  }, CONSEQUENCE_FEEDBACK_DURATION_MS[type]);
}

/** Resolve nearest modal filing surface from a button */
export function consequenceSurfaceFromTarget(
  target: HTMLElement | null | undefined
): HTMLElement | null {
  if (!target) return null;
  return (
    target.closest(".studio-modal-paper") ??
    target.closest(".v2-surface-paper") ??
    target.closest("[data-consequence-surface]") ??
    null
  );
}
