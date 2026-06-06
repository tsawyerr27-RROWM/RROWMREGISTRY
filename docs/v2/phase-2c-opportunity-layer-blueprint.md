# Phase 2C Blueprint — Field Opportunity Layer

**Document status:** DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md) (FROZEN)  
**Predecessor release:** Phase 2B Field Discovery — `checkpoint-phase2b-field-discovery` (recommended tag after 2B merge)  
**Document type:** Product architecture only — **no database schema, no API definitions, no UI design, no implementation tasks**

---

## Purpose

Define **Phase 2C — Field: Opportunity Layer**: the third Field release after 2A foundations and 2B discovery. Phase 2C introduces **structured work opportunities** — how Organisations publish intent, how Creatives respond, and how awards become auditable commissions — while preserving **Registry authority** for record truth and **Studio ownership** for all mutations.

**North-star outcome for 2C:**

> An Organisation can **publish** a programme or brief to The Field; a Creative can **discover** it through explainable filters, **apply** from Studio; an Organisation can **review, shortlist, and award**; the outcome creates a **Commission** trail linked to future Registry filing — without payments, messaging products, production runtime, or marketplace commerce on Field.

Phase 2C **orchestrates opportunity state**. It does **not** replace Registry verification, certificate issuance, or ledger chronology.

---

## Position in the Field roadmap

```
Phase 1 (Studio Foundation)     — frozen
Phase 2A (Field: Record)        — public profiles, explorers, verify
Phase 2B (Field: Discovery)     — search, practice, graph, completeness
Phase 2C (Field: Opportunity)   — programmes, briefs, applications, awards, commissions ← this document
Phase 2D (Field: Production)    — projects, teams, milestones, deliverable filing
Phase 2E (Field: Patron/Commerce) — optional; patron briefs, marketplace decision
```

| Phase | Question answered |
|-------|-------------------|
| 2A–2B | **Who** and **what work** can I trust on file? |
| **2C** | **What work is being offered** and **how do I respond**? |
| 2D | **How is commissioned work produced** and **filed to Registry**? |
| 2E | **Who pays whom** for transfer or patronage (if ever)? |

---

## Three-surface architecture (unchanged)

| Surface | 2C responsibility |
|---------|-------------------|
| **The Field** | Public read of published programmes/briefs; open-calls discovery; auth-gated apply entry points; party-visible commission **summary** where appropriate |
| **Studio** | Create/edit programmes and briefs; application submit; org review queue; award action; inbox notifications |
| **Registry** | Record truth when filing occurs — verification, certificates, provenance, disputes |

**Invariant:** Field never mutates the ledger. Commission and application state live in the **opportunity layer**; Registry records remain the trust anchor when deliverables are filed (2D bridge).

---

## Core objects (conceptual — no schema)

| Object | Definition | Primary owner | Field visibility |
|--------|------------|---------------|------------------|
| **Programme** | Organisation-scoped container for related briefs — season, residency slate, award cycle, production series | Organisation (Studio) | Public when programme published |
| **Brief** | Structured production request — scope, timeline, practices, deliverables, registry outcome rule, participation mode | Organisation (Studio) | Public when brief published (subject to participation mode) |
| **Application** | Creative response to a brief — statement, attachments, declared fit | Creative (Studio) | Private to applicant + publishing org |
| **Award** | Organisation decision selecting an applicant (or named Creative on direct brief) | Organisation (Studio) | Summarised on brief/programme when org opts in |
| **Commission** | Contractual outcome of award — links org, Creative(s), originating brief | Organisation → Creative | Party-visible status; public summary optional |

**Terminology note (ADR-03):** “Opportunity” is **user-facing language** for published briefs and programme contexts — not a separate system object in 2C MVP.

**Out of 2C object model:** Project, Team, Milestone, Deliverable, Collaboration, Patron brief, Listing, Payment, Escrow.

---

## Brief taxonomy (2C)

