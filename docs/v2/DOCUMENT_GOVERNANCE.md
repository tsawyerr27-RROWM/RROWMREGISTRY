# V2 Document Governance

**Effective:** 31 May 2026  
**Status:** Active freeze registry

This folder holds the **planning and certification stack** for RROWM V2. **Phase 1** (Studio Foundation) is frozen and production-certified. **Phase 2** (The Field) planning is in progress. Documents are authoritative in the order below within each phase.

## Document hierarchy

| Priority | Document | Status | Role |
|----------|----------|--------|------|
| 1 | [Product Blueprint v1.1](./product-blueprint-v1.1.md) | **APPROVED** | Strategic product architecture, object model, V2/V3 sequencing |
| 2 | [Phase 1 Implementation Specification](./phase-1-studio-foundation-spec.md) | **LOCKED** | What Phase 1 delivers: scope, acceptance criteria, QA, technical spec |
| 3 | [Phase 1 Feasibility Review](./phase-1-feasibility-review.md) | **IMPLEMENTATION SOURCE OF TRUTH** | How to execute Phase 1: PR breakdown, risks, dependencies, merge hotspots |
| 4 | [Product Language Freeze](./product-language-freeze.md) | **FROZEN** | Public surfaces (Studio, The Field, Registry) and participant labels (Creative, Organisation, Collector) vs internal system terms |
| 5 | [Phase 1 Route Migration Matrix](./phase-1-route-migration-matrix.md) | **FROZEN** | PR4 pre-implementation inventory: canonical `/studio/*` routes, redirects, links, post-auth paths, and grep checklist |
| 6 | [Phase 1 PR4 Execution Package](./phase-1-pr4-execution-package.md) | **FROZEN** | PR4 build steps: phases, file list, move-then-redirect order, validation and reviewer checklists (no substitute for matrix) |
| 7 | [Phase 1 Acceptance Gate](./phase-1-acceptance-gate.md) | **ACTIVE** | PR6 release candidate: automated gates, staging checklists, sign-off (not a scope document) |
| 8 | [Phase 1 Validation Waiver](./phase-1-validation-waiver.md) | **ACTIVE** | Production certification waiver for `validate:system` and `validate:replay` (harness defects); authorizes `checkpoint-phase1-production` with documented sign-off |
| 9 | [Phase 1 Scope Freeze](./phase-1-freeze.md) | **FROZEN** | Post-certification record of exact scope delivered: architecture, routes, Registry, terminology, auth, account, tag reference, deferred items; The Field explicitly out of scope |

### Phase 2 — The Field (planning)

| Priority | Document | Status | Role |
|----------|----------|--------|------|
| P2-1 | [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) | **DRAFT** | Strategic product architecture for The Field as third surface; phase breakdown 2a–2e |
| P2-2 | [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) | **DRAFT** | Founder-level ADRs; must be DECIDED before 2A implementation |
| P2-3 | [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) | **LOCKED DRAFT** | First Field release: public profiles, explorers, verification visibility, URL migration; no opportunities |
| P2-4 | [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) | **FROZEN** | Settled founder decisions before 2A implementation; supersedes PENDING ADR-13, 15, 17, 27–32 for 2A scope |
| P2-5 | [Phase 2A PR1 — Field Surface Foundation Plan](./phase-2a-pr1-field-foundation-plan.md) | **IMPLEMENTATION SOURCE OF TRUTH** | How to execute 2A PR1: `/field/*` routes, nav, presence mapping, move-then-redirect, rollout phases |
| P2-6 | [Phase 2A PR1 Signoff](./phase-2a-pr1-signoff.md) | **ACCEPTANCE SIGNOFF** | 2A PR1 acceptance matrix and checkpoint recommendation |
| P2-7 | [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md) | **LOCKED DRAFT** | Second Field release: search, practice, graph, completeness; discovery only |
| P2-8 | [Phase 2B Discovery Expansion Plan](./phase-2b-discovery-expansion-plan.md) | **DRAFT** | Full 2B rollout sequence and acceptance gate |
| P2-9 | [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md) | **FROZEN** | Settled founder decisions before 2B implementation; supersedes PENDING ADR-18, 19, 20 for 2B scope |
| P2-10 | [Phase 2B PR1 — Search and Discovery Plan](./phase-2b-pr1-search-and-discovery-plan.md) | **IMPLEMENTATION SOURCE OF TRUTH** | How to execute 2B PR1: search contract, record redirects, verified-default, hub IA |

