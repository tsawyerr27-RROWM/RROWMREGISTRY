# Phase 2B — Field Discovery Expansion Plan

**Document status:** DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md) (DRAFT), [Phase 2A PR1 Signoff](./phase-2a-pr1-signoff.md), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md)  
**Predecessor:** Phase 2A Field Foundations @ `checkpoint-phase2a-field-foundations`  
**Document type:** Product rollout plan only — **no implementation tasks, no database schema, no code**

---

## 1. Objective

Deliver **Field Discovery Expansion** — the second Field release after 2A foundations. Phase 2B makes The Field **searchable, practice-aware, and graph-connected** while preserving Registry authority and the anti–social-network product stance.

**North star (from spec):**

> A visitor can find Creatives, Organisations, and Registry records through explainable search and filters, understand how a Creative works through structured practice, trust credentials through consistent verification visibility, and navigate the Field graph without algorithmic ranking.

**Golden rule (inherited from 2A):** Field **reads** Registry truth; Studio **owns** edits. No ledger mutations from Field routes.

---

## 2. Constraints

| Constraint | Detail |
|------------|--------|
| Discovery only | No new transactional or production objects |
| Excluded domains | Opportunities, programmes, applications, commissioning, production workflows, marketplace, payments, social feeds, recommendation algorithms |
| Registry preservation | Zero ledger semantic change |
| Explainability | Every filter and search result attributable to user-visible params |
| Anonymous-first | Full explorer search without authentication |
| No scope creep | Sector editor, open calls, inbox, teams → 2C+ |

---

## 3. Relationship to Phase 2A

Phase 2A establishes canonical Field routes, presence pages, explorers (filter-only), verify layer, and navigation canonicalisation (PR1 signoff).

Phase 2B **extends** 2A — it does not replace routes. Key 2A deferrals closed in 2B:

| 2A deferral | 2B deliverable |
|-------------|----------------|
| Full-text search (ADR-18) | §4 Search rollout |
| Practice taxonomy editor (2A spec §14) | §5 Practice rollout |
| Discipline filters on Creative Explorer | §5 Practice rollout |
| Legacy record URL redirects (signoff O-1) | §3 URL completion |
| Record Explorer verified-default policy (signoff O-3) | §7 Record discovery |
| Residual legacy profile links (signoff O-5) | §8 Graph completion |

**Partial PR1 ahead-of-spec:** Practice filter UI or chips may exist on branch. 2B **locks product rules** (declared vs registry-evidence, visibility flag, Studio edit) regardless of interim implementation state.

---

## 4. Rollout sequence

**Commit discipline (product):** Each step closes a measurable exit criterion before the next step expands scope. Steps may ship as one release train or sequenced sub-releases — product sign-off is per step, not per pull request.

### Step 1 — Preflight and baseline

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | 2A checkpoint verified; 2B spec reviewed; ADR-18/13/17/19/20 alignment confirmed |
| **Exit criterion** | `checkpoint-phase2a-field-foundations` tagged; staging redirect smoke pass; 2B DRAFT approved for rollout |
| **Dependencies** | Phase 2A merge complete |

---

### Step 2 — URL completion (record discovery bridge)

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Legacy public record URLs resolve to Field Record canonical paths |
| **Product scope** | `/registry/[registry_id]` and `/artwork/[registry_id]` → `/field/record/[registry_id]` via permanent redirect; share links and external press continuity |
| **Exit criterion** | AC-GN3 pass; redirect matrix updated; no duplicate canonical record URLs in primary Field graph |
| **Spec reference** | §6.4, §11 |

**Does not include:** Removing Registry ledger view — secondary authoritative surface may remain.

---

### Step 3 — Search architecture foundation

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Field Search Contract live across explorers (`q`, pagination, explainable filters) |
| **Product scope** | Full-text scopes per spec §1.3; sort rules §1.4; empty-state behaviour §1.6; no recommendation UI |
| **Exit criterion** | AC-SR1–AC-SR5 pass on staging |
| **Spec reference** | §1 |

**Rollout order within step:** Record Explorer search first (Registry traffic parity), then Creative, then Organisation.

---

### Step 4 — Record discovery policy

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Record Explorer verified-default emphasis with explicit broaden control |
| **Product scope** | Default verified-first listing; user-visible filter to include all public records; card trust signals §5.4 |
| **Exit criterion** | AC-DR1–AC-DR4 pass; O-3 closed |
| **Spec reference** | §5 |

**Pairs with:** Step 3 Record search — may ship atomically as one product increment.

---

