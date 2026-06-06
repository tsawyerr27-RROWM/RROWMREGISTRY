# Phase 2C Founder Decisions Freeze

**Document status:** DRAFT (pending founder sign-off)  
**Effective:** 31 May 2026  
**Authority:** [Phase 2C Opportunity Layer Blueprint](./phase-2c-opportunity-layer-blueprint.md) (DRAFT), [Phase 2C Opportunity Layer Spec](./phase-2c-opportunity-layer-spec.md) (LOCKED DRAFT), [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md) (FROZEN), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT)  
**Purpose:** Capture **founder-level decisions settled before Phase 2C implementation begins**.  
**Scope:** Product philosophy only — **no implementation details, no database schema, no UI design.**

**Effect:** When promoted to **FROZEN**, this document settles ADR outcomes for Phase 2C (ADR-01–08, 09–12, 15-B, 16, 19, 23 policy hooks). Phase 2A and 2B frozen decisions **remain binding** unless explicitly superseded here.

---

## 1. Opportunity object model

### Decision

**Phase 2C ships five opportunity objects: Programme (optional container), Brief, Application, Award, Commission.**

| Object | Required in 2C | Notes |
|--------|----------------|-------|
| Programme | **Optional** per brief (ADR-01-B) | Required for multi-brief seasons; standalone briefs allowed |
| Brief | **Required** | Single opportunity unit; no orphan Commission |
| Application | **Required** for non-direct briefs | Studio submit path |
| Award | **Required** | Decision event; auditable |
| Commission | **Required** on award | Contract object; Project deferred 2D |
| Opportunity (entity) | **Excluded** | User-facing term only (ADR-03-A) |
| Project / Team / Milestone | **Excluded** | 2D |

### Rationale

Matches Blueprint §5 without forcing Programme on every publisher. Award separates decision from persistent Commission. Rejects orphan commissions (ADR-11-C).

### Future review trigger

- Peer Collaboration object → 2D ADR-05 unlock.
- Patron-as-publisher brief → 2E unlock.

---

## 2. Programme model

### Decision

| Rule | 2C stance |
|------|-----------|
| Programme ownership | Organisation admin/staff only (ADR-06-B) |
| Programme visibility | Public Field page when published |
| Brief without programme | **Allowed** — single open call |
| Programme without briefs | Draft only — cannot publish empty programme |
| Archive | Hides from discovery; does not delete audit trail |

### Rationale

Optional Programme (ADR-01-B) balances structure for institutions with simplicity for one-off calls.

### Future review trigger

- Cross-org programmes → 2E+ only.

---

## 3. Brief publishing authority

### Decision

| Rule | Detail |
|------|--------|
| Who may draft | Organisation admin + staff |
| Who may publish to Field | Organisation admin + staff with **active subscription** (ADR-07-D) |
| Unverified org | Draft + roster-private briefs only — **no public open-call listing** (ADR-08-C) |
| Registry-outcome-required briefs | **Require verified org** |
| Withdraw | Removes from discovery; preserves audit trail |

**Brief types in 2C:** open call, residency/award, direct commission, fabrication RFP.

**Excluded brief types:** patron commission, peer collaboration, sale/listing.

### Rationale

Publishing is an Organisation capability tied to verification and subscription — not explorer admin. Tiered visibility protects trust on registry-outcome briefs.

### Future review trigger

- Subscription tier shape change → ADR-23 unlock with commerce spec.

---

## 4. Participation and applications

### Decision

**Org-configurable participation mode per brief (ADR-12-C), default open for verified public briefs.**

| Mode | 2C support |
|------|------------|
| Open apply | Yes |
| Roster-only | Yes |
| Invite-only | Yes — org invites roster Creatives (ADR-10-B) |
| Direct commission | Yes — named Creative; no application window (ADR-11-B) |

| Rule | Detail |
|------|--------|
| Apply auth | Authenticated Creative only |
| Apply surface | **Studio** primary; Field brief detail links to Studio apply |
| Application fee | **Forbidden** |
| Multiple applications per Creative per brief | **One** active application |
| Org auto-reject by algorithm | **Forbidden** — manual review only |