### Phase 2C — Field: Opportunity Layer (planning)

| Priority | Document | Status | Role |
|----------|----------|--------|------|
| P2C-1 | [Phase 2C Opportunity Layer Blueprint](./phase-2c-opportunity-layer-blueprint.md) | **DRAFT** | Strategic product architecture for programmes, briefs, applications, awards, commissions |
| P2C-2 | [Phase 2C Founder Decisions Freeze](./phase-2c-founder-decisions-freeze.md) | **DRAFT** | Settled founder decisions before 2C implementation; supersedes PENDING ADR-01–08, 09–12 for 2C scope |
| P2C-3 | [Phase 2C Opportunity Layer Spec](./phase-2c-opportunity-layer-spec.md) | **LOCKED DRAFT** | Third Field release: opportunity layer scope and AC-*; no production/commerce/messaging |
| P2C-4 | [Phase 2C PR1 — Opportunity Foundation Plan](./phase-2c-pr1-plan.md) | **DRAFT** | First 2C train product plan: publish/read path only; no engineering execution tasks |

**Phase 2C authority chain:** Blueprint v1.1 (APPROVED) → Phase 2 Blueprint (DRAFT) → Phase 2C Blueprint (DRAFT) → Phase 2C Founder Decisions Freeze (DRAFT → FROZEN) → Phase 2C Spec (LOCKED DRAFT → LOCKED) → **Phase 2C PR1 Plan (DRAFT)** for PR1 product boundaries. Engineering execution packages are authored **after** spec LOCKED — not part of foundation branch. Inherits 2A/2B freezes where not superseded.

**Phase 2 authority chain:** Blueprint v1.1 (APPROVED) → Phase 2 Blueprint (DRAFT) → Phase 2A Founder Decisions Freeze (FROZEN) → Phase 2A Spec (LOCKED DRAFT) → **Phase 2A PR1 Plan (IMPLEMENTATION SOURCE OF TRUTH)** for 2A PR1 execution → Phase 2B Founder Decisions Freeze (FROZEN) → Phase 2B Spec (LOCKED DRAFT) → **Phase 2B PR1 Plan (IMPLEMENTATION SOURCE OF TRUTH)** for 2B PR1 execution. ADR document remains catalogue; 2A-blocking items are **DECIDED** per 2A founder freeze; 2B search/matching/recommendation items are **DECIDED** per 2B founder freeze. Phase 1 freeze remains binding for delivered Studio scope.

## Interpretation rules

