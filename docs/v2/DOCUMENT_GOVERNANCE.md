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

## Interpretation rules

1. **Blueprint v1.1 (APPROVED)** bounds all product and architectural decisions. No Phase 1 work may introduce Field Opportunities, Practice objects, Sector taxonomy, Projects, Briefs, or Programmes.
2. **Phase 1 Spec (LOCKED)** defines deliverables and acceptance criteria. Implementation must satisfy AC-S*, AC-T*, AC-R*, AC-N*, AC-P*, AC-M* as written.
3. **Feasibility Review (IMPLEMENTATION SOURCE OF TRUTH)** governs execution order (PR0 → PR6), migration gates, and risk mitigation. Where engineering judgment is required, this document prevails over ad-hoc plans **without** expanding locked scope.

## Unlock procedure

To change a frozen document:

| Document | Required action |
|----------|-----------------|
| Blueprint v1.1 | Founder approval + new version (e.g. v1.2) |
| Phase 1 Spec | Explicit unlock + documented scope delta |
| Feasibility Review | Engineering lead update; must not expand Phase 1 scope |

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