| Brief type | Typical use | Public listing default | Registry outcome expectation |
|------------|-----------|------------------------|----------------------------|
| **Open call** | Public competition, general submission | Listed on open calls | Often required |
| **Residency / award** | Seasonal programme, prize, alumni track | Listed under programme | Required for alumni record |
| **Direct commission** | Sole-source or named Creative | **Not** on open calls index | Usually required |
| **Fabrication RFP** | Production partner search | Listed when participation open | Optional per deliverable |

**Excluded from 2C brief types:** Patron commission (Collector publisher — 2E), peer collaboration brief (2D), sale/listing brief (commerce — excluded).

---

## Lifecycle overview

### Programme lifecycle

```
draft → published → [active briefs] → archived
```

- Published programme has a public Field presence linking its briefs.
- Archiving hides programme from discovery; historical awards remain auditable to parties.

### Brief lifecycle

```
draft → published → [applications open | invite-only | roster-only | direct]
         ↓
    awarded | withdrawn | closed (no award)
```

### Application lifecycle

```
draft (Studio) → submitted → under review → shortlisted | rejected | withdrawn
                                              ↓
                                         accepted (award)
```

### Award → Commission

```
award decision → commission created (1:0..1 per brief)
```

- Award is the **decision event**; Commission is the **persistent contract object**.
- Commission carries forward to Phase 2D as the parent of Project runtime — **Project is not created in 2C**.

---

## Discovery model (inherits 2B)

Phase 2C **extends** discovery — does not replace 2B search contract.

| Surface | Purpose |
|---------|---------|
| `/field/open-calls` | Filterable public brief listing |
| `/field/open-calls/[id]` | Brief detail — scope, org, practices, registry outcome rule, apply CTA |
| `/field/programmes/[slug]` | Programme hub — curated briefs, org context |
| Existing explorers | Unchanged — Creatives/Orgs/Records remain primary trust discovery |

**Filter philosophy (ADR-19-A):** User-controlled filters only — practice, organisation, programme, brief type, date window, verification gates. **No** platform auto-matching, **no** engagement ranking, **no** “recommended for you”.

**Graph extension (deterministic):**

| From | To |
|------|-----|
| Brief detail | Organisation profile |
| Brief detail | Programme hub |
| Organisation profile | Programme(s) and published briefs |
| Creative profile | **No** application history public |
| Award summary (optional public) | Creative profile (when public) + future Record link (2D) |

---

## Participation modes (ADR-09, ADR-12)

Each brief selects one **participation mode** at publish:

| Mode | Who may apply | Field listing |
|------|---------------|---------------|
| **Open** | Any authenticated Creative | Open calls index |
| **Roster-only** | Creatives on org roster | Hidden from open index until org opens publicly |
| **Invite-only** | Invited Creatives | Not on open index |
| **Direct** | Named Creative (no application window) | Not on open index |

**Default for verified-org public briefs:** Open.

**Hybrid rule:** Organisation may run roster-first window before opening to public — product policy in spec; not auto-enforced matching.

---

## Awards

An **Award** is the organisation’s selection act — not a financial payment object.

| Rule | Detail |
|------|--------|
| One award per brief | At most one Commission per brief in 2C |
| Award visibility | Org chooses public summary vs parties-only |
| Award evidence | Linked to Application or direct brief target |
| No ratings | Post-project scores excluded (ADR-16-C rejected) |
| Registry link | Award does **not** create a Record — filing is 2D |

**Residency / award programmes:** Programme container groups multiple briefs or cohort rounds; each round still follows brief → application → award → commission.

---

## Commissions (2C boundary)

| In 2C | Deferred to 2D |
|-------|----------------|
| Commission object created on award | Project runtime container |
| Party-visible status: awarded / active (pre-production) | Milestones, deliverables, team |
| Link to brief, org, Creative lead | Deliverable review workflow |
| Studio inbox entries for award parties | Register RPC filing bridge |

**Public Field commission page (minimal):** Optional `/field/commissions/[id]` summary — org name, Creative name, brief title, status label — **no** production detail, **no** messaging thread.

---

## Studio journeys

### Organisation