1. **Blueprint v1.1 (APPROVED)** bounds all product and architectural decisions. No Phase 1 work may introduce Field Opportunities, Practice objects, Sector taxonomy, Projects, Briefs, or Programmes.
2. **Phase 1 Spec (LOCKED)** defines deliverables and acceptance criteria. Implementation must satisfy AC-S*, AC-T*, AC-R*, AC-N*, AC-P*, AC-M* as written.
3. **Feasibility Review (IMPLEMENTATION SOURCE OF TRUTH)** governs execution order (PR0 → PR6), migration gates, and risk mitigation. Where engineering judgment is required, this document prevails over ad-hoc plans **without** expanding locked scope.
4. **Route Migration Matrix (FROZEN)** is the authoritative inventory for PR4. Redirect rules (especially R-02 exact-match for `/collector-studio`) and unchanged paths in §2.4 must not be relaxed without Spec unlock.
5. **PR4 Execution Package (FROZEN)** governs implementation sequencing. **Move, then redirect** — legacy App Router stubs in the same commit as canonical moves. Auth layout guard (AG-1–3) is PR5, not PR4.
6. **Phase 1 Validation Waiver (ACTIVE)** supersedes acceptance gate §2 **only** for the question “may Phase 1 operate on production?” and “may `checkpoint-phase1-production` be tagged?” It does **not** unlock Phase 1 Spec scope, waive manual QA in acceptance gate §4, or remove follow-up harness remediation in waiver §7. When R-1–R4 in the waiver are satisfied, waiver status becomes **SUPERSEDED** and acceptance gate §2 applies in full again.
7. **Post-Certification Remediation (ACTIVE)** is the authoritative backlog for engineering work **after** production certification. It does not expand Phase 1 Spec scope. Waiver lift and harness fixes are tracked in [post-certification-remediation.md](./post-certification-remediation.md); waiver §7 R-1–R-6 defer to that roadmap for prioritization.
8. **Phase 1 Scope Freeze (FROZEN)** is the delivered-scope snapshot after production certification. It summarizes what shipped at `checkpoint-phase1-production`; it does **not** replace the LOCKED Spec for acceptance criteria detail. Scope expansion or Field delivery requires Spec/Blueprint unlock — not silent edits to the freeze doc.
9. **Phase 2 Blueprint (DRAFT)** bounds Field work. Does not unlock Briefs, Programmes, Commissions, or production workflows until later Phase 2 sub-specs. Contradictions with Blueprint v1.1 require Blueprint version bump — not silent Phase 2 edits.
10. **Phase 2A Spec (LOCKED DRAFT)** is the **only** authoritative scope for the first Field implementation release. Engineering must satisfy AC-FC*, AC-FO*, AC-FK*, AC-XC*, AC-XO*, AC-FV*, AC-FL*, AC-FS*, AC-FP*, AC-FM* as written. Explicit §14 exclusions are non-negotiable in 2A.
11. **Phase 2A Founder Decisions Freeze (FROZEN)** settles product philosophy for 2A (presence, explorers, trust, URLs, search, anti-features). Implementation must not re-litigate frozen §1–§10 without unlock. Conflicts between spec and freeze → **freeze prevails** on philosophy; spec prevails on acceptance criteria detail.
12. **Phase 2A PR1 Plan (IMPLEMENTATION SOURCE OF TRUTH)** governs 2A PR1 execution order, route moves, redirect stubs, and link grep. **Move, then redirect** — same discipline as Phase 1 PR4. Does not expand beyond 2A spec §14 exclusions; `/field/record/[registry_id]` full move is PR2 per plan §5.3.
13. **Phase 2B Discovery Expansion Spec (LOCKED DRAFT)** is the authoritative scope for the second Field release. Engineering must satisfy AC-SR*, AC-PR*, AC-DC*, AC-DO*, AC-DR*, AC-GN*, AC-PC*, AC-VT*, AC-IA* as written. Explicit §13 exclusions are non-negotiable in 2B.
14. **Phase 2B Founder Decisions Freeze (FROZEN)** settles product philosophy for 2B (search, practice, record default, graph, completeness, anti-features). Inherits 2A freeze where not superseded. Implementation must not re-litigate frozen §1–§11 without unlock. Conflicts between spec and freeze → **freeze prevails** on philosophy; spec prevails on acceptance criteria detail.
15. **Phase 2B PR1 Search and Discovery Plan (IMPLEMENTATION SOURCE OF TRUTH)** governs 2B PR1 only: record detail redirects, Field Search Contract, verified-default Record Explorer, hub search IA, partial graph link grep. **Move, then redirect** for `/registry/[id]` and `/artwork/[id]`. Does not expand into PR2 practice, PR3 graph panels, or 2C opportunities.
16. **Phase 2C Opportunity Layer Spec (LOCKED DRAFT)** is the authoritative scope for the third Field implementation release. Engineering must satisfy AC-PG*, AC-BR*, AC-AP*, AC-AW*, AC-CM*, AC-OC*, AC-NT*, AC-VT*, AC-GN*, AC-SR* as written. Explicit §13 exclusions are non-negotiable in 2C.
17. **Phase 2C Founder Decisions Freeze (DRAFT → FROZEN)** settles product philosophy for 2C (programmes, briefs, applications, awards, commissions, anti-features). Inherits 2A/2B freezes where not superseded. Implementation must not re-litigate frozen §1–§12 without unlock. Conflicts between spec and freeze → **freeze prevails** on philosophy; spec prevails on acceptance criteria detail.
18. **Phase 2C PR1 Opportunity Foundation Plan (DRAFT)** governs **product boundaries** for 2C PR1 only: programme/brief publish and open-calls read path. **No engineering execution tasks** in foundation package. Execution packages authored after spec LOCKED.

