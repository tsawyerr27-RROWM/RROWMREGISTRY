# Phase 2C Founder Decisions Freeze

**Document status:** FROZEN  
**Effective:** 31 May 2026  
**Authority:** [Phase 2C Opportunity Layer Blueprint](./phase-2c-opportunity-layer-blueprint.md) (DRAFT v0.3), [Phase 2C Opportunity Layer Spec](./phase-2c-opportunity-layer-spec.md) (LOCKED), [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md) (FROZEN), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT)  
**Purpose:** Capture **founder-level decisions settled before Phase 2C implementation begins**.  
**Scope:** Product philosophy only — **no implementation details, no database schema, no UI design.**

**Effect:** This document settles ADR outcomes for Phase 2C (ADR-01–08, 09–12, 15-B, 16, 19, 23 policy hooks). Phase 2A and 2B frozen decisions **remain binding** unless explicitly superseded here.

---

## 1. Opportunity object model

### Decision

**Phase 2C ships five workflow objects plus canonical Opportunity taxonomy: Programme (optional container), Brief, Application, Award, Commission. Opportunity is the canonical product term — not a separate database entity in 2C.**

| Object | Required in 2C | Notes |
|--------|----------------|-------|
| **Opportunity (taxonomy)** | **Canonical product root** (ADR-03 modified) | User-facing term for all publishable work intent; kinds include open call, residency, direct commission, production partner search; collaboration + team formation **planned kinds — 2D implementation** |
| Programme | **Optional** per brief (ADR-01-B) | Required for multi-brief seasons; standalone briefs allowed |
| Brief | **Required** | Primary publishable subtype for org-led opportunities |
| Application | **Required** for non-direct briefs | Studio submit path with registry-evidence context |
| Award | **Required** | Decision event; auditable |
| Commission | **Required** on award | **Opportunity Loop Slice 1 terminus**; Project deferred 2D |
| Project / Team / Milestone | **Excluded** | 2D — full loop with Record filing |

### Rationale

Elevates matching marketplace language without forcing a new persistence entity. Brief remains the implementation unit for org-led flows. Award separates decision from persistent Commission. Rejects orphan commissions (ADR-11-C). Aligns with Product Blueprint Opportunity Loop **Slice 1** ending at Commission.

### Future review trigger

- Collaboration Request / Team Formation implementation → 2D ADR-05 unlock.
- Patron-as-publisher brief → 2E unlock.

---

## 1a. Originator model

### Decision

Phase 2C deliberately supports a **single public publisher class**. Originator semantics are explicit — not inferred from “publisher” copy elsewhere in the package.

| Phase | Who may originate (publish) public Opportunities |
|-------|--------------------------------------------------|
| **2C** | **Organisation** (admin/staff, verified org) |
| **2D** | **Creative** — Collaboration Request; Team Formation Request (new originator paths) |
| **2E** | **Collector** — patron / Collector opportunity publishing |

**2C rules:**

| Rule | Detail |
|------|--------|
| Sole public publisher | **Organisation** — Creatives respond; they do not publish public opportunities in 2C |
| Representation | Gallery/organisation publishing **on behalf of** represented Creatives does **not** change originator semantics — publisher remains the Organisation |
| Creative-originated work | **Collaboration Request** and **Team Formation Request** are **strategically planned** Opportunity kinds — **intentionally deferred** to 2D implementation |
| Collector / patron | Deferred to **2E** — not a silent exclusion |

### Rationale

ADR-05: introducing Creative-as-publisher before Project/Team runtime would mean two originators with duplicate governance. Single-originator 2C preserves engineering boundary while the Opportunity taxonomy names future originator paths.

### Future review trigger

- Creative-originated publish → 2D ADR-05 unlock with Collaboration spec.
- Collector-as-publisher → 2E unlock with patron/commerce spec.

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
| Who may publish to Field | Organisation admin + staff with **verified org** |
| Subscription | Does **not** block first public cultural publish in 2C (ADR-07 modified) |
| Unverified org | Draft + roster-private briefs only — **no public opportunities listing** (ADR-08-C) |
| Registry-outcome-required briefs | **Require verified org** |
| Withdraw | Removes from discovery; preserves audit trail |

