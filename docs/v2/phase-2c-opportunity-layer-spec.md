# Phase 2C Implementation Specification — Field Opportunity Layer

**Document status:** LOCKED DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Phase 2C Opportunity Layer Blueprint](./phase-2c-opportunity-layer-blueprint.md) (DRAFT), [Phase 2C Founder Decisions Freeze](./phase-2c-founder-decisions-freeze.md) (DRAFT), [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md) (LOCKED DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED)  
**Predecessor release:** Phase 2B Field Discovery — `checkpoint-phase2b-field-discovery`  
**Document type:** Product specification only — **no database schema, no UI design, no implementation tasks, no code**

---

## Purpose

Define **Phase 2C — Field: Opportunity Layer**: the third Field release. Phase 2C introduces **trust-qualified matching** and **auditable opportunity workflow** — programmes, briefs, applications, awards, and commissions — while preserving Registry authority and Studio ownership.

**North-star outcome for 2C:**

> A Creative can **discover** opportunities on Field through practice-, sector-, and verification-qualified discovery; **apply** from Studio with **registry-evidence portfolio** context; an Organisation can **review** with the same trust signals, **award**, and create a **Commission** (Opportunity Loop Slice 1) — **without** payments, messaging products, production runtime, patronage, or marketplace commerce.

**Loop boundary:** Slice 1 ends at Commission. Project + Record filing in 2D completes full Product Blueprint loop v1.

---

## Change control

| Rule | Detail |
|------|--------|
| **LOCKED DRAFT** | Scope and acceptance criteria fixed for founder review. No engineering expansion without unlock. |
| **Promotion** | Becomes **LOCKED** after founder signs 2C freeze + acceptance on staging. |
| **Unlock** | Explicit product approval; documented delta; version bump (2C.1, etc.). |
| **Registry rule** | Zero ledger semantic change in 2C; no Record created on award. |
| **Inheritance** | 2A/2B AC-* remain binding where not superseded. |

---

## Scope summary

| In scope (2C) | Out of scope (2C) |
|---------------|-------------------|
| **Opportunity taxonomy** — canonical term; Brief primary subtype | Project, team, milestone, deliverable runtime |
| Programme object (optional container) | Production management workflows |
| Brief object — draft, publish, withdraw | Patron briefs (Collector publisher) |
| Brief types: open call, residency/award, direct, production partner search | Peer collaboration **implementation** (planned kind — 2D) |
| **Sector taxonomy** on brief + Creative profile | Application fees |
| **Rule-based eligibility matching** in Studio | Algorithmic ranking / recommendations |
| **Registry-evidence portfolio** at apply/review | Automatic Registry filing on award |
| Application — Studio submit, org review | Commission ratings / scores |
| Award decision | Payments, escrow, checkout |
| Commission object on award (Slice 1 terminus) | Messaging, DMs, chat threads |
| Opportunities + programme Field surfaces | Marketplace / sale listings |
| Org/Creative Studio inbox notifications | Pay-to-boost |
| Deterministic graph: brief ↔ org ↔ programme | Collaboration (peer-led) runtime |
| Participation modes: open, roster, invite, direct | |
| Cultural presentation guardrails (AC-CP*) | |
| i18n for new opportunity copy | |

---

## Predecessor baseline (Phase 2B)

Phase 2B delivers explainable discovery, practice taxonomy, relationship graph, and Studio profile completeness. Phase 2C **adds opportunity surfaces** without altering:

- Field Search Contract for Record/Creative/Organisation explorers
- Verified-default Record Explorer
- Deterministic context panels (no similarity)
- Registry-primary record URLs

**2B → 2C handoff inputs:**

| 2B output | 2C consumer |
|-----------|-------------|
| Practice slugs | Brief `practices_required[]` + eligibility matching |
| Creative Explorer filters | Applicant practice display + registry-evidence practices |
| Organisation profile + roster | Publisher footprint on matching surfaces; roster-only / invite participation |
| Graph navigation | Brief → org → programme edges |
| Record footprint | Registry-evidence portfolio at apply/review |

---

## 1. Programme model

### 1.1 Definition

A **Programme** groups related briefs under an Organisation — season, residency slate, award cycle, or production series.

### 1.2 Rules

| Rule | Detail |
|------|--------|
| Ownership | Organisation admin/staff only |
| Optional | Brief may exist without programme |
| Publish gate | Programme must contain ≥1 published brief to appear on Field |
| Public page | `/field/programmes/[slug]` when published |
| Archive | Removes from discovery; audit retained for parties |
| Creative apply target | Applications target **brief**, not programme directly |