### Rationale

Flexible commissioning practice without platform matching. Application-first default preserves fairness story; direct and invite paths support real org workflows.

### Future review trigger

- Paid applications → rejected unless explicit unlock + founder review.

---

## 5. Awards and commissions

### Decision

| Rule | Detail |
|------|--------|
| Awards per brief | At most **one** |
| Award → Commission | **Always** — 1:1 |
| Public award summary | Org opt-in on programme/brief page |
| Commission ratings / scores | **Forbidden** (ADR-16-C) |
| Commission public page | Minimal party summary allowed — no production detail |
| Record filing on award | **Does not occur** — filing is 2D |

**Award types:** Same brief types — residency/award programmes use award decision semantics explicitly in copy.

### Rationale

Award is auditable decision; Commission is durable contract handoff to 2D. Public reputation remains Registry-record-led (ADR-16-B deferred to Record link in 2D).

### Future review trigger

- Multi-winner briefs → spec unlock required.

---

## 6. Discovery and matching (inherits 2B + extends)

### Decision

**Explainable filters only — no platform matching engine (ADR-19-A).**

| Capability | 2C stance |
|------------|-----------|
| Open calls listing | Filter by practice, org, programme, type, date, verification |
| Sort | Date published, closing date, title — **not** application count or engagement |
| Org shortlist assist | Filter applications by declared practice — **manual** |
| Suggested briefs email | **Out of 2C** — optional 2C.1 with strict opt-in |
| Roster fast-path | Via participation mode — not algorithmic |

**Hub navigation:** Add **Open calls** to Field explorer sub-nav or hub strip — **does not** change Records-first default tab (2B freeze §8).

### Rationale

2B established non-algorithmic discovery; 2C extends surfaces without ADR-19-C auto-matching or ADR-20 recommendations.

### Future review trigger

- Email digest of new briefs → separate spec with opt-in only.

---

## 7. Trust and verification (inheritance)

### Decision

**2A/2B trust hierarchy unchanged.** Opportunity signals are **secondary** to Registry verification.

| Signal | Priority |
|--------|----------|
| Record verification | Highest (unchanged) |
| Org verified badge | On brief publisher context |
| Commission completion badge on Record | **2D** — not 2C |
| Application count / award count as rank | **Forbidden** |

**Brief trust copy:** Show org verification, registry footprint link, programme context — never “trusted because many applications.”

### Rationale

Opportunity layer must not introduce alternate reputation economy. ADR-13-C hierarchy preserved.

### Future review trigger

- Org commission history on profile (ADR-15-B) → public opt-in section in 2C or 2D spec.

---

## 8. URL and surface policy

### Decision

| Route | Policy |
|-------|--------|
| `/field/open-calls` | New canonical open-calls index |
| `/field/open-calls/[id]` | Brief detail |
| `/field/programmes/[slug]` | Programme hub |
| `/field/commissions/[id]` | Optional minimal party summary |
| Legacy stubs | No new legacy URLs — greenfield 2C routes |

**Field chrome:** No Studio sidebar. Apply CTAs route to Studio authenticated flows.

**Registry URLs:** Unchanged — primary record discovery remains `/field/record/[id]`.

### Rationale

Clean opportunity namespace; avoids conflating briefs with Record explorer.

### Future review trigger

- `/field/opportunities` alias → reject; use open-calls vocabulary.

---

## 9. Studio and Registry relationship

### Decision

| Concern | Owner |
|---------|--------|
| Programme/brief CRUD | **Studio** (Organisation workspace) |
| Application submit | **Studio** (Creative workspace) |
| Review, shortlist, award | **Studio** (Organisation workspace) |
| Open calls read | **Field** (anonymous + auth read) |
| Inbox / notifications | **Studio** — status events, not chat |
| Ledger mutations | **Registry APIs** via Studio only |

**Field write paths in 2C:** None for Registry. Opportunity mutations occur through Studio (implementation layer TBD in post-spec engineering packages).

### Rationale

