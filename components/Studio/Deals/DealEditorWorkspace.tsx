"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DealCounterpartyPicker,
  type ResolvedDealCounterparty,
} from "@/components/Deals/DealCounterpartyPicker";
import { DealIntentSelector } from "@/components/Deals/DealIntentSelector";
import { DealProposalReview } from "@/components/Deals/DealProposalReview";
import { DealTermsForm } from "@/components/Deals/DealTermsForm";
import { DealEditorSectionNav } from "@/components/Studio/Deals/DealEditorSectionNav";
import type { NewDealDraftPreset } from "@/lib/deal-create-nav";
import { acquisitionDealWorkLabel } from "@/lib/acquisition-deal-counterparty";
import { DEAL_PARTICIPANT_FALLBACK } from "@/lib/deal-participant-labels";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import {
  DEAL_EDITOR_CORRESPONDENCE_CLASS,
  DEAL_EDITOR_SECTION_CARD,
  dealEditorSections,
  type DealEditorSectionId,
} from "@/lib/deal-editor";
import { studioFilingForm } from "@/styles/studio-filing-form";
import { studioV2 } from "@/styles/studio-v2";
import {
  buildDealTermsPayload,
  buildDealTitle,
  getDealIntent,
  type DealIntent,
  type DealIntentId,
  validateDealTerms,
} from "@/lib/deal-intents";

type Props = {
  userId: string;
  preset: NewDealDraftPreset;
  onBack: () => void;
};

function emptyTermValues(intent: DealIntent | null): Record<string, string> {
  if (!intent) return {};
  return Object.fromEntries(intent.fields.map((field) => [field.key, ""]));
}

function termValuesForIntent(
  intent: DealIntent | null,
  preset: NewDealDraftPreset
): Record<string, string> {
  const values = emptyTermValues(intent);
  if (!intent) return values;

  const workLabel =
    String(preset.artworkTitle ?? "").trim() ||
    (preset.artworkId ? preset.artworkId : "");

  if (workLabel && intent.id === "acquisition_interest") {
    values.subject = workLabel;
  }

  return values;
}

