# V2 Phase 1 — Document Governance

**Effective:** 31 May 2026  
**Status:** Active freeze registry

This folder holds the **frozen planning stack** for RROWM V2 Studio Foundation (Phase 1). Documents are authoritative in the order below.

## Document hierarchy

| Priority | Document | Status | Role |
|----------|----------|--------|------|
| 1 | [Product Blueprint v1.1](./product-blueprint-v1.1.md) | **APPROVED** | Strategic product architecture, object model, V2/V3 sequencing |
| 2 | [Phase 1 Implementation Specification](./phase-1-studio-foundation-spec.md) | **LOCKED** | What Phase 1 delivers: scope, acceptance criteria, QA, technical spec |
| 3 | [Phase 1 Feasibility Review](./phase-1-feasibility-review.md) | **IMPLEMENTATION SOURCE OF TRUTH** | How to execute Phase 1: PR breakdown, risks, dependencies, merge hotspots |
| 4 | [Product Language Freeze](./product-language-freeze.md) | **FROZEN** | Public surfaces (Studio, The Field, Registry) and participant labels (Creative, Organisation, Collector) vs internal system terms |
| 5 | [Phase 1 Route Migration Matrix](./phase-1-route-migration-matrix.md) | **FROZEN** | PR4 pre-implementation inventory: canonical `/studio/*` routes, redirects, links, post-auth paths, and grep checklist |
| 6 | [Phase 1 PR4 Execution Package](./phase-1-pr4-execution-package.md) | **FROZEN** | PR4 build steps: phases, file list, move-then-redirect order, validation and reviewer checklists (no substitute for matrix) |

## Interpretation rules

1. **Blueprint v1.1 (APPROVED)** bounds all product and architectural decisions. No Phase 1 work may introduce Field Opportunities, Practice objects, Sector taxonomy, Projects, Briefs, or Programmes.
2. **Phase 1 Spec (LOCKED)** defines deliverables and acceptance criteria. Implementation must satisfy AC-S*, AC-T*, AC-R*, AC-N*, AC-P*, AC-M* as written.
3. **Feasibility Review (IMPLEMENTATION SOURCE OF TRUTH)** governs execution order (PR0 → PR6), migration gates, and risk mitigation. Where engineering judgment is required, this document prevails over ad-hoc plans **without** expanding locked scope.
4. **Route Migration Matrix (FROZEN)** is the authoritative inventory for PR4. Redirect rules (especially R-02 exact-match for `/collector-studio`) and unchanged paths in §2.4 must not be relaxed without Spec unlock.
5. **PR4 Execution Package (FROZEN)** governs implementation sequencing. **Move, then redirect** — legacy App Router stubs in the same commit as canonical moves. Auth layout guard (AG-1–3) is PR5, not PR4.

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

## Related operational docs

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