Preserves three-surface architecture. “Inbox” is transactional status — not a messaging product (excluded).

### Future review trigger

- Any proposal for Field-side application edit → reject; Studio only.

---

## 10. Notifications (not messaging)

### Decision

| Allowed | Excluded |
|---------|----------|
| Email + Studio inbox rows for: application received, status change, award, commission created | Chat threads, DMs, @mentions, read receipts |
| Org staff notification on new application | Creative ↔ org messaging UI |
| Creative notification on award | Public comment threads on briefs |

### Rationale

Users need status awareness without building a social messaging system.

### Future review trigger

- In-app threaded discussion on brief → **reject** unless separate product phase with moderation spec.

---

## 11. Explicit anti-features (Phase 2C)

| Anti-feature | Status |
|--------------|--------|
| Payments, checkout, invoicing, escrow | **Excluded** → 2E |
| Marketplace, sale listings, commerce CTAs | **Excluded** → 2E / ADR-25 |
| Production management (teams, milestones, deliverables) | **Excluded** → 2D |
| Patronage, Collector-published briefs | **Excluded** → 2E |
| Messaging, DMs, chat | **Excluded** — permanent guardrail |
| Platform auto-matching | **Excluded** — ADR-19-C rejected |
| Recommendations, similarity, “for you” | **Excluded** — ADR-20-A |
| Pay-to-boost brief placement | **Excluded** — ADR-17 |
| Application fees | **Excluded** |
| Public application counts as sort/rank | **Excluded** |
| Commission ratings | **Excluded** — ADR-16-C |
| Field Registry writes | **Excluded** — permanent guardrail |
| Studio sidebar on Field | **Excluded** — 2A rule |

**Placeholder rule:** No empty open-calls nav until feature ships in implementation train.

---

## 12. Phase 2C PR sequencing (product)

### Decision

Phase 2C ships as **sequenced product trains** after governance lock:

| Train | Product focus |
|-------|---------------|
| **PR1** | Programmes + briefs publish/read + open calls discovery |
| **PR2** | Applications (Studio submit + org review queue) |
| **PR3** | Awards + commissions + inbox notifications |
| **PR4** | Acceptance, audit, i18n, checkpoint |

Detailed product scope per train: [phase-2c-pr1-plan.md](./phase-2c-pr1-plan.md) and successor plans after PR1 lock.

**Engineering execution packages** are **separate documents** created after spec LOCKED — not part of this freeze.

### Rationale

Separates publish/read path from apply/review and award — reduces risk and enables staged QA.

### Future review trigger

- Collapsing trains requires spec unlock + founder approval.

---

## 13. ADR disposition summary (2C scope)

| ADR | Decision for 2C |
|-----|-----------------|
| ADR-01 | **B** — Optional Programme |
| ADR-02 | **A** — Brief with type enum |
| ADR-03 | **A** — Opportunity = language, not entity |
| ADR-04 | **B** — Commission distinct; Project in 2D |
| ADR-05 | **B** — Collaboration after 2D |
| ADR-06 | **B** — Admin + staff create programmes |
| ADR-07 | **D** — Admin + staff publish; subscription gate |
| ADR-08 | **C** — Tiered visibility by verification |
| ADR-09 | **B** — Gated apply modes |
| ADR-10 | **B** — Org invites roster in 2C |
| ADR-11 | **B** — Direct commission brief type |
| ADR-12 | **C** — Org-configurable per brief |
| ADR-15 | **A + B opt-in** — Verified badge + optional commission history |
| ADR-16 | **B deferred to Record link** — No ratings |
| ADR-19 | **A** — Manual filters only |
| ADR-20 | **A** — No recommendations |
| ADR-23 | **Policy hook only** — No payment UI in 2C |
| ADR-24 | **Deferred** — 2D+ |
| ADR-25 | **B** — Opportunity ≠ marketplace |

---

## Unlock procedure

Changes to §1–§12 require **founder + product sign-off** and version bump. Engineering may not expand 2C scope through implementation without spec unlock.

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2C founder decisions — pending founder review |
