# Phase 2C PR1 — Opportunity Foundation Plan

**Document status:** DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Phase 2C Opportunity Layer Spec](./phase-2c-opportunity-layer-spec.md) (LOCKED DRAFT), [Phase 2C Founder Decisions Freeze](./phase-2c-founder-decisions-freeze.md) (DRAFT), [Phase 2C Opportunity Layer Blueprint](./phase-2c-opportunity-layer-blueprint.md) (DRAFT), [Phase 2B Discovery Expansion Plan](./phase-2b-discovery-expansion-plan.md) (DRAFT)  
**Scope:** **Product planning only** — defines PR1 train boundaries, dependencies, and acceptance focus. **No database schema, no API definitions, no file lists, no implementation tasks.**

**Effect:** This document governs **what PR1 must achieve in product terms** before an engineering execution package is authored. Engineering plans are **out of scope** until founder freeze is FROZEN and spec is LOCKED.

---

## Purpose

Plan **Phase 2C PR1 — Opportunity Foundation**: the first implementation train after governance approval. PR1 establishes **programme and brief publishing** and **public opportunities discovery as matching surfaces** — the read path for trust-qualified matching — without applications, awards, or commissions.

**PR1 north-star:**

> Organisations can **draft and publish** programmes and briefs in Studio; anonymous visitors can **discover and read** published opportunities on Field as **matching surfaces** (sector, practices, org footprint, registry outcome expectation) through explainable filters — with no apply flow, no inbox, and no commission objects yet.

---

## Prerequisites (gates before PR1 engineering)

| Gate | Requirement |
|------|-------------|
| G-2B | Phase 2B merged; `checkpoint-phase2b-field-discovery` tagged (or waived with documented delta) |
| G-FRZ | [phase-2c-founder-decisions-freeze.md](./phase-2c-founder-decisions-freeze.md) promoted **FROZEN** |
| G-SPC | [phase-2c-opportunity-layer-spec.md](./phase-2c-opportunity-layer-spec.md) promoted **LOCKED** |
| G-ADR | ADR-01–08 disposition accepted in founder freeze §13 |
| G-REG | Registry registration/verify smoke pass — no 2B regression |

**Do not open implementation branches until G-FRZ + G-SPC pass.**

---

## PR1 product scope

### In scope

| Deliverable | Product outcome |
|-------------|-----------------|
| **Programme (Studio)** | Org admin/staff create, edit, draft, publish, archive programmes |
| **Brief (Studio)** | Org admin/staff create, edit, draft, publish, withdraw briefs; participation mode; sector; brief types (open call, residency/award, direct, production partner search) |
| **Publishing gates** | Verified org required for public listing; subscription does not block first publish (per founder freeze v0.2) |
| **Programme Field page** | `/field/programmes/[slug]` — season/cohort framing + linked briefs |
| **Opportunity Field page** | `/field/opportunities/[id]` — **matching surface**: sector, practices, registry outcome, org footprint |
| **Opportunities index** | `/field/opportunities` — filterable listing (practice, sector, kind, org, programme — explainable filters only) |
| **Explorer IA hook** | Opportunities entry on Field hub — Records default unchanged |
| **Graph edges** | Brief → org; brief → programme; programme → briefs; links to 2B verified records where public |
| **Cultural presentation (PR1 surfaces)** | AC-CP1–AC-CP5 copy guardrails on public pages |
| **i18n (PR1 surfaces)** | Locale keys for PR1 public copy |

### Out of scope (PR1)

| Exclusion | Train |
|---------|-------|
| Application submit / review | PR2 |
| Award / Commission | PR3 |
| Studio inbox notifications | PR3 |
| Apply CTA execution (beyond “sign in to apply — coming soon” stub **disallowed** — omit apply until PR2) | PR2 |
| Payments, subscription checkout UI | 2E |
| Production, messaging | 2D+ |
| Registry filing | 2D |

**Placeholder rule:** PR1 opportunity pages are **matching surfaces** — trust and cultural context before transactional detail. Default is **read-only**; no broken apply button. Copy may state applications open in a subsequent release only if founder approves interim messaging.

---

## PR1 acceptance focus

PR1 exit requires subset of spec AC-*:

| Group | PR1 criteria |
|-------|--------------|
| **AC-PG*** | AC-PG1–AC-PG5 |
| **AC-BR*** | AC-BR1–AC-BR5, AC-BR7, AC-BR9 (direct/apply deferred — AC-BR6, AC-BR8 → PR2) |
| **AC-SC*** | AC-SC1–AC-SC2 (Creative profile sectors + AC-SC3–AC-SC5 → PR2 with apply/eligibility) |
| **AC-OC*** | AC-OC1–AC-OC7 |
| **AC-CP*** | AC-CP1–AC-CP5 (PR1 public surfaces) |
| **AC-GN*** | AC-GN1–AC-GN3 (opportunity edges only); AC-GN4 regression |
| **AC-VT*** | AC-VT1–AC-VT2 (opportunity surfaces) |
| **AC-SR*** | AC-SR1, AC-SR3 (no Registry mutation; 2B search unchanged) |