```
Studio: create programme (optional) → draft brief → configure participation + registry outcome
      → publish to Field → receive applications (review queue)
      → shortlist → award → commission created → inbox notification to Creative
```

### Creative

```
Field: discover brief (open calls / programme / org profile)
     → sign in → Studio apply flow → submit application
     → track status in Studio inbox (not public Field feed)
     → receive award notification → view commission summary
```

### Anonymous visitor

```
Field: browse open calls and programme pages → read brief detail
     → sign-in prompt to apply — no application without auth
```

---

## Registry authority preservation

| Concern | Rule |
|---------|------|
| Application content | Not written to Registry |
| Award / Commission | Opportunity-layer metadata |
| Record creation | Existing Studio register flows only |
| Verification | Unchanged — brief may **require** verified Creative/org; does not grant verification |
| Certificate | Unchanged — issued after record verification |
| Provenance | Commission may later link to Record (2D) via nullable reference — Field sets link through Registry RPC, not direct ledger edit |

**Copy discipline:** Brief “registry outcome required” is a **publisher rule** shown to applicants — not a guarantee of automatic filing.

---

## Monetisation stance (2C planning only)

Blueprint references brief posting fees and subscription gates (ADR-23). **Phase 2C governance package documents product hooks only:**

| Hook | 2C stance |
|------|-----------|
| Publish to Field | May require org subscription tier (ADR-07-D) — **policy decision in founder freeze** |
| Application fee | **Excluded** |
| Payment processing | **Excluded** |
| Escrow | **Excluded** |
| Facilitation fee on award | **Excluded** until 2D+ (ADR-24) |

No checkout, invoicing, or wallet UI in 2C.

---

## Explicit exclusions (Phase 2C)

The following **must not appear** in Phase 2C:

| Exclusion | Rationale |
|-----------|-----------|
| Payments, checkout, invoicing | 2E / commerce lane |
| Escrow, wallets, payouts | 2E |
| Marketplace listings, sale of existing Record | ADR-25 — Registry-adjacent commerce |
| Messaging, DMs, chat threads | Permanent guardrail — notifications ≠ chat product |
| Production management (teams, milestones, deliverables) | 2D |
| Patronage, Collector-published briefs | 2E |
| Collaboration (peer-led projects) | 2D (ADR-05) |
| Platform auto-matching | ADR-19-C rejected |
| Pay-to-boost brief placement | ADR-17 guardrail |
| Recommendation feeds, similarity scores | ADR-20-A |
| Social follows, public application counts as rank | Permanent guardrail |
| Field ledger writes | Permanent guardrail |
| Studio sidebar on Field | 2A chrome rule |

---

## Success metrics (directional)

| Metric | Intent |
|--------|--------|
| Brief publish → apply conversion | Validates discovery + apply UX |
| Time-to-first-application | Org brief clarity |
| Award completion rate | Org workflow usability |
| Registry filing rate post-commission | Guardrail — 2C must not reduce registration (2D measures filing) |
| Open-call filter usage | Validates explainable discovery |

**Not measured:** message volume, social engagement, recommendation CTR, payment GMV.

---

## Dependencies

| Dependency | Requirement |
|------------|-------------|
| Phase 2B complete | `checkpoint-phase2b-field-discovery` recommended |
| 2A/2B freezes | Explorer IA, search, graph, trust hierarchy binding |
| Practice taxonomy | Brief `practices_required[]` uses 2B closed vocabulary |
| Organisation verification | Publish gates per founder freeze |
| Phase 1 Studio | Org staff roles, roster, representation model |

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2c-opportunity-layer-spec.md](./phase-2c-opportunity-layer-spec.md) | Acceptance criteria and scope detail |
| [phase-2c-founder-decisions-freeze.md](./phase-2c-founder-decisions-freeze.md) | Founder decisions before implementation |
| [phase-2c-pr1-plan.md](./phase-2c-pr1-plan.md) | First 2C train product plan |
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Parent Field architecture |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR catalogue |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2C Opportunity Layer blueprint |