## Unlock procedure

To change a frozen document:

| Document | Required action |
|----------|-----------------|
| Blueprint v1.1 | Founder approval + new version (e.g. v1.2) |
| Phase 1 Spec | Explicit unlock + documented scope delta |
| Feasibility Review | Engineering lead update; must not expand Phase 1 scope |
| Product Language Freeze | Founder/product + engineering lead; version bump if participant or surface labels change |
| Route Migration Matrix | Engineering lead update; must not expand PR4 scope without Phase 1 Spec unlock |
| PR4 Execution Package | Engineering lead update; must stay aligned with Route Migration Matrix |
| Phase 1 Validation Waiver | Product + engineering lead sign-off; supersede when harness remediation complete (waiver §7) |
| Phase 1 Scope Freeze | Phase 1 Spec unlock + product + engineering lead; documents delivered-scope delta only |
| Phase 2 Blueprint | Founder/product approval; promote DRAFT → APPROVED with version note |
| Phase 2 Architecture Decisions | Founder marks ADRs DECIDED; amend recommendations via ADR revision |
| Phase 2A Field Foundations Spec | Product + engineering lead; LOCKED DRAFT → LOCKED after founder freeze + sign-off; explicit unlock for scope delta |
| Phase 2A Founder Decisions Freeze | Founder + product; version bump for any §1–§10 change |
| Phase 2A PR1 Field Foundation Plan | Engineering lead update; must stay aligned with 2A spec and founder freeze; no scope expansion without spec unlock |
| Phase 2B Discovery Expansion Spec | Product + engineering lead; LOCKED DRAFT → LOCKED after 2B founder freeze + sign-off; explicit unlock for scope delta |
| Phase 2B Discovery Expansion Plan | Product update; must stay aligned with 2B spec and founder freeze |
| Phase 2B Founder Decisions Freeze | Founder + product; version bump for any §1–§11 change |
| Phase 2B PR1 Search and Discovery Plan | Engineering lead update; must stay aligned with 2B spec and founder freeze; no scope expansion without spec unlock |
| Phase 2C Opportunity Layer Blueprint | Founder/product approval; promote DRAFT with version note |
| Phase 2C Opportunity Layer Spec | Product + engineering lead; LOCKED DRAFT → LOCKED after 2C founder freeze + sign-off; explicit unlock for scope delta |
| Phase 2C Founder Decisions Freeze | Founder + product; version bump for any §1–§12 change |
| Phase 2C PR1 Opportunity Foundation Plan | Product update; must stay aligned with 2C spec and founder freeze; no scope expansion without spec unlock |

## Related operational docs

