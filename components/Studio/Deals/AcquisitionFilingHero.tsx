"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import type { useAcquisitionDealExecution } from "@/hooks/useAcquisitionDealExecution";
import { ACQUISITION_FILING_STEPS } from "@/lib/acquisition-filing-timeline";
import {
  acquisitionActionBodyClass,
  acquisitionActionPanelClass,
  acquisitionActionTitleClass,
  acquisitionExceptionBodyClass,
  acquisitionExceptionPanelClass,
  acquisitionExceptionTitleClass,
  acquisitionPhaseStampClass,
  acquisitionStepCardClass,
  acquisitionStepMarkerClass,
  acquisitionStepSemanticEvent,
  acquisitionStepTitleClass,
} from "@/lib/acquisition-filing-visual";
import { acquisitionFilingPhaseLabel } from "@/lib/acquisition-deal-labels";
import { resolveAcquisitionFilingUiState } from "@/lib/deal-action-state";
import { dealExecutionKind } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";
import { semanticTextClass } from "@/lib/registry-semantic-signals";
import {
  consequenceSurfaceFromTarget,
  triggerConsequenceFeedback,
} from "@/lib/consequence-feedback-runtime";
import { semanticMotionClass, semanticMotionClassForEvent } from "@/styles/semantic-motion";
import { registryLedgerHref } from "@/lib/registry-nav";
import { primeCreativeSectionFromUrlQuery } from "@/lib/studio-nav/creative-nav";
import { studioV2 } from "@/styles/studio-v2";

type ArtworkPreview = {
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  medium: string | null;
  year: string | number | null;
};

type ExecutionControl = ReturnType<typeof useAcquisitionDealExecution>;

type Props = {
  deal: DealRow;
  userId: string;
  execution: ExecutionControl;
  onExecuted?: (executingDealId: string) => void;
};