**Brief types in 2C:** open call, residency/award, direct commission, production partner search (formerly fabrication RFP).

**Excluded brief types:** patron commission, peer collaboration (implementation 2D — planned kind), sale/listing.

**Sector:** Required on public briefs — **single sector per brief**; closed taxonomy per Product Blueprint v1.1 §3. Creative profiles may declare **multiple** sectors. Multi-sector briefs deferred beyond 2C.

**Sector eligibility (founder decision — Culture wildcard):** Eligibility satisfied when **(A)** Creative `sectors[]` intersects Brief `sector`, **OR (B)** Creative declares **Culture**, **OR (C)** Brief `sector` is **Culture**. See §6a.

### Rationale

Publishing is an Organisation capability tied to verification — not SaaS gate before cultural contribution. Tiered visibility protects trust on registry-outcome briefs. Sector enables cultural-context matching required by Product Blueprint.

### Future review trigger

- Subscription tier shape for advanced publisher features → ADR-23 unlock with commerce spec.

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

**PR1 application policy (founder resolution):** No attachments in PR1. Application **locked after submit**; Creative may **withdraw**. Resubmit/revision deferred to 2C.1 unlock.

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

**Rule-based eligibility matching in scope — algorithmic ranking excluded (ADR-19 modified).**

| Capability | 2C stance |
|------------|-----------|
| Opportunities listing | Filter by practice, **sector**, org, programme, kind, date, verification |
| Sort | Date published, closing date, title — **not** application count or engagement |
| **Eligibility matching** | Studio surfaces briefs Creative **may** apply to when practice + sector (Culture wildcard rule) + verification rules pass — explainable, deterministic |
| Org shortlist assist | Filter applications by declared practice + registry-evidence practices — **manual** |
| Suggested briefs email | **Out of 2C** — optional 2C.1 with strict opt-in |
| Roster fast-path | Via participation mode — not algorithmic |
| Algorithmic auto-match / “for you” feed | **Forbidden** — ADR-19-C, ADR-20-A |

**Hub navigation:** Add **Opportunities** to Field explorer sub-nav or hub strip — **does not** change Records-first default tab (2B freeze §8).

**Public vocabulary:** `/field/opportunities` is canonical; “open call” is a kind/filter.

### Rationale

2B established non-algorithmic discovery; 2C adds **matching marketplace slice 1** via eligibility rules without ML ranking. Resolves false dichotomy between “matching marketplace” and “no platform auto-match.”

### Future review trigger

- Email digest of new briefs → separate spec with opt-in only.

---

## 6a. Sector eligibility (founder decision)

### Decision

**Culture = wildcard sector** for rule-based eligibility matching.

Eligibility is satisfied when **any** of:

| Condition | Rule |
|-----------|------|
| **A** | Creative `sectors[]` **intersects** Brief `sector` |
| **B** | Creative declares **Culture** in `sectors[]` |
| **C** | Brief `sector` is **Culture** |

**Cardinality:**

| Object | 2C rule |
|--------|---------|
| Brief | **Single** required sector |
| Creative profile | **Multiple** sectors allowed |
| Multi-sector briefs | **Deferred** beyond 2C |

Practice overlap and verification gates apply **in addition** to sector eligibility — see spec AC-SC5, AC-MT*.

### Rationale

Aligns with Product Blueprint v1.1 §3.4 Culture wildcard product decision. Keeps cross-sector discovery possible without multi-sector brief complexity in 2C.

---

## 6b. Practice eligibility (founder decision)

### Decision

**Any-match practice gate** for rule-based eligibility matching (Product Blueprint v1.1 §3.4).

| Condition | Rule |
|-----------|------|
| Empty `practices_required[]` on Brief | Practice gate **passes** (no practice requirement declared) |
| Non-empty `practices_required[]` | Gate passes when **∃** slug in `practices_required[]` that appears in Creative **declared practices ∪ registry-evidence practices** |

Sector (§6a), verification, participation mode, and application window apply **in addition** — all **AND**. Eligibility is **binary**: eligible or not eligible — no partial-match tier (AC-MT2).

See spec §2b, AC-PR1, AC-PR2.

### Rationale

Codifies deterministic practice matching aligned with Registry-backed trust (registry-evidence practices may satisfy gate) and Blueprint any-match semantics.