### Step 5 — Practice taxonomy (Studio source)

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Creatives declare practices in Studio account |
| **Product scope** | Canonical vocabulary §2.2; multi-select max 5; primary practice; dedicated Studio Practice section; `public_presence.practices` visibility flag |
| **Exit criterion** | AC-PR1, AC-PR2, AC-PR4 pass; no public Field display required yet |
| **Spec reference** | §2.3–§2.5, §7 |

**Anti-patterns enforced:** No pay-to-boost; no silent auto-declaration from medium alone.

---

### Step 6 — Practice on Field (Creative presence + explorer)

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Practice visible on Field Creative profile and filterable on Creative Explorer |
| **Product scope** | Declared + registry-evidence chips with source semantics §2.3; Creative Explorer `practice=` facet §2.7; card enrichment §3.2 |
| **Exit criterion** | AC-PR3, AC-PR5, AC-PR6, AC-DC1, AC-DC2 pass |
| **Spec reference** | §2.6–§2.7, §3 |

**Depends on:** Step 5 (declared source requires Studio edit path).

---

### Step 7 — Organisation discovery enrichment

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Organisation Explorer text search and card enrichment |
| **Product scope** | `q` on name, location, description §4.3; verified toggle preserved; roster/catalogue graph §4.4 |
| **Exit criterion** | AC-DO1–AC-DO4 pass |
| **Spec reference** | §4 |

**Optional 2B.1:** Organisation filter by represented Creative practice — ship only if roster join quality validated; not required for 2B gate.

---

### Step 8 — Relationship graph navigation

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Complete deterministic browse graph with contextual panels |
| **Product scope** | §6.2 edge matrix; context panels §6.3 (same Creative, same Organisation, practice explorer link); legacy profile link cleanup on Registry ledger views (O-5) |
| **Exit criterion** | AC-GN1, AC-GN2, AC-GN4 pass |
| **Spec reference** | §6 |

**Depends on:** Steps 2–7 (graph endpoints must be canonical).

---

### Step 9 — Profile completeness (Studio stewardship)

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Studio completeness checklist for Creatives and Organisations |
| **Product scope** | Private stewardship meter §7.2; owner-only practice guidance §7.4; **no** public score on Field |
| **Exit criterion** | AC-PC1–AC-PC4 pass |
| **Spec reference** | §7 |

**May ship in parallel** with Steps 5–6 — no Field dependency except copy hooks.

---

### Step 10 — Verification visibility pass

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Consistent trust hierarchy across all new 2B discovery UI |
| **Product scope** | Practice vs verification visual distinction §8.2; search result trust signals §8.2; hierarchy order §8.1 |
| **Exit criterion** | AC-VT1–AC-VT4 pass |
| **Spec reference** | §8 |

**Timing:** Cross-cutting QA pass after Steps 3–8 land — not a standalone feature release.

---

### Step 11 — Explorer IA refinement

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Hub search entry, param preservation rules, orientation copy |
| **Product scope** | §9 hub structure; unified search routing §1.5; sub-nav URL truth §9.1; cross-tab param rules §9.3 |
| **Exit criterion** | AC-IA1–AC-IA4 pass |
| **Spec reference** | §9 |

**Depends on:** Step 3 (search contract).

---

### Step 12 — i18n and copy pass

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Locale messages for new discovery strings |
| **Product scope** | Practice labels, explorer orientation lines, search empty states, verified-default copy, owner guidance |
| **Exit criterion** | No hard-coded English-only strings on new 2B surfaces (per Phase 1 i18n discipline) |
| **Spec reference** | Cross-cutting |

---

### Step 13 — Validation and acceptance

| Attribute | Definition |
|-----------|------------|
| **Deliverable** | Full 2B acceptance gate sign-off |
| **Product scope** | All AC-* from spec; Registry preservation smoke; redirect matrix; manual QA journeys below |
| **Exit criterion** | §5 Acceptance gate pass; founder sign-off; tag recommendation applied |

**Manual QA journeys (anonymous):**

1. Hub → Record search by title → Field Record → verify → Creative profile → back to Record Explorer  
2. Creative Explorer → practice filter → profile → declared + evidence chips → work → Field Record  
3. Organisation Explorer → search → org profile → roster Creative → record  
4. Legacy `/registry/[id]` bookmark → lands on Field Record  
5. Confirm absence of recommendations, social metrics, opportunity CTAs  

---

## 5. Rollout dependency graph

```
Step 1 Preflight
    │
    ├── Step 2 URL completion
    │
    ├── Step 3 Search foundation ──► Step 11 Explorer IA
    │         │
    │         └── Step 4 Record discovery policy
    │
    ├── Step 5 Practice (Studio) ──► Step 6 Practice (Field)
    │
    ├── Step 7 Organisation enrichment
    │
    ├── Step 9 Profile completeness (parallel)
    │
    └── Steps 2–7 ──► Step 8 Graph navigation
                              │
                              └── Step 10 Verification pass
                                        │
                                        └── Step 12 i18n
                                                  │
                                                  └── Step 13 Acceptance
```