### 1.3 Acceptance criteria (AC-PG*)

| ID | Criterion |
|----|-----------|
| AC-PG1 | Organisation admin/staff can create, edit, draft, publish, archive programmes in Studio |
| AC-PG2 | Standalone briefs (no programme) supported |
| AC-PG3 | Published programme Field page lists only its published briefs with links to brief detail |
| AC-PG4 | Archived programme not discoverable on Field |
| AC-PG5 | Programme page links to Organisation profile when org public |

---

## 2. Brief model

### 2.1 Definition

A **Brief** is a structured production request: scope, timeline, required practices, deliverables description, registry outcome rule, participation mode, and closing date (when applicable).

### 2.2 Brief types

| Type | Public opportunities index | Application required |
|------|-------------------------|----------------------|
| Open call | Yes (when mode open) | Yes |
| Residency / award | Yes (under programme) | Yes |
| Direct commission | No | No — named Creative |
| Production partner search | Yes (when mode open) | Yes |

### 2.3 Lifecycle

```
draft → published → [accepting responses] → awarded | withdrawn | closed
```

| State | Field visibility |
|-------|------------------|
| Draft | Studio only |
| Published | Per participation mode |
| Withdrawn | Not discoverable; URL returns withdrawn state to parties |
| Awarded | Brief detail shows awarded status; applications closed |
| Closed (no award) | Not accepting; status visible |

### 2.4 Publishing gates

| Gate | Rule |
|------|------|
| Role | Org admin/staff |
| Subscription | Does **not** block first public publish in 2C — verified org required |
| Verification | Public opportunities listing requires verified org |
| Sector | Required on public briefs — closed taxonomy (Product Blueprint v1.1 §3) |
| Registry-outcome-required | Requires verified org regardless of mode |
| Copy | Must state registry outcome expectation and participation mode plainly |

### 2.5 Participation modes

| Mode | Field listing | Who can respond |
|------|---------------|-----------------|
| Open | Opportunities index | Any authenticated Creative meeting eligibility |
| Roster-only | Hidden from open index | Roster Creatives only |
| Invite-only | Hidden | Invited Creatives |
| Direct | Hidden | Named Creative — org initiates |

### 2.6 Acceptance criteria (AC-BR*)

| ID | Criterion |
|----|-----------|
| AC-BR1 | Org admin/staff can create, edit, draft, publish, withdraw briefs in Studio |
| AC-BR2 | Brief types enum enforced — no patron/sale/collaboration types in 2C |
| AC-BR3 | Participation mode selectable per brief; defaults to open for verified public briefs |
| AC-BR4 | Published brief visible on Field detail page as **matching surface** — scope, sector, practices, registry outcome, org footprint |
| AC-BR5 | Withdrawn brief removed from opportunities index and programme lists |
| AC-BR6 | Direct commission brief awards named Creative without application window |
| AC-BR7 | Unverified org cannot publish to public opportunities index |
| AC-BR8 | Brief detail includes apply CTA routing to Studio — not anonymous apply |
| AC-BR9 | Public brief includes sector from closed taxonomy |

---

## 2a. Sector taxonomy

### 2a.1 Definition

**Sector** is the cultural-context dimension for matching — where in the cultural economy the work lives. Closed taxonomy aligned with [Product Blueprint v1.1 §3](./product-blueprint-v1.1.md).

### 2a.2 Seed sectors (founder-approved)

Public Art, Film, Hospitality, Retail, Festivals, Museums, Culture, Education, Residential, Commercial Property, Public Realm, Heritage.

Expandable via admin-curated lookup — not user-generated in 2C.

### 2a.3 Rules

| Object | Sector field |
|--------|--------------|
| Brief (public) | Single required `sector` |
| Creative profile (Studio) | `sectors[]` — multi-select from closed taxonomy |

### 2a.4 Acceptance criteria (AC-SC*)

| ID | Criterion |
|----|-----------|
| AC-SC1 | Public brief requires sector from closed taxonomy |
| AC-SC2 | Opportunities index filterable by sector |
| AC-SC3 | Creative can declare sectors on Studio profile |
| AC-SC4 | Eligibility matching considers sector overlap (see §6a) |

---

## 3. Application model

### 3.1 Definition

An **Application** is a Creative’s structured response to a brief — statement, optional attachments (policy TBD in engineering), declared practice fit, and **registry-evidence portfolio context** (verified records from Creative footprint).

### 3.2 Rules

