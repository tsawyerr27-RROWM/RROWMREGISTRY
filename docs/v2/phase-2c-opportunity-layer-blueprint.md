# Phase 2C Blueprint — Field Opportunity Layer

**Document status:** DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md) (FROZEN)  
**Predecessor release:** Phase 2B Field Discovery — `checkpoint-phase2b-field-discovery` (recommended tag after 2B merge)  
**Document type:** Product architecture only — **no database schema, no API definitions, no UI design, no implementation tasks**

---

## Purpose

Define **Phase 2C — Field: Opportunity Layer**: the first **matching marketplace** slice on The Field — built on 2B discovery and Registry-backed trust. Phase 2C connects **trust-qualified matching** to **auditable opportunity workflow**: how Creatives discover fit, how Organisations publish cultural production intent, and how awards become commissions with a clear path to Registry outcomes in 2D.

**Platform vision (Phase 2C alignment):**

> RROWM is a **matching marketplace powered by Registry-backed trust**, purpose-built for **arts, culture and creative production**.

**North-star outcome for 2C:**

> A Creative can **discover** an opportunity on Field through practice, sector, and verification-qualified discovery; **apply** from Studio with **registry-evidence portfolio** context; an Organisation can **review** with the same trust signals, **award**, and create a **Commission** handoff to 2D production and Record filing — without payments, messaging products, production runtime, or sale-commerce on Field.

Phase 2C is **Opportunity Loop Slice 1** (ends at Commission). Full loop including **Project** and **Record filing** completes in 2D. Phase 2C **orchestrates matching and opportunity state**. It does **not** replace Registry verification, certificate issuance, or ledger chronology.

---

## Strategic positioning (founder review v0.2)

Phase 2C combines two co-equal product goals:

| Goal | What it means |
|------|----------------|
| **Matching marketplace** | Rule-based **eligibility matching** — practice, sector, verification, registry-evidence flags — not algorithmic ranking |
| **Opportunity workflow** | Auditable Programme → Brief → Application → Award → Commission pipeline for institutional fairness |

**Not in 2C:** algorithmic auto-match (ADR-19-C rejected), recommendation feeds (ADR-20-A), payments, messaging, production runtime, patronage, sale-commerce.

**Canonical user journey (2C):**

```
Field: practice/sector/trust-qualified opportunity discovery
  → opportunity detail (org footprint, registry outcome expectation)
  → Studio: apply with registry-evidence preview
  → org review with same evidence
  → award → commission (Slice 1 end; Project + Record in 2D)
```

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
| **2C** | **What opportunities match my practice** and **how do I respond with evidence on file**? |
| 2D | **How is commissioned work produced** and **filed to Registry**? |
| 2E | **Who pays whom** for transfer or patronage (if ever)? |

---

## Three-surface architecture (unchanged)

| Surface | 2C responsibility |
|---------|-------------------|
| **The Field** | Public read of published opportunities; eligibility-qualified discovery; matching surfaces on opportunity detail; auth-gated apply entry points; party-visible commission **summary** where appropriate |
| **Studio** | Create/edit programmes and briefs; application submit; org review queue; award action; inbox notifications |
| **Registry** | Record truth when filing occurs — verification, certificates, provenance, disputes |

**Invariant:** Field never mutates the ledger. Commission and application state live in the **opportunity layer**; Registry records remain the trust anchor when deliverables are filed (2D bridge).

---

## Opportunity taxonomy (conceptual — no schema)

**Opportunity** is the **canonical product term** for publishable work intent on The Field (ADR-03 modified). **Brief** is the primary **publishable subtype** for Organisation-led opportunities in 2C implementation.

```
Opportunity (canonical taxonomy root)
├── Kind: Open call
├── Kind: Residency / programme opportunity
├── Kind: Direct commission
├── Kind: Production partner search (cultural fabrication)
├── Kind: Collaboration request          ← planned; implementation 2D
└── Kind: Team formation request         ← planned; implementation 2D

Container: Programme (optional — season, cohort, award cycle)
Publisher: Organisation (2C); Collector (2E deferred)

Workflow objects (audit trail):
  Application → Award → Commission → Project (2D) → Record (Registry, 2D)
```