- [Phase 1 scope freeze](./phase-1-freeze.md) — delivered scope snapshot (FROZEN)
- [Phase 2 Field blueprint](./phase-2-the-field-blueprint.md) — The Field architecture (DRAFT)
- [Phase 2 architecture decisions](./phase-2-architecture-decisions.md) — Founder ADRs (DRAFT)
- [Phase 2A Field foundations spec](./phase-2a-field-foundations-spec.md) — First Field release scope (LOCKED DRAFT)
- [Phase 2A founder decisions freeze](./phase-2a-founder-decisions-freeze.md) — Settled 2A founder decisions (FROZEN)
- [Phase 2A PR1 field foundation plan](./phase-2a-pr1-field-foundation-plan.md) — 2A PR1 execution (IMPLEMENTATION SOURCE OF TRUTH)
- [Phase 2A PR1 signoff](./phase-2a-pr1-signoff.md) — 2A PR1 acceptance
- [Phase 2B discovery expansion spec](./phase-2b-discovery-expansion-spec.md) — Second Field release scope (LOCKED DRAFT)
- [Phase 2B discovery expansion plan](./phase-2b-discovery-expansion-plan.md) — Full 2B rollout (DRAFT)
- [Phase 2B founder decisions freeze](./phase-2b-founder-decisions-freeze.md) — Settled 2B founder decisions (FROZEN)
- [Phase 2B PR1 search and discovery plan](./phase-2b-pr1-search-and-discovery-plan.md) — 2B PR1 execution (IMPLEMENTATION SOURCE OF TRUTH)
- [Phase 2C opportunity layer blueprint](./phase-2c-opportunity-layer-blueprint.md) — 2C architecture (DRAFT)
- [Phase 2C founder decisions freeze](./phase-2c-founder-decisions-freeze.md) — Settled 2C founder decisions (DRAFT)
- [Phase 2C opportunity layer spec](./phase-2c-opportunity-layer-spec.md) — Third Field release scope (LOCKED DRAFT)
- [Phase 2C PR1 opportunity foundation plan](./phase-2c-pr1-plan.md) — 2C PR1 product plan (DRAFT)
- [Post-certification remediation](./post-certification-remediation.md) — Phase 1.1 harness, replay, integrity, and reproducibility backlog
- [Phase 1 production signoff](./phase-1-production-signoff.md)
- [Account lifecycle deployment](../account-lifecycle-deployment.md)
- [Personal archive deployment](../personal-archive-deployment.md)

## Files in this folder

| File | Status |
|------|--------|
| `product-blueprint-v1.1.md` | APPROVED |
| `phase-1-studio-foundation-spec.md` | LOCKED |
| `phase-1-feasibility-review.md` | IMPLEMENTATION SOURCE OF TRUTH |
| `DOCUMENT_GOVERNANCE.md` | This registry |
| `product-language-freeze.md` | FROZEN |
| `phase-1-route-migration-matrix.md` | FROZEN |
| `phase-1-pr4-execution-package.md` | FROZEN |
| `phase-1-freeze.md` | FROZEN |
| `phase-1-validation-waiver.md` | ACTIVE |
| `phase-1-production-signoff.md` | ACTIVE |
| `post-certification-remediation.md` | ACTIVE |
| `phase-1-closure-report.md` | ACTIVE |
| `phase-1-rc-signoff.md` | ACTIVE |
| `production-readiness-execution.md` | ACTIVE |
| `environment-variable-inventory.md` | ACTIVE |
| `phase-2-the-field-blueprint.md` | DRAFT |
| `phase-2-architecture-decisions.md` | DRAFT |
| `phase-2a-field-foundations-spec.md` | LOCKED DRAFT |
| `phase-2a-founder-decisions-freeze.md` | FROZEN |
| `phase-2a-pr1-field-foundation-plan.md` | IMPLEMENTATION SOURCE OF TRUTH |
| `phase-2a-pr1-signoff.md` | ACCEPTANCE SIGNOFF |
| `phase-2a-pr1-completion-review.md` | IMPLEMENTATION REVIEW |
| `phase-2b-discovery-expansion-spec.md` | LOCKED DRAFT |
| `phase-2b-discovery-expansion-plan.md` | DRAFT |
| `phase-2b-founder-decisions-freeze.md` | FROZEN |
| `phase-2b-pr1-search-and-discovery-plan.md` | IMPLEMENTATION SOURCE OF TRUTH |
| `phase-2c-opportunity-layer-blueprint.md` | DRAFT |
| `phase-2c-founder-decisions-freeze.md` | DRAFT |
| `phase-2c-opportunity-layer-spec.md` | LOCKED DRAFT |
| `phase-2c-pr1-plan.md` | DRAFT |