| Rule | Detail |
|------|--------|
| Submit surface | **Studio** (Creative workspace) |
| Auth | Authenticated Creative owner only |
| One active application | Per Creative per brief |
| Visibility | Applicant + publishing org staff — **not** public Field |
| Edit after submit | Locked or revision policy — org notified on resubmit if allowed |
| Fee | None |

### 3.3 Application lifecycle

```
draft → submitted → under review → shortlisted | rejected | withdrawn
                                        ↓
                                   accepted (leads to award)
```

### 3.4 Org review

| Capability | Rule |
|------------|------|
| Review queue | Studio Organisation workspace |
| Shortlist | Manual — no auto-rank |
| Filter assist | By declared practice + registry-evidence practices — explainable filter, not auto-reject |
| Reject | With optional internal note — not public |

### 3.5 Acceptance criteria (AC-AP*)

| ID | Criterion |
|----|-----------|
| AC-AP1 | Authenticated Creative can submit application from Studio for eligible brief |
| AC-AP2 | Participation mode enforced — roster/invite/direct rules block ineligible apply |
| AC-AP3 | One active application per Creative per brief |
| AC-AP4 | Application content not visible on public Field |
| AC-AP5 | Org staff can view, shortlist, reject applications in Studio **with registry-evidence portfolio visible** |
| AC-AP6 | No algorithmic applicant ranking or auto-reject |
| AC-AP7 | Field brief detail shows apply state only to authenticated eligible Creative (e.g. “Apply in Studio”) |

---

## 4. Award model

### 4.1 Definition

An **Award** is the Organisation’s selection decision — selecting an application or naming a Creative on direct brief.

### 4.2 Rules

| Rule | Detail |
|------|--------|
| Cardinality | At most one award per brief |
| Trigger | Org staff explicit action in Studio |
| Public summary | Org opt-in on brief/programme page |
| Ratings | Forbidden |
| Registry | No Record created at award time |

### 4.3 Acceptance criteria (AC-AW*)

| ID | Criterion |
|----|-----------|
| AC-AW1 | Org staff can award from shortlisted application or direct brief |
| AC-AW2 | At most one award per brief enforced |
| AC-AW3 | Award creates Commission (§5) |
| AC-AW4 | Optional public award summary on Field when org enables |
| AC-AW5 | No rating or scoring UI |

---

## 5. Commission model

### 5.1 Definition

A **Commission** is the durable contract object linking Organisation, Creative lead, and originating brief after award.

### 5.2 Rules (2C boundary)

| In 2C | Not in 2C |
|-------|-----------|
| Commission record exists after award | Project container |
| Status: awarded / pre-production (labels TBD) | Milestones, team, deliverables |
| Party-visible in Studio | Production messaging |
| Optional minimal Field summary page | Register RPC filing |
| Link forward to 2D Project | Public production progress |

### 5.3 Acceptance criteria (AC-CM*)

| ID | Criterion |
|----|-----------|
| AC-CM1 | Award always creates exactly one Commission |
| AC-CM2 | Commission visible to org staff and Creative lead in Studio |
| AC-CM3 | Optional public Field commission summary — no production detail |
| AC-CM4 | Commission does not mutate Registry or create Record |
| AC-CM5 | Commission links to brief, org, and Creative for audit trail |

---

## 6. Opportunities discovery

### 6.1 Surfaces

| Surface | Route |
|---------|-------|
| Opportunities index | `/field/opportunities` |
| Opportunity detail | `/field/opportunities/[id]` |
| Programme hub | `/field/programmes/[slug]` |

**Vocabulary:** “Open call” is an opportunity **kind** — not the primary namespace.

### 6.2 Filters (explainable)

| Filter | Source |
|--------|--------|
| Practice | Brief required practices — closed taxonomy |
| **Sector** | Brief sector — closed taxonomy |
| Organisation | Publisher slug |
| Programme | Programme slug |
| Opportunity kind | Product enum (open call, residency, direct, production partner search) |
| Closing date | Brief closing date window |
| Verification | Verified org only toggle |

**Sort allowed:** closing date, published date, title — **not** application volume, views, or org tier.

### 6.3 Explorer IA extension

| Rule | Detail |
|------|--------|
| Hub | Add **Opportunities** entry — Records remain default tab |
| Search | Opportunities use dedicated filter vocabulary — not blended global ranked search |
| 2B explorers | Unchanged default behaviour |

### 6.4 Acceptance criteria (AC-OC*)