| Object | Role in 2C |
|--------|------------|
| **Programme** | Optional cultural container — season, residency slate, award cycle |
| **Brief** | Primary published opportunity unit for org-led flows |
| **Application** | Creative response with registry-evidence context |
| **Award** | Organisation selection decision |
| **Commission** | Contract handoff — **Slice 1 loop terminus** |

**Out of 2C implementation:** Project, Team, Milestone, Deliverable, Collaboration (peer-led), Patron brief, Listing, Payment, Escrow.

---

## Originator model

Phase 2C supports a **single public publisher class**. Originator roadmap:

| Phase | Originator |
|-------|------------|
| **2C** | **Organisation** publishes Opportunities |
| **2D** | **Creative** — Collaboration Request; Team Formation Request |
| **2E** | **Collector** — patron opportunity publishing |

**Clarifications:**

- Organisation remains the **sole public publisher** in 2C.
- Gallery/organisation publishing on behalf of represented Creatives does **not** change originator semantics — publisher remains the Organisation.
- Creative-originated opportunities are **strategically planned** (named in taxonomy) and **intentionally deferred** to 2D.

See founder freeze §1a.

---

## Matching primitives (rule-based — not algorithmic)

| Primitive | Source | Used for |
|-----------|--------|----------|
| **Practice** | 2B closed taxonomy — declared + registry-evidence | Brief requirements; Creative eligibility |
| **Sector** | 2C closed cultural taxonomy (Product Blueprint §3) | Brief cultural context; Creative eligibility |
| **Verification** | Registry + org badge | Publish and apply gates |
| **Registry evidence** | Verified records on Creative/org footprint | Apply and review context — primary differentiator |

**Sector cardinality (2C):** Brief = **single** required sector. Creative profile = **multiple** sectors. Multi-sector briefs deferred beyond 2C.

**Sector eligibility — Culture wildcard (founder decision):**

Eligibility satisfied when **any** of:

- **A.** Creative `sectors[]` intersects Brief `sector`
- **B.** Creative declares **Culture**
- **C.** Brief `sector` is **Culture**

Practice overlap and verification gates apply in addition. See spec AC-SC5.

**Eligibility matching (in scope):** Studio surfaces Opportunities a Creative **may** respond to when practice + sector (Culture wildcard) + verification rules pass — explainable, deterministic, **not** ranked by engagement or ML.

**Matching scope by phase:**

| Phase | Scope |
|-------|--------|
| **2C** | Creative ↔ Organisation |
| **2D** | Creative ↔ Creative; Project ↔ Team |
| **2E** | Collector / Patron participation |

Collaboration Request and Team Formation Request are **recognised Opportunity kinds** — strategic taxonomy, **2D implementation**. See founder freeze §11c.

**Excluded:** platform auto-match scores, “recommended for you” feeds, pay-to-boost placement.

---

## Cultural presentation principles

Public opportunity surfaces must read as **cultural production infrastructure**, not generic job posts:

| Principle | Rule |
|-----------|------|
| **Programme as season** | Programmes frame cohorts, residencies, and award cycles — not job requisitions |
| **Opportunity over vacancy** | Primary vocabulary: **opportunities**; “open call” is a **kind**, not the product name |
| **Registry outcome as cultural artifact** | Frame registry outcome as work **on file** for the cultural record — not compliance checkbox |
| **Production partner search** | Fabrication/partner needs use cultural production language — not procurement RFP tone |
| **No popularity signals** | No application counts, view counts, or “hot opportunity” badges |
| **Trust before transaction** | Publisher footprint and verification precede scope and timeline |

---

## Brief taxonomy (2C)

| Brief type | Typical use | Public listing default | Registry outcome expectation |
|------------|-----------|------------------------|----------------------------|
| **Open call** | Public competition, general submission | Listed on opportunities index | Often required |
| **Residency / award** | Seasonal programme, prize, alumni track | Listed under programme | Required for alumni record |
| **Direct commission** | Sole-source or named Creative | **Not** on opportunities index | Usually required |
| **Production partner search** | Cultural fabrication, technical production partners | Listed when participation open | Optional per deliverable |

**Product copy:** Use **production partner search** — not procurement RFP language.

**Excluded from 2C brief types:** Patron commission (Collector publisher — 2E), peer collaboration brief (implementation 2D — **planned opportunity kind**), sale/listing brief (commerce — excluded).

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
| `/field/opportunities` | Primary public index — filterable opportunities (practice, sector, org, programme, kind, date, verification) |
| `/field/opportunities/[id]` | Opportunity detail — **matching surface**: scope, sector, practices, org footprint, registry outcome expectation |
| `/field/programmes/[slug]` | Programme hub — season/cohort framing; curated briefs |
| Existing explorers | Unchanged — Creatives/Orgs/Records remain primary trust discovery |