**Parallel work permitted:** Steps 5+9 (Studio); Steps 3+4 (Record search); Step 12 alongside Step 10.

**Parallel work forbidden:**

- Step 6 before Step 5 (declared practices require Studio source)  
- Step 8 before Step 2 (graph requires canonical record URLs)  
- Opportunity/programme/open-call surfaces in any step  

---

## 6. Acceptance gate (composite)

Phase 2B rollout is **complete** when:

| Gate | Requirement |
|------|-------------|
| **G-1** | All spec acceptance criteria AC-SR, AC-PR, AC-DC, AC-DO, AC-DR, AC-GN, AC-PC, AC-VT, AC-IA pass |
| **G-2** | 2A open issues O-1, O-3, O-5 closed |
| **G-3** | No excluded features present (§13 spec exclusions) |
| **G-4** | Registry ledger behaviour unchanged — no registration/verify regression |
| **G-5** | Redirect smoke includes new record detail redirects |
| **G-6** | Founder/product sign-off on spec DRAFT → LOCKED |

---

## 7. Founder decisions required before LOCKED promotion

| Decision | Options | Spec default |
|----------|---------|--------------|
| **Record Explorer default** | Verified-default vs all-records default | Verified-default (§5.2) |
| **Registry-evidence practices** | Show on profile / filter-only / hide | Show with source label (§2.3) |
| **Organisation practice filter** | Ship in 2B vs 2B.1 | Defer to 2B.1 (§4.3) |
| **Managed search index** | Postgres/FTS vs external (ADR-18-C) | Postgres/FTS first (§1.3) |
| **Medium/year record facets** | 2B vs 2B.1 | Defer to 2B.1 (§5.3) |
| **`public_presence.practices` default** | true vs false when profile enabled | true (§2.5) |

Opportunity, programme, matching, and recommendation ADRs (01–12, 19–20 beyond A) remain **out of scope** — not blocking 2B.

---

## 8. Phase handoff to 2C (Opportunity)

Phase 2B must **not** block 2C planning, but must **enable** future matching inputs:

| 2B output | 2C consumer |
|-----------|-------------|
| Declared practice slugs on Creative | Brief `practices_needed[]` filter (manual, explainable) |
| Creative Explorer filters | Open calls discovery UX pattern (filters only — not recommendations) |
| Field Search Contract | Open calls list query param vocabulary |
| Graph navigation | Brief publisher → org profile → roster Creatives |

**Explicit boundary:** 2B does not ship `/field/open-calls`, Programme objects, Application flows, or Studio inbox.

---

## 9. Checkpoint tag recommendation

After Step 13 acceptance on main:

```
checkpoint-phase2b-field-discovery
```

Independent of Phase 1 ancestry and distinct from `checkpoint-phase2a-field-foundations`.

**Pre-tag checklist:**

1. All §6 acceptance gates pass on staging.  
2. Redirect smoke includes record detail legacy URLs.  
3. Manual QA journeys (Step 13) documented.  
4. Spec promoted DRAFT → LOCKED.  
5. Tag main at acceptance merge commit.  

---

## 10. Risks and mitigations (product)

| Risk | Mitigation |
|------|------------|
| Practice vs medium confusion | Source labels; spec §2.1 boundary copy |
| Verified-default surprises users | Explicit filter copy when showing unverified records |
| Search scope creep toward recommendations | AC-SR3; ADR-20-A |
| Practice filter without Studio edit | Step order: Studio before Field |
| URL migration breaks shared links | Step 2 early; 301 permanent |
| Scope creep into 2C opportunities | §2 constraints; spec §13 exclusions |

---

## 11. Success metrics (rollout)

Track directionally post-release (see spec §12):

| Metric | Why |
|--------|-----|
| Search success rate | Validates §1 architecture |
| Practice filter usage | Validates §2 taxonomy |
| Graph traversal depth | Validates §6 navigation |
| Verified-default comprehension | Validates §5 policy |
| Registry registration rate | Guardrail — no discovery regression |

---

## 12. Related documents

| Document | Role |
|----------|------|
| [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md) | Acceptance criteria source |
| [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) | Predecessor |
| [phase-2a-pr1-signoff.md](./phase-2a-pr1-signoff.md) | 2A baseline + open issues |
| [phase-2a-practice-foundation-review.md](./phase-2a-practice-foundation-review.md) | Practice product research |
| [phase-2a-founder-decisions-freeze.md](./phase-2a-founder-decisions-freeze.md) | Explorer default + search stance |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR source |
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Parent phase map |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2B Discovery Expansion plan |