| ID | Criterion |
|----|-----------|
| AC-OC1 | Anonymous user can browse opportunities index and detail |
| AC-OC2 | Filters compose with AND logic; no hidden ranking |
| AC-OC3 | Opportunity detail links to org profile and programme when present |
| AC-OC4 | Withdrawn and ineligible briefs absent from index |
| AC-OC5 | No recommendation or “similar opportunities” rows |
| AC-OC6 | Opportunities sort does not use application counts |
| AC-OC7 | Opportunity detail presents as **matching surface** — org footprint, sector, practices, registry outcome before scope |

---

## 6a. Eligibility matching (rule-based)

### 6a.1 Definition

**Eligibility matching** surfaces briefs a Creative **may** apply to when deterministic rules pass: practice overlap, sector overlap, verification gates, participation mode. **Not** algorithmic ranking.

### 6a.2 Rules

| Rule | Detail |
|------|--------|
| Surface | Creative Studio — eligible opportunities section |
| Logic | Explainable AND of practice + sector + verification + participation mode |
| Sort | Closing date, published date — **not** match score or engagement |
| Excluded | ML scores, “recommended for you”, similarity panels |

### 6a.3 Acceptance criteria (AC-MT*)

| ID | Criterion |
|----|-----------|
| AC-MT1 | Authenticated Creative sees eligible briefs in Studio when practice + sector + verification rules pass |
| AC-MT2 | Ineligible briefs omitted from eligible list with neutral omission — not error |
| AC-MT3 | Eligibility logic documented and deterministic — same inputs → same eligibility |
| AC-MT4 | No ranked “best match” score displayed |
| AC-MT5 | Field opportunities index remains browseable independently of Studio eligibility surfacing |

---

## 6b. Registry evidence at apply/review

### 6b.1 Definition

**Registry-evidence portfolio** is the set of verified Records linked to the Creative footprint, surfaced at apply and org review — primary matching differentiator.

### 6b.2 Rules

| Moment | Requirement |
|--------|-------------|
| Apply (Studio) | Show verified records + registry-evidence practices before submit |
| Org review (Studio) | Same portfolio visible alongside application statement |
| Public Field | No private application content; opportunity detail may link to public verified records on org/Creative profiles |

### 6b.3 Acceptance criteria (AC-RE*)

| ID | Criterion |
|----|-----------|
| AC-RE1 | Apply flow shows Creative registry-evidence portfolio preview |
| AC-RE2 | Org review queue shows applicant registry-evidence portfolio |
| AC-RE3 | Portfolio distinguishes verified records from declared-only practice |
| AC-RE4 | No registry-evidence data written to Field public application surfaces |

---

## 6c. Cultural presentation

### 6c.1 Principles

See blueprint §Cultural presentation. Copy must not imply generic job board, HR pipeline, or procurement portal.

### 6c.2 Acceptance criteria (AC-CP*)

| ID | Criterion |
|----|-----------|
| AC-CP1 | Public copy uses “opportunity/opportunities” — not “job”, “vacancy”, or “RFP” as primary label |
| AC-CP2 | Programme pages frame season/cohort/residency — not job requisition |
| AC-CP3 | Production partner search type uses cultural production language |
| AC-CP4 | Registry outcome framed as work on file for cultural record |
| AC-CP5 | No application counts, view counts, or popularity badges on public surfaces |

---

## 7. Notifications (transactional — not messaging)

### 7.1 Allowed events

| Event | Recipient |
|-------|-----------|
| Application submitted | Org staff |
| Application status change | Creative applicant |
| Award / commission created | Creative + org staff |

### 7.2 Excluded

Chat, DMs, threaded discussion, @mentions, read receipts, public comment threads.

### 7.3 Acceptance criteria (AC-NT*)

| ID | Criterion |
|----|-----------|
| AC-NT1 | Studio inbox rows for core lifecycle events |
| AC-NT2 | No chat or messaging UI introduced |
| AC-NT3 | Email notifications optional — same event set |

---

## 8. Trust, verification, and reputation

### 8.1 Hierarchy (inherit 2A/2B)

Record verification > certificate > continuity > participation > org badge. **Registry-evidence portfolio** elevates apply/review trust — opportunity popularity signals remain forbidden.

### 8.2 Opportunity-specific rules

| Rule | Detail |
|------|--------|
| Brief listing | Show org verification badge + publisher footprint when applicable |
| Applicant counts | Not shown publicly as popularity signal |
| Org commission history | Optional public opt-in on org profile (ADR-15-B) |
| Practice requirements | Display as requirements — not match scores |

### 8.3 Acceptance criteria (AC-VT*)