export function DealEditorWorkspace({ userId, preset, onBack }: Props) {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const sectionRefs = useRef<Partial<Record<DealEditorSectionId, HTMLElement | null>>>({});

  const presetCounterpartyId = String(preset.counterpartyUserId ?? "").trim();
  const requireCounterparty = !presetCounterpartyId;
  const sections = useMemo(() => dealEditorSections(requireCounterparty), [requireCounterparty]);

  const [intent, setIntent] = useState<DealIntent | null>(() => {
    if (preset.initialIntentId) return getDealIntent(preset.initialIntentId);
    return null;
  });
  const [selectedCounterparty, setSelectedCounterparty] =
    useState<ResolvedDealCounterparty | null>(null);
  const [termValues, setTermValues] = useState<Record<string, string>>(() => {
    const initialIntent = preset.initialIntentId
      ? getDealIntent(preset.initialIntentId)
      : null;
    return termValuesForIntent(initialIntent, preset);
  });
  const [correspondence, setCorrespondence] = useState("");
  const [activeSection, setActiveSection] = useState<DealEditorSectionId>("deal-type");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resolvedCounterpartyUserId = useMemo(() => {
    if (presetCounterpartyId) return presetCounterpartyId;
    return String(selectedCounterparty?.userId ?? "").trim();
  }, [presetCounterpartyId, selectedCounterparty?.userId]);

  const resolvedGalleryId = useMemo(() => {
    const presetGallery = String(preset.galleryId ?? "").trim();
    if (presetGallery) return presetGallery;
    return String(selectedCounterparty?.galleryId ?? "").trim() || null;
  }, [preset.galleryId, selectedCounterparty?.galleryId]);

  const counterpartyName = useMemo(() => {
    const label = String(preset.counterpartyLabel ?? "").trim();
    if (label) return label;
    const picked = String(selectedCounterparty?.label ?? "").trim();
    if (picked) return picked;
    return DEAL_PARTICIPANT_FALLBACK;
  }, [preset.counterpartyLabel, selectedCounterparty?.label]);

  const dealTitle = intent ? buildDealTitle(intent, termValues) : "";
  const displayTitle = dealTitle.trim() || "New deal";

  const completedIds = useMemo(() => {
    const done = new Set<DealEditorSectionId>();
    if (intent) done.add("deal-type");
    if (resolvedCounterpartyUserId) done.add("counterparty");
    if (intent && !validateDealTerms(intent, termValues)) done.add("terms");
    if (correspondence.trim()) done.add("correspondence");
    return done;
  }, [correspondence, intent, resolvedCounterpartyUserId, termValues]);

  const canSend = Boolean(
    intent &&
      resolvedCounterpartyUserId &&
      !validateDealTerms(intent, termValues) &&
      correspondence.trim()
  );

  const scrollToSection = useCallback((id: DealEditorSectionId) => {
    const node = sectionRefs.current[id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }, []);

  useEffect(() => {
    const artworkId = String(preset.artworkId ?? "").trim();
    const presetTitle = String(preset.artworkTitle ?? "").trim();
    if (!artworkId || presetTitle) return;

    let cancelled = false;
    void (async () => {
      try {
        const { data } = await sb()
          .from("artworks")
          .select("title, registry_id")
          .eq("id", artworkId)
          .maybeSingle<{ title: string | null; registry_id: string | null }>();

        if (cancelled || !data) return;

        const label = acquisitionDealWorkLabel({
          title: data.title,
          registryId: data.registry_id,
        });
        if (!label) return;

        setTermValues((prev) => {
          if (String(prev.subject ?? "").trim()) return prev;
          return { ...prev, subject: label };
        });
      } catch {
        // ignore — manual entry still available
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [preset.artworkId, preset.artworkTitle, sb]);

  useEffect(() => {
    const nodes = sections
      .map((section) => sectionRefs.current[section.id])
      .filter((node): node is HTMLElement => Boolean(node));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.getAttribute("data-section-id");
        if (top) setActiveSection(top as DealEditorSectionId);
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [sections]);

  const handleIntentSelect = (next: DealIntent) => {
    setIntent(next);
    setTermValues(termValuesForIntent(next, preset));
    setError(null);
  };

  const handleTermChange = (key: string, value: string) => {
    setTermValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const submit = async () => {
    if (!intent) {
      scrollToSection("deal-type");
      setError("Select a deal type before sending.");
      return;
    }

    if (!resolvedCounterpartyUserId) {
      scrollToSection(requireCounterparty ? "counterparty" : "deal-type");
      setError("Resolve a counterparty profile before sending.");
      return;
    }

    const validationError = validateDealTerms(intent, termValues);
    if (validationError) {
      scrollToSection("terms");
      setError(validationError);
      return;
    }

    const messageBody = correspondence.trim();
    if (!messageBody) {
      scrollToSection("correspondence");
      setError("Write an opening message before sending.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const terms = buildDealTermsPayload(intent, termValues);
      const title = buildDealTitle(intent, termValues);

      const createRes = await fetch("/api/deals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_a_user_id: userId,
          participant_b_user_id: resolvedCounterpartyUserId,
          type: intent.dealType,
          title,
          terms,
          artwork_id: preset.artworkId,
          gallery_id: resolvedGalleryId,
        }),
      });

      const createPayload = (await createRes.json().catch(() => ({}))) as {
        deal?: { id?: string };
        error?: string;
      };

      if (!createRes.ok || !createPayload.deal?.id) {
        setError(createPayload.error || `Could not create deal (${createRes.status}).`);
        return;
      }

      const dealId = String(createPayload.deal.id);

      const messageRes = await fetch(`/api/deals/${encodeURIComponent(dealId)}/message`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageBody }),
      });

      const messagePayload = (await messageRes.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!messageRes.ok) {
        setError(messagePayload.error || `Could not record message (${messageRes.status}).`);
        return;
      }

      const proposeRes = await fetch(`/api/deals/${encodeURIComponent(dealId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "proposed" }),
      });

      const proposePayload = (await proposeRes.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!proposeRes.ok) {
        setError(proposePayload.error || `Could not send proposal (${proposeRes.status}).`);
        return;
      }

      router.push(`/studio/deals?deal=${encodeURIComponent(dealId)}`);
    } catch {
      setError("Could not send proposal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${studioV2.scope} min-h-0`}>
      <header className={`${studioV2.surface.filingSheetMajor} sticky top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-20 mb-8 px-6 py-6 sm:px-8 sm:py-7`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              disabled={busy}
              className="v2-type-mono text-[10px] uppercase tracking-[0.14em] text-[var(--v2-ink-muted)] transition hover:text-[var(--v2-ink)] disabled:opacity-50"
            >
              ← Back to deals
            </button>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-2xl font-normal tracking-tight text-[var(--v2-ink)] md:text-[1.85rem]">
                {displayTitle}
              </h2>
              <span className="rounded-full border border-[var(--v2-border)] bg-white/80 px-2.5 py-0.5 v2-type-mono text-[10px] uppercase tracking-[0.12em] text-[var(--v2-ink-muted)]">
                Draft proposal
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--v2-ink-muted)]">
              Draft a formal proposal for a trusted cultural transaction on the registry.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled={busy || !canSend}
              onClick={() => void submit()}
              className="v2-cta-primary min-h-[44px] px-5 py-2.5 text-xs disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send proposal"}
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mb-6 rounded-lg border border-[var(--v2-amber-exception-dim)] bg-[var(--v2-amber-exception-dim)]/30 px-4 py-3">
          <p className="text-sm leading-relaxed text-[var(--v2-ink)]">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(200px,16rem)_minmax(0,1fr)] lg:items-start">
        <DealEditorSectionNav
          sections={sections}
          activeId={activeSection}
          completedIds={completedIds}
          onSelect={scrollToSection}
        />

        <div className="min-w-0 space-y-8 pb-16 lg:max-w-3xl">
          <section
            id="deal-type"
            data-section-id="deal-type"
            ref={(node) => {
              sectionRefs.current["deal-type"] = node;
            }}
            className={DEAL_EDITOR_SECTION_CARD}
          >
            <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              Deal type
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Choose the formal intent for this proposal. Each type files different terms on the
              deal record.
            </p>
            <div className="mt-6">
              <DealIntentSelector
                selectedId={(intent?.id ?? null) as DealIntentId | null}
                onSelect={handleIntentSelect}
              />
            </div>
          </section>

          {requireCounterparty ? (
            <section
              id="counterparty"
              data-section-id="counterparty"
              ref={(node) => {
                sectionRefs.current.counterparty = node;
              }}
              className={DEAL_EDITOR_SECTION_CARD}
            >
              <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                Counterparty
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Identify the Field participant this proposal is addressed to.
              </p>
              <div className="mt-6">
                <DealCounterpartyPicker
                  value={selectedCounterparty}
                  onChange={(next) => {
                    setSelectedCounterparty(next);
                    setError(null);
                  }}
                  excludeUserId={userId}
                />
              </div>
            </section>
          ) : (
            <section
              id="counterparty"
              data-section-id="counterparty"
              ref={(node) => {
                sectionRefs.current.counterparty = node;
              }}
              className={DEAL_EDITOR_SECTION_CARD}
            >
              <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                Counterparty
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                This proposal is addressed to the participant below.
              </p>
              <div className="mt-6 rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-4 py-4">
                <p className="text-sm font-medium text-neutral-900">{counterpartyName}</p>
              </div>
            </section>
          )}

          <section
            id="terms"
            data-section-id="terms"
            ref={(node) => {
              sectionRefs.current.terms = node;
            }}
            className={DEAL_EDITOR_SECTION_CARD}
          >
            <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              Terms
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Define the commercial and documentary terms that will appear on the deal record.
            </p>
            <div className="mt-6">
              {intent ? (
                <DealTermsForm
                  intent={intent}
                  values={termValues}
                  onChange={handleTermChange}
                  embedded
                />
              ) : (
                <p className="text-sm text-neutral-500">Select a deal type to define terms.</p>
              )}
            </div>
          </section>

          <section
            id="correspondence"
            data-section-id="correspondence"
            ref={(node) => {
              sectionRefs.current.correspondence = node;
            }}
            className={DEAL_EDITOR_SECTION_CARD}
          >
            <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              Opening correspondence
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Draft the first entry in the negotiation ledger. Addressed to {counterpartyName}.
            </p>
            <div className="mt-6">
              <label htmlFor="deal-opening-correspondence" className="text-sm font-medium text-neutral-700">
                Opening letter
              </label>
              <textarea
                id="deal-opening-correspondence"
                value={correspondence}
                onChange={(e) => {
                  setCorrespondence(e.target.value);
                  setError(null);
                }}
                placeholder="Introduce the proposal, context, and next steps."
                className={DEAL_EDITOR_CORRESPONDENCE_CLASS}
                maxLength={4000}
              />
              <p className="mt-2 text-xs text-neutral-500">
                {correspondence.trim().length.toLocaleString()} / 4,000
              </p>
            </div>
          </section>

          <section
            id="review"
            data-section-id="review"
            ref={(node) => {
              sectionRefs.current.review = node;
            }}
            className="scroll-mt-32"
          >
            <div className="mb-6">
              <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                Review
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Confirm the proposal before it is issued to the counterparty.
              </p>
            </div>
            {intent ? (
              <DealProposalReview
                intent={intent}
                title={dealTitle}
                terms={termValues}
                correspondence={correspondence}
                counterpartyLabel={counterpartyName}
              />
            ) : (
              <p className="text-sm text-neutral-500">Complete the sections above to review.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