Full 2C gate requires PR2–PR4 trains.

---

## Rollout sequence (product steps)

PR1 is **Step 1** of the 2C rollout. Subsequent trains are product-scoped here for context — not implemented in PR1.

```
Step 0  Governance lock (founder freeze + spec LOCKED)
    │
    └── Step 1  PR1 — Programmes + briefs + opportunities matching surfaces  ← this plan
              │
              └── Step 2  PR2 — Applications (Studio apply + org review)
                        │
                        └── Step 3  PR3 — Awards + commissions + notifications
                                  │
                                  └── Step 4  PR4 — Acceptance, audit, checkpoint tag
```

### Step 1 — PR1 product steps

| Step | Product increment | Exit signal |
|------|-------------------|-------------|
| 1.1 | Studio programme CRUD (draft/publish/archive) | AC-PG1, AC-PG2 |
| 1.2 | Studio brief CRUD + participation mode + **single sector** + types | AC-BR1–AC-BR3, AC-BR9, AC-SC1 |
| 1.3 | Publish gates (verified org; no subscription block on first publish) | AC-BR7 |
| 1.4 | Field programme page | AC-PG3–AC-PG5, AC-CP2 |
| 1.5 | Field opportunity detail — matching surface | AC-BR4, AC-OC7, AC-CP* |
| 1.6 | Opportunities index + filters (practice, sector, kind) | AC-OC1–AC-OC6, AC-SC2 |
| 1.7 | Hub IA + graph edges to 2B profiles/records | AC-GN1–AC-GN3 |
| 1.8 | Trust copy on opportunity surfaces | AC-VT1–AC-VT2 |
| 1.9 | i18n pass for PR1 strings | Step 12 discipline |
| 1.10 | PR1 acceptance notes + static regression vs 2B | PR1 signoff doc |

**Parallel forbidden:** Application or award UI in PR1.

---

## Dependencies on Phase 2B

| 2B capability | PR1 reliance |
|-------------|--------------|
| Practice taxonomy | Brief practice requirements + filter |
| Sector taxonomy | Brief sector + opportunities filter |
| Organisation presence | Publisher footprint on matching surfaces |
| Record footprint | Links to verified records on opportunity detail where public |
| Field explorer IA | Hub extension for opportunities |
| Verified-default / search | Must not regress |
| Graph patterns | Extend — do not replace context panels |

---

## Anti-feature enforcement (PR1)

PR1 must not introduce:

- Apply/submit flows (PR2)
- Award/commission objects (PR3)
- Payments, escrow, marketplace CTAs
- Messaging or chat
- Recommendations or auto-matching
- Application counts on cards
- Field Registry writes

---

## Validation expectations (product level)

Before PR1 merge to main:

| Check | Expectation |
|-------|-------------|
| 2B regression | Record/Creative/Org explorers unchanged in behaviour |
| Registry smoke | No registration/verify regression |
| Anti-feature grep | No excluded UI on `/field` |
| Opportunities filters | Explainable AND composition only; sector + practice |
| Private org profile | Brief still readable; org link omitted when profile private (AC-GN3) |

Engineering validation commands are defined in the **execution package** — not in this document.

---

## Deliverables (PR1 governance)

| Deliverable | Owner |
|-------------|-------|
| PR1 acceptance notes | Engineering + product |
| PR1 signoff mapping to AC-PG/BR/OC/GN | Product |
| Staging QA: publish brief → visible on opportunities index with sector + matching surface | Product |
| Engineering execution package | **Separate doc after spec LOCKED** |

---

## Checkpoint recommendation

| Tag | When |
|-----|------|
| `checkpoint-phase2c-pr1-opportunity-foundation` | Optional interim tag after PR1 staging pass |
| `checkpoint-phase2c-field-opportunity` | **Full 2C only** after PR4 acceptance |

Do not tag full 2C checkpoint at PR1.

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2c-opportunity-layer-spec.md](./phase-2c-opportunity-layer-spec.md) | Full AC source |
| [phase-2c-founder-decisions-freeze.md](./phase-2c-founder-decisions-freeze.md) | Philosophy |
| [phase-2c-opportunity-layer-blueprint.md](./phase-2c-opportunity-layer-blueprint.md) | Architecture |
| [phase-2b-pr4-acceptance-signoff.md](./phase-2b-pr4-acceptance-signoff.md) | Predecessor |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2C PR1 product plan |
| 0.2 | 31 May 2026 | DRAFT | Founder review revision — matching surfaces, opportunities routes, sector, cultural presentation |
| 0.3 | 31 May 2026 | DRAFT | Aligned with freeze finalisation — single-sector brief, Culture wildcard deferred to PR2 eligibility |