| ID | Criterion |
|----|-----------|
| AC-VT1 | Brief pages show verification hierarchy consistent with 2B |
| AC-VT2 | No application-count or award-count sort on opportunities |
| AC-VT3 | Registry outcome requirement shown before apply |
| AC-VT4 | No commission ratings |

---

## 9. Permissions and data access

| Action | Rule |
|--------|------|
| View opportunities | Anonymous |
| View brief detail | Anonymous for public briefs |
| Apply | Authenticated Creative — Studio |
| Manage programmes/briefs | Org admin/staff — Studio |
| Review applications | Org staff for own briefs — Studio |
| Award | Org admin/staff — Studio |
| View own application | Creative applicant — Studio |
| View commission | Org staff + Creative lead — Studio; optional public summary |

**No Field Registry mutations.**

---

## 10. Graph navigation (extends 2B)

| Edge | Condition |
|------|-----------|
| Brief → Organisation | Org profile public |
| Brief → Programme | Programme published |
| Programme → Briefs | Published briefs only |
| Organisation → Programmes | When org publishes programmes |
| Commission summary → Creative | Creative profile public |
| Commission summary → Brief | Always when public summary enabled |

**No** application graph edges on public Field.

### Acceptance criteria (AC-GN*)

| ID | Criterion |
|----|-----------|
| AC-GN1 | Opportunity graph edges navigable for public sample data |
| AC-GN2 | Deterministic links only — no similarity panels for briefs |
| AC-GN3 | Private profile targets omitted — neutral omission |
| AC-GN4 | 2B record/creative/org graph unchanged |

---

## 11. Studio / Field / Registry division

| Concern | Owner |
|---------|--------|
| Opportunity state | Studio + opportunity persistence layer (engineering TBD post-spec) |
| Public discovery | Field read |
| Apply / review / award | Studio |
| Record filing | Studio → Registry RPC (2D) |
| Trust display on Record | Field read from Registry |

### Acceptance criteria (AC-SR*)

| ID | Criterion |
|----|-----------|
| AC-SR1 | No Field route mutates Registry ledger |
| AC-SR2 | Studio remains edit source for org/creative opportunity actions |
| AC-SR3 | 2B search contract for explorers unchanged |
| AC-SR4 | Award does not create artwork or registry_id |

---

## 12. i18n

All new public opportunity strings require locale keys (en/de/fr/ja) before 2C tag — same discipline as 2B Step 12.

---

## 13. Explicit exclusions

Must **not** appear in Phase 2C:

| Exclusion | Phase |
|-----------|-------|
| Payments, escrow, checkout, invoicing | 2E |
| Marketplace listings, sale commerce | 2E / ADR-25 |
| Messaging, DMs, chat | Permanent |
| Production teams, milestones, deliverables | 2D |
| Patron briefs | 2E |
| Peer collaboration | 2D |
| Platform auto-matching | Rejected ADR-19-C |
| Recommendations, similarity, “for you” | ADR-20-A |
| Pay-to-boost placement | ADR-17 |
| Application fees | Rejected |
| Commission ratings | ADR-16-C |
| Field ledger writes | Permanent |
| Schema/API in this spec | N/A — excluded by document type |

---

## Acceptance gate summary

Phase 2C is **complete** when:

1. All acceptance criteria **AC-PG, AC-BR, AC-SC, AC-AP, AC-AW, AC-CM, AC-OC, AC-MT, AC-RE, AC-CP, AC-NT, AC-VT, AC-GN, AC-SR** pass on staging sign-off.
2. Phase 2B checkpoint applied; 2B discovery regression verified.
3. 2A/2B anti-features remain absent on Field.
4. Registry preservation verified — no ledger regression from 2C.
5. Founder/product sign-off on founder freeze DRAFT → **FROZEN** and spec LOCKED DRAFT → **LOCKED**.
6. Tag recommendation: **`checkpoint-phase2c-field-opportunity`** on `main` at acceptance merge commit.

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2c-founder-decisions-freeze.md](./phase-2c-founder-decisions-freeze.md) | Founder philosophy |
| [phase-2c-pr1-plan.md](./phase-2c-pr1-plan.md) | First implementation train (product) |
| [phase-2b-pr4-acceptance-signoff.md](./phase-2b-pr4-acceptance-signoff.md) | Predecessor gate |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR source |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | LOCKED DRAFT | Initial Phase 2C opportunity layer spec |
| 0.2 | 31 May 2026 | LOCKED DRAFT | Founder review revision — Sector, eligibility matching, registry evidence, cultural presentation, opportunities routes |