---

## 7. Trust, registry evidence, and verification (inheritance)

### Decision

**2A/2B trust hierarchy unchanged. Registry evidence is the primary 2C matching differentiator — not application volume.**

| Signal | Priority / role |
|--------|-----------------|
| Record verification | Highest (unchanged) |
| Registry-evidence portfolio at apply/review | **Required** — verified records linked to Creative footprint |
| Org verified badge + publisher footprint | On opportunity matching surfaces |
| Practice + sector eligibility | Rule-based matching inputs |
| Commission completion badge on Record | **2D** — not 2C |
| Application count / award count as rank | **Forbidden** |

**Opportunity trust copy:** Show org verification, registry footprint, programme-as-season context, registry outcome expectation — never “trusted because many applications.”

### Rationale

Opportunity layer must not introduce alternate reputation economy. Registry-backed trust is co-equal with workflow audit trail. ADR-13-C hierarchy preserved.

### Future review trigger

- Org commission history on profile (ADR-15-B) → public opt-in section in 2C or 2D spec.

---

## 8. URL and surface policy

### Decision

| Route | Policy |
|-------|--------|
| `/field/opportunities` | **Primary** canonical opportunities index |
| `/field/opportunities/[id]` | Opportunity detail — matching surface |
| `/field/programmes/[slug]` | Programme hub |
| `/field/commissions/[id]` | Optional minimal party summary |
| Legacy stubs | No new legacy URLs — greenfield 2C routes |

**Field chrome:** No Studio sidebar. Apply CTAs route to Studio authenticated flows.

**Registry URLs:** Unchanged — primary record discovery remains `/field/record/[id]`.

**Vocabulary:** “Open call” is an opportunity **kind** — not the primary namespace.

### Rationale

Clean matching-marketplace namespace aligned with cultural positioning; avoids job-board connotation of “open calls” as product name.

### Future review trigger

- `/field/open-calls` redirect alias to `/field/opportunities` — optional engineering convenience only.

---

## 9. Studio and Registry relationship

### Decision

| Concern | Owner |
|---------|--------|
| Programme/brief CRUD | **Studio** (Organisation workspace) |
| Application submit | **Studio** (Creative workspace) |
| Review, shortlist, award | **Studio** (Organisation workspace) |
| Opportunities read | **Field** (anonymous + auth read) |
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

**Placeholder rule:** No empty opportunities nav until feature ships in implementation train.

---

## 11a. Cultural presentation (new — v0.2)

### Decision

Public opportunity surfaces must follow **cultural presentation principles** (blueprint §Cultural presentation):

| Principle | 2C enforcement |
|-----------|----------------|
| Programme as season | Programme copy frames cohort/residency — not job requisition |
| Opportunity over vacancy | Primary vocabulary: opportunities |
| Registry outcome as cultural artifact | Frame filing as work on file — not compliance checkbox |
| Production partner search | No procurement/RFP tone on fabrication briefs |
| No popularity signals | No application counts, view counts, “hot” badges |
| Trust before transaction | Publisher footprint precedes scope/timeline |

Spec AC-CP* enforce copy guardrails.

### Rationale

Prevents 2C shipping as generic commissioning SaaS adjacent to Registry.

---

## 11b. Opportunity Loop boundary (new — v0.2)

### Decision

**Opportunity Loop Slice 1 (2C) ends at Commission.** Full Product Blueprint loop v1 including **Project** and **Record filing** completes in **2D**.

This is an explicit **narrowing** of the public “loop v1” claim for 2C — documented delta against Product Blueprint v1.1 §Opportunity Loop until 2D ships Project.

### Rationale

Preserves engineering boundary while aligning strategic narrative toward Registry outcomes.

---

## 11c. Collaboration matching boundary

### Decision

**Matching scope expands by phase — Collaboration is a strategic pillar, not an omitted feature.**

| Phase | Matching scope |
|-------|----------------|
| **2C** | **Creative ↔ Organisation** — eligibility-qualified opportunity discovery, apply with registry evidence, org review |
| **2D** | **Creative ↔ Creative** — Collaboration Request, Team Formation Request; **Project ↔ Team** runtime |
| **2E** | **Collector / Patron** participation — patron opportunity publishing |