**Vocabulary:** **Opportunities** is the primary Field namespace. **Open call** is an opportunity **kind** and filter value — not the product name.

**Filter philosophy (ADR-19-A modified):** User-controlled filters **plus** rule-based **eligibility matching** in Studio (practice + sector + verification + registry-evidence flags). **No** algorithmic ranking, **no** engagement-based sort, **no** “recommended for you” feed.

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
| **Open** | Any authenticated Creative meeting eligibility rules | Opportunities index |
| **Roster-only** | Creatives on org roster | Hidden from public index until org opens publicly |
| **Invite-only** | Invited Creatives | Not on public index |
| **Direct** | Named Creative (no application window) | Not on public index |

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

### Organisation (secondary journey — publish path)

```
Studio: create programme (optional) → draft brief → configure sector, practices, participation + registry outcome
      → publish to Field → receive applications (review queue with registry-evidence context)
      → shortlist → award → commission created → inbox notification to Creative
```

### Creative (primary journey — matching path)

```
Field: discover opportunity via practice/sector/trust-qualified filters or Studio eligible-brief surfacing
     → read matching surface (org footprint, registry outcome expectation, verified work links)
     → sign in → Studio apply flow with registry-evidence portfolio preview
     → track status in Studio inbox (not public Field feed)
     → receive award notification → view commission summary
```

### Anonymous visitor

```
Field: browse opportunities and programme pages → read opportunity detail as matching surface
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
| Publish to Field | **Verified org required** for public listing; subscription does **not** block first cultural publish in 2C (ADR-07 modified) |
| Application fee | **Excluded** |
| Payment processing | **Excluded** |
| Escrow | **Excluded** |
| Facilitation fee on award | **Excluded** until 2D+ (ADR-24) |

No checkout, invoicing, or wallet UI in 2C. Future subscription tiers may gate advanced publisher features — not initial public opportunity contribution.

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
| Eligible Creative → apply rate | Validates trust-qualified matching + apply UX |
| Practice + sector filter usage | Validates cultural discovery, not generic browse |
| Registry-evidence portfolio shown at apply | Validates differentiation vs job boards |
| Award completion rate | Org workflow usability |
| Registry filing rate post-commission | Guardrail — 2D measures filing; 2C must not reduce registration intent |
| Programme-as-season engagement | Validates cultural framing vs transactional listings |

**Balanced with (not replacing):** brief publish → apply conversion, time-to-first-application.

**Not measured:** message volume, social engagement, recommendation CTR, payment GMV, application counts as popularity.

---

## Dependencies

| Dependency | Requirement |
|------------|-------------|
| Phase 2B complete | `checkpoint-phase2b-field-discovery` recommended |
| 2A/2B freezes | Explorer IA, search, graph, trust hierarchy binding |
| Practice taxonomy | Brief `practices_required[]` uses 2B closed vocabulary |
| Sector taxonomy | Brief `sector` + Creative `sectors[]` — Product Blueprint v1.1 §3 seed list |
| Organisation verification | Publish gates per founder freeze |
| Phase 1 Studio | Org staff roles, roster, representation model |

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2c-opportunity-layer-spec.md](./phase-2c-opportunity-layer-spec.md) | Acceptance criteria and scope detail |
| [phase-2c-founder-decisions-freeze.md](./phase-2c-founder-decisions-freeze.md) | Founder decisions before implementation |
| [phase-2c-pr1-plan.md](./phase-2c-pr1-plan.md) | First 2C train product plan |
| [phase-2c-founder-review-strategic-audit.md](./phase-2c-founder-review-strategic-audit.md) | Founder review + v0.2 resolutions |
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Parent Field architecture |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR catalogue |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2C Opportunity Layer blueprint |
| 0.2 | 31 May 2026 | DRAFT | Founder review revision — matching marketplace centre of gravity, Sector, eligibility matching, cultural presentation, Opportunity taxonomy |
| 0.3 | 31 May 2026 | DRAFT | Freeze finalisation — Originator model, Culture wildcard, Collaboration matching boundary |
