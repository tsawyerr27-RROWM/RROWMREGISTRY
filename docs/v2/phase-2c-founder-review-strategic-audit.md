# Phase 2C Founder Review — Strategic Direction Audit

**Branch reviewed:** `pr/phase2c-foundation`  
**Audit date:** 31 May 2026  
**Status:** ACCEPTED — revisions applied in governance package v0.2  
**Verdict (original):** Revise before freeze  
**Verdict (post-revision):** Ready for founder sign-off on v0.3 documents — **READY FOR FREEZE** pending founder signature

---

## Platform vision under review

> RROWM is a matching marketplace powered by Registry-backed trust, purpose-built for arts, culture and creative production.

## Executive summary (original findings)

The v0.1 Phase 2C package was internally coherent as **opportunity workflow software** but **not aligned** with the stated long-term vision of a **Registry-backed matching marketplace for arts and culture**.

**Primary centre of gravity (v0.1):** Organisation → publish brief → receive applications → award → commission (Model A).

**Required centre of gravity:** Discovery → trust-qualified matching → opportunity → commission → Registry outcome (Model B).

**Original recommendation:** Revise before freeze.

---

## Section A — Centre of gravity (v0.1 evidence)

| Signal | Model A (workflow) | Model B (matching) |
|--------|-------------------|-------------------|
| North-star | Publish → apply → award | Trust-qualified discovery → apply with evidence |
| ADR-03 | Opportunity = language only | Opportunity = taxonomy root |
| Matching | Filters only; no eligibility surfacing | Practice + sector + footprint eligibility |
| Success metrics | Apply conversion, award rate | Eligibility fit + registry outcome path |

**Conclusion:** v0.1 chose workflow-first. v0.2 rebalances toward matching marketplace while retaining workflow audit trail.

---

## Section B — Gap analysis

| Drift risk | v0.1 lean | v0.2 mitigation |
|------------|-----------|-----------------|
| Generic job board | High | Opportunities vocabulary; cultural presentation principles |
| Procurement portal | Medium–high | Rename fabrication type; cultural framing |
| Grants management | Medium | Programme-as-season language |
| Workflow SaaS | Highest | Registry evidence at apply/review; eligibility matching |

**Missing in v0.1:** Sector, registry footprint as matching signal, cultural presentation guardrails, Creative eligibility surfacing.

---

## Section C — Differentiation

**Moat:** Registry verification, practice + registry-evidence lineage, deterministic graph, commission → Record bridge (2D).

**Generic in v0.1:** Brief/application/award chain, open-calls browse, subscription-gated publish without cultural framing.

**v0.2 change:** Registry evidence first-class at apply/review; rule-based eligibility matching.

---

## Section D — Collaboration

| Relationship | v0.1 | v0.2 |
|--------------|------|------|
| Creative ↔ Organisation | Strong | Unchanged |
| Creative ↔ Creative | Deferred 2D | **Planned opportunity kind** in taxonomy |
| Organisation ↔ Organisation | None | Deferred 2E |
| Project ↔ Team | 2D | Unchanged |

---

## Section E — Opportunity model recommendation

**Recommendation:** Modify model — retain Application, Award, Commission; elevate **Opportunity** to canonical taxonomy root; add **Opportunity kinds** including deferred collaboration types.

**Applied in v0.2:** See blueprint §Opportunity taxonomy and founder freeze §1.

---

## Section F — Cultural presentation

v0.1 was too transactional. v0.2 adds **cultural presentation principles** (blueprint + freeze + spec AC-CP*).

---

## Section G — Canonical user journey (2C)

**Primary journey:**

Creative → discover opportunity through practice-, sector-, and trust-qualified Field discovery → apply in Studio with registry-evidence portfolio → Organisation reviews with verified work context → award → commission (handoff to 2D Project + Record filing).

---

## Section H — Founder decisions (resolved for v0.2)

| # | Decision | Resolution (v0.2) |
|---|----------|-------------------|
| 1 | Strategic centre | **Matching marketplace slice 1** — co-equal with auditable workflow |
| 2 | Matching definition | **Rule-based eligibility matching** in 2C — Studio surfacing of eligible briefs; no algorithmic rank |
| 3 | Sector taxonomy | **In 2C scope** — closed taxonomy aligned with Product Blueprint v1.1 §3 |
| 4 | Opportunity taxonomy | **Modify ADR-03** — canonical taxonomy root; Brief primary publishable subtype |
| 5 | Loop boundary | **Opportunity Loop Slice 1** ends at Commission; Project + Record filing in 2D (full loop) |
| 6 | Collaboration | **Planned kinds** in taxonomy; implementation deferred 2D |
| 7 | Registry at matching | **Required** — registry-evidence portfolio at apply/review (AC-RE*) |
| 8 | Cultural framing | **Cultural presentation principles** adopted (AC-CP*) |
| 9 | Publish gate | **Verified org required** for public listing; subscription does not block first cultural publish in 2C |
| 10 | Public vocabulary | **Opportunities** primary (`/field/opportunities`); open call as kind/filter |

---

## Section I — Freeze finalisation resolutions (v0.3)

| # | Topic | Resolution |
|---|-------|------------|
| 1 | **Originator model** | §1a founder freeze — Organisation-only publisher in 2C; Creative originator in 2D; Collector in 2E; representation does not change originator semantics |
| 2 | **Sector eligibility** | **Culture = wildcard** — AC-SC5; single sector per Brief; multi-sector Creative profile; multi-sector Briefs deferred |
| 3 | **Collaboration boundary** | §11c founder freeze + spec §6d — 2C Creative ↔ Organisation; 2D Creative ↔ Creative + Project ↔ Team; kinds strategic not implementation |

---

## Required document edits (completed in v0.3)

| Document | Status |
|----------|--------|
| phase-2c-opportunity-layer-blueprint.md | Updated v0.3 |
| phase-2c-founder-decisions-freeze.md | Updated v0.3 |
| phase-2c-opportunity-layer-spec.md | Updated v0.3 |
| phase-2c-pr1-plan.md | Updated v0.3 |
| DOCUMENT_GOVERNANCE.md | Updated |

---

## Final recommendation

**Proceed to freeze** on v0.3 documents after founder confirms Section H and Section I resolutions.

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2c-opportunity-layer-blueprint.md](./phase-2c-opportunity-layer-blueprint.md) | Revised architecture |
| [phase-2c-founder-decisions-freeze.md](./phase-2c-founder-decisions-freeze.md) | Decisions for sign-off |
| [phase-2c-opportunity-layer-spec.md](./phase-2c-opportunity-layer-spec.md) | Acceptance criteria |