**Collaboration Request** and **Team Formation Request** are **recognised Opportunity kinds** in the product taxonomy. Their presence is **strategic** — naming the long-term matching vision. **Implementation is intentionally deferred to Phase 2D** alongside Project and Team objects. They are **not** 2C implementation scope.

2C delivers org-led matching marketplace slice 1. Peer collaboration matching unlocks in 2D — not as an afterthought, but as the declared next matching expansion.

Spec §6d restates this boundary for acceptance criteria.

### Rationale

Preserves Registry-backed matching marketplace vision while keeping 2C implementation bounded. Avoids silent exclusion of collaboration from product narrative.

---

## 12. Phase 2C PR sequencing (product)

### Decision

Phase 2C ships as **sequenced product trains** after governance lock. **PR1 implementation authority:** [phase-2c-pr1-implementation-plan.md](./phase-2c-pr1-implementation-plan.md) (IMPLEMENTATION SOURCE OF TRUTH) — supersedes [phase-2c-pr1-plan.md](./phase-2c-pr1-plan.md) (P2C-4) where train boundaries conflict.

| Train | Product focus |
|-------|---------------|
| **PR1** | Publish → discover → eligibility → apply → org review (Opportunity Loop slice through applications) |
| **PR2** | Awards + commissions + inbox notifications |
| **PR3** | Acceptance, audit, i18n, full 2C checkpoint |

Detailed PR1 scope: [phase-2c-pr1-implementation-plan.md](./phase-2c-pr1-implementation-plan.md). Successor PR2/PR3 plans authored after PR1 lock.

**Engineering execution packages** are **separate documents** created after spec LOCKED — not part of this freeze.

### Rationale

PR1 delivers the first shippable matching-marketplace slice (Creative ↔ Organisation through review). Awards and notifications follow once apply/review is stable.

### Future review trigger

- Collapsing or splitting trains requires spec unlock + founder approval.

---

## 13. ADR disposition summary (2C scope)

| ADR | Decision for 2C |
|-----|-----------------|
| ADR-01 | **B** — Optional Programme |
| ADR-02 | **A** — Brief with type enum |
| ADR-03 | **Modified** — Opportunity = canonical taxonomy root; Brief = primary publishable subtype |
| ADR-04 | **B** — Commission distinct; Project in 2D; Slice 1 ends at Commission |
| ADR-05 | **B** — Collaboration kinds planned; implementation after 2D |
| ADR-06 | **B** — Admin + staff create programmes |
| ADR-07 | **Modified** — Admin + staff publish; verified org required; subscription does not block first publish |
| ADR-08 | **C** — Tiered visibility by verification |
| ADR-09 | **B** — Gated apply modes |
| ADR-10 | **B** — Org invites roster in 2C |
| ADR-11 | **B** — Direct commission brief type |
| ADR-12 | **C** — Org-configurable per brief |
| ADR-15 | **A + B opt-in** — Verified badge + optional commission history |
| ADR-16 | **B deferred to Record link** — No ratings |
| ADR-19 | **Modified** — Eligibility matching in scope; algorithmic rank excluded |
| ADR-20 | **A** — No recommendations |
| ADR-23 | **Policy hook only** — No payment UI in 2C; subscription not first-publish gate |
| ADR-24 | **Deferred** — 2D+ |
| ADR-25 | **B** — Opportunity ≠ marketplace |

---

## Unlock procedure

Changes to §1–§12 and §1a, §6a, §6b, §11a–§11c require **founder + product sign-off** and version bump. Engineering may not expand 2C scope through implementation without spec unlock.

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2C founder decisions — pending founder review |
| 0.2 | 31 May 2026 | DRAFT | Founder review revision — matching marketplace, Sector, eligibility matching, Opportunity taxonomy, cultural presentation, Loop Slice 1 |
| 0.3 | 31 May 2026 | DRAFT | Freeze finalisation — Originator model §1a, Sector eligibility §6a (Culture wildcard), Collaboration boundary §11c |
| 0.4 | 31 May 2026 | **FROZEN** | Founder sign-off; PR1 train resequence §12; practice eligibility §6b; PR1 application policy §4 |