function stepStatus(
  index: number,
  currentIndex: number,
  allComplete: boolean
): "complete" | "current" | "upcoming" {
  if (allComplete || index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}

export function AcquisitionFilingHero({
  deal,
  userId,
  execution,
  onExecuted,
}: Props) {
  const sb = useSupabaseBrowserLazy();
  const artworkId = String(deal.artwork_id ?? "").trim();
  const [artwork, setArtwork] = useState<ArtworkPreview | null>(null);
  const executeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    executionState,
    loadingExecution,
    busy,
    error,
    executeAcquisition,
  } = execution;

  useEffect(() => {
    if (!artworkId) {
      setArtwork(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data } = await sb()
        .from("artworks")
        .select("title, registry_id, image_url, medium, year")
        .eq("id", artworkId)
        .maybeSingle();

      if (!cancelled && data) {
        setArtwork(data as ArtworkPreview);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [artworkId, sb]);

  const registryIdFromArtwork = String(artwork?.registry_id ?? "").trim() || null;

  const ui = useMemo(
    () =>
      resolveAcquisitionFilingUiState({
        deal,
        userId,
        executionState,
        loadingExecution,
        registryId: registryIdFromArtwork,
      }),
    [deal, userId, executionState, loadingExecution, registryIdFromArtwork]
  );

  const {
    timeline,
    lifecycleComplete,
    allComplete,
    executionUnavailable,
    showSellerExecuteCta,
    showBuyerCta,
    showTransferBlockedPanel,
    showVerifyArtworkCta,
    buyerAcceptHref,
    verifyArtworkHref,
    ledgerHref,
  } = ui;

  const loop = executionState?.ownership_loop;
  const filingPhase =
    lifecycleComplete && !executionState
      ? "Ownership recorded"
      : acquisitionFilingPhaseLabel(executionState);

  const handleExecute = async () => {
    const executingDealId = deal.id;
    const ok = await executeAcquisition();
    if (!ok) return;
    const target = executeButtonRef.current;
    triggerConsequenceFeedback("marketCommit", {
      target,
      surface:
        consequenceSurfaceFromTarget(target) ??
        (target?.closest("[data-seller-cta-wrapper]") as HTMLElement | null),
    });
    onExecuted?.(executingDealId);
  };

  if (!artworkId || dealExecutionKind(deal) !== "acquisition") return null;

  const title =
    String(artwork?.title ?? "").trim() ||
    String(deal.title ?? "").trim() ||
    "Linked work";

  const resolvedLedgerHref =
    ledgerHref ??
    (registryIdFromArtwork ? registryLedgerHref(registryIdFromArtwork) : null);

  const phaseStepId = allComplete ? "ownership_recorded" : timeline.currentStepId;

  return (
    <div className={`${studioV2.surface.filingSheetMajor} min-w-0 overflow-hidden`}>
      <div className="border-b border-[var(--v2-border)] px-6 py-5 md:px-8">
        <p className={`${studioV2.type.railLabel} ${semanticTextClass("sale")}`}>
          Filing on record
        </p>
        <h3 className={`${studioV2.type.sectionTitle} mt-1 text-xl md:text-2xl`}>
          Acquisition lifecycle
        </h3>
        <p className={`${studioV2.type.metaValue} mt-2 max-w-2xl`}>
          Track terms, transfer filing, buyer acceptance, and registry ownership
          for this work.
        </p>
        {filingPhase ? (
          <p className={`mt-3 inline-flex ${acquisitionPhaseStampClass(phaseStepId)}`}>
            {filingPhase}
          </p>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-hidden border-b border-[var(--v2-border)] bg-[var(--v2-cool-grey)]/5 lg:border-b-0 lg:border-r">
          <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200/80 lg:aspect-auto lg:h-full lg:max-h-[14rem] lg:min-h-[11rem]">
            {artwork?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artwork.image_url}
                alt=""
                className="h-full w-full max-w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[11rem] items-center justify-center text-[12px] text-neutral-500">
                No preview
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5 overflow-hidden p-6 md:p-8">
          <div>
            <p className={studioV2.type.metaLabel}>Linked artwork</p>
            <p className={`${studioV2.type.sectionTitle} mt-1 text-lg`}>
              {title}
            </p>
            {resolvedLedgerHref ? (
              <p className={`${studioV2.type.inboxItem} mt-1`}>
                {registryIdFromArtwork ?? executionState?.registry_id}
              </p>
            ) : null}
            {(artwork?.medium || artwork?.year) && (
              <p className={`${studioV2.type.metaValue} mt-1`}>
                {[artwork?.medium, artwork?.year].filter(Boolean).join(" · ")}
              </p>
            )}
            {resolvedLedgerHref ? (
              <Link
                href={resolvedLedgerHref}
                className="mt-2 inline-flex text-[13px] font-medium text-[var(--v2-ink)] underline decoration-[var(--v2-border-strong)] underline-offset-4 transition hover:decoration-[var(--v2-ink-muted)]"
              >
                View registry ledger
              </Link>
            ) : null}
          </div>

          {!executionUnavailable && showSellerExecuteCta ? (
            <div
              data-seller-cta-wrapper
              className={`${acquisitionActionPanelClass("sale")} ${semanticMotionClass("saleFlash")} scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px)+1.5rem)]`}
            >
              <p className={acquisitionActionTitleClass("sale")}>
                Seller action required
              </p>
              <p className={acquisitionActionBodyClass()}>
                File the acquisition transfer so the buyer can confirm receipt.
              </p>
              <button
                ref={executeButtonRef}
                type="button"
                data-seller-execute-button
                disabled={busy}
                onClick={() => void handleExecute()}
                className="v2-cta-primary mt-4 inline-flex w-full justify-center !min-h-0 px-4 py-2.5 text-[10px] sm:w-auto"
              >
                {busy ? "Filing transfer…" : "File transfer on record"}
              </button>
            </div>
          ) : null}

          {loadingExecution ? (
            <p className={studioV2.type.metaValue}>Loading filing status…</p>
          ) : executionUnavailable ? (
            <div
              className={`${acquisitionExceptionPanelClass()} ${semanticMotionClass("correctionReveal")}`}
              role="alert"
            >
              <p className={acquisitionExceptionTitleClass()}>
                Filing status unavailable.
              </p>
              <p className={acquisitionExceptionBodyClass()}>
                We could not load the acquisition execution state. Please refresh
                or retry.
              </p>
            </div>
          ) : (
            <ol className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
              {ACQUISITION_FILING_STEPS.map((step, index) => {
                const status = stepStatus(
                  index,
                  timeline.currentIndex,
                  allComplete
                );
                const isCurrent = status === "current";

                return (
                  <li
                    key={`${step.id}-${status}`}
                    className={`${acquisitionStepCardClass(step.id, status)} ${semanticMotionClassForEvent(acquisitionStepSemanticEvent(step.id))}`}
                    style={{ animationDelay: `${index * 0.07}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={acquisitionStepMarkerClass(step.id, status)}
                        aria-hidden
                      >
                        {status === "complete" ? "✓" : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={acquisitionStepTitleClass(step.id, status)}>
                          {step.label}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--v2-ink-muted)]">
                          {step.description}
                        </p>
                        {isCurrent && loop?.message ? (
                          <p className="mt-2 text-[12px] leading-relaxed text-[var(--v2-ink)]">
                            {loop.message}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {!executionUnavailable && showTransferBlockedPanel ? (
            <div
              role="alert"
              className={`${acquisitionExceptionPanelClass()} ${semanticMotionClass("correctionReveal")}`}
            >
              <p className={acquisitionExceptionTitleClass()}>
                Transfer cannot be filed yet
              </p>
              <p className={acquisitionExceptionBodyClass()}>
                {executionState?.reason}
              </p>
              {showVerifyArtworkCta ? (
                <Link
                  href={verifyArtworkHref}
                  onClick={() => {
                    if (!artworkId) primeCreativeSectionFromUrlQuery();
                  }}
                  className="v2-cta-secondary mt-4 inline-flex w-full justify-center !min-h-0 px-4 py-2.5 text-[10px] sm:w-auto"
                >
                  Verify artwork
                </Link>
              ) : null}
            </div>
          ) : null}

          {!executionUnavailable && showBuyerCta ? (
            <div
              className={`${acquisitionActionPanelClass("transfer")} ${semanticMotionClass("transferSweep")}`}
            >
              <p className={acquisitionActionTitleClass("transfer")}>
                Your action is required
              </p>
              <p className={acquisitionActionBodyClass()}>
                Confirm receipt to record ownership on the registry ledger.
              </p>
              {buyerAcceptHref ? (
                <Link
                  href={buyerAcceptHref}
                  onClick={() => {
                    triggerConsequenceFeedback("custodyCommit");
                  }}
                  className="v2-cta-primary mt-4 inline-flex w-full justify-center !min-h-0 px-4 py-2.5 text-[10px] sm:w-auto"
                >
                  {loop?.action_label ?? "Confirm receipt"}
                </Link>
              ) : resolvedLedgerHref ? (
                <Link
                  href={resolvedLedgerHref}
                  className="v2-cta-primary mt-4 inline-flex w-full justify-center !min-h-0 px-4 py-2.5 text-[10px] sm:w-auto"
                >
                  View registry record
                </Link>
              ) : (
                <p className={`${acquisitionActionBodyClass()} mt-3`}>
                  Open the confirmation link from your notification email, or
                  contact the seller to resend the invitation.
                </p>
              )}
            </div>
          ) : null}

          {allComplete && resolvedLedgerHref ? (
            <Link
              href={resolvedLedgerHref}
              className={`v2-cta-secondary inline-flex w-full justify-center !min-h-0 px-4 py-2.5 text-[10px] sm:w-auto ${semanticMotionClass("sealStamp")}`}
            >
              View recorded ownership
            </Link>
          ) : null}

          {error ? (
            <p className={`text-[12px] leading-relaxed ${semanticTextClass("correction")}`}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
