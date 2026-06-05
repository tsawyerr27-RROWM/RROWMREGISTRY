# Phase 2 Architecture Decision Record — The Field

**Document status:** DRAFT  
**Drafted:** 31 May 2026  
**Authority:** [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED), [Phase 1 Scope Freeze](./phase-1-freeze.md) (FROZEN)  
**Purpose:** Identify **founder-level decisions** that must be resolved before Phase 2 implementation begins.  
**Scope:** Product architecture only. **No UI. No database schema. No implementation details.**

**How to use:** Each decision block lists **options**, **pros**, **cons**, and a **recommendation**. Recommendations are draft guidance for founder review — not locked until this document is promoted from DRAFT and decisions are marked **DECIDED**.

---

## Decision index

| ID | Topic | Blocks |
|----|-------|--------|
| ADR-01 | Core object: Programme | 2c+ |
| ADR-02 | Core object: Brief | 2c+ |
| ADR-03 | Core object: Opportunity (term vs entity) | 2c+ |
| ADR-04 | Core object: Project vs Commission | 2c–2d |
| ADR-05 | Core object: Collaboration (peer-led) | 2d+ |
| ADR-06 | Who may create programmes | 2c+ |
| ADR-07 | Who may publish briefs / opportunities | 2c+ |
| ADR-08 | Verification gates for publishing | 2c+ |
| ADR-09 | Creative participation: application | 2c+ |
| ADR-10 | Creative participation: invitation | 2c+ |
| ADR-11 | Creative participation: direct award | 2c+ |
| ADR-12 | Creative participation: hybrid model | 2c+ |
| ADR-13 | Reputation: Registry records | 2a+ |
| ADR-14 | Reputation: production credits | 2d+ |
| ADR-15 | Reputation: organisations | 2a+ |
| ADR-16 | Reputation: commissions | 2d+ |
| ADR-17 | Reputation: explicit exclusions | 2a+ |
| ADR-18 | Discovery: search | 2a–2b |
| ADR-19 | Discovery: matching | 2c+ |
| ADR-20 | Discovery: recommendations | 2c+ |
| ADR-21 | Film / production extensions | 2d+ |
| ADR-22 | Revenue: org subscription vs verify tier | 2a+ |
| ADR-23 | Revenue: brief posting | 2c+ |
| ADR-24 | Revenue: commission facilitation | 2d+ |
| ADR-25 | Revenue: marketplace vs Field Opportunity | 2e |
| ADR-26 | Revenue: patron line | 2e |
| ADR-27 | Phase 2A: public URL canonical form | **2a** |
| ADR-28 | Phase 2A: signed-in chrome on public browse | **2a** |
| ADR-29 | Phase 2A: redirect retention policy | **2a** |
| ADR-30 | Phase 2A: scope boundary (Record-only) | **2a** |
| ADR-31 | Phase 2A: “Registry” in user-facing copy | **2a** |
| ADR-32 | Phase 2A: certificate page visibility | **2a** |

---

## 1. Core unit model

### ADR-01 — Programme

**Question:** Is Programme a required container for every brief, or an optional grouping object?

| Option | Description |
|--------|-------------|
| **A. Required** | Every brief must belong to exactly one Programme |
| **B. Optional** | Briefs may exist standalone; Programme groups related briefs when useful |
| **C. Deferred** | No Programme in MVP; flat brief list only; add Programme in 2b/2c |

**Pros**

| Option | Pros |
|--------|------|
| A | Strong org narrative; programme pages; season analytics; matches festival/museum mental model |
| B | Flexible for one-off commissions; programmes for recurring orgs; lower friction for first brief |
| C | Fastest Opportunity MVP; fewer objects to explain |

**Cons**

| Option | Cons |
|--------|------|
| A | Friction for single open calls; empty programme problem for new orgs |
| B | Two publishing paths to document; orgs may skip programmes and lose discoverability structure |
| C | Retrofit Programme later may require migration and URL strategy change |

**Recommendation:** **B — Optional Programme.** Require Programme for multi-brief seasons (org setting); allow standalone Brief for single open calls. Matches Blueprint §2.7 without forcing structure on every publisher.

**Status:** PENDING

---

### ADR-02 — Brief

**Question:** What is the atomic publishable unit of intent on The Field?

| Option | Description |
|--------|-------------|
| **A. Brief only** | All opportunities are Briefs; types are brief templates |
| **B. Brief + subtypes** | Brief is base; distinct product types (residency, RFP, patron) as first-class variants |
| **C. Brief + legacy “listing”** | Unify `market_listings` semantics into Brief type “sale” |

**Pros**

| Option | Pros |
|--------|------|
| A | Single object lifecycle; simplest API and copy |
| B | Clear templates for film, residency, fabrication; better filters |
| C | One commercial object model |

**Cons**

| Option | Cons |
|--------|------|
| A | Film/residency/patron need rich templates bolted on as fields |
| B | More template maintenance; risk of type explosion |
| C | Conflates sale of existing Record with production of new Record (Blueprint contradiction) |

**Recommendation:** **A for MVP (2c), evolve toward B.** Ship one Brief object with `brief_type` enum (open call, direct commission, residency, fabrication RFP). Add template presets in 2d — not separate top-level objects.

**Status:** PENDING

---

### ADR-03 — Opportunity (term vs entity)

**Question:** Is “Opportunity” a separate object, or user-facing language for Brief (+ Programme context)?

| Option | Description |
|--------|-------------|
| **A. Synonym** | “Opportunity” = marketing term for published Brief; no `Opportunity` object |
| **B. Wrapper entity** | Opportunity aggregates Brief + listing metadata + save/bookmark state |
| **C. Umbrella** | Opportunity = union of Brief (org-led) and Collaboration invite (peer-led) |

**Pros**

| Option | Pros |
|--------|------|
| A | Minimal model; aligns Blueprint Programme → Brief → Application |
| B | Clean separation of listing/discovery from contract object |
| C | Single discovery feed for all “things to join” |

**Cons**

| Option | Cons |
|--------|------|
| A | “Field Opportunity network” (Blueprint) is conceptual only |
| B | Extra object; Brief and Opportunity may drift |
| C | Peer collaborations differ materially from org briefs |

**Recommendation:** **A — Synonym for MVP.** Public copy: “Open calls and opportunities”; system object: **Brief**. Revisit **C** when Collaboration ships (2d). Do not introduce standalone Opportunity entity in 2c.

**Status:** PENDING

---

### ADR-04 — Project vs Commission

**Question:** How do Commission (contract) and Project (runtime) relate?

| Option | Description |
|--------|-------------|
| **A. 1:1 merged name** | Single object “Project” includes award terms |
| **B. 1:1 distinct** | Commission = contract; Project = runtime container (Blueprint) |
| **C. Project-only** | Award creates Project; no Commission object |

**Pros**

| Option | Pros |
|--------|------|
| A | One ID for users; simpler status tracking |
| B | Clear separation: legal/award vs production; matches Blueprint §2.8, §12.2 |
| C | Fewest objects |

**Cons**

| Option | Cons |
|--------|------|
| A | Blurs award moment vs production start |
| B | Two IDs; must explain relationship |
| C | Loses award-before-kickoff state |

**Recommendation:** **B — 1:1 distinct.** Brief awards **Commission**; Commission instantiates **Project**. Public party-visible status may say “Commission” while internal team tools say “Project” — product copy decision in spec, not a third object.

**Status:** PENDING

---

### ADR-05 — Collaboration (peer-led production)

**Question:** When do peer-led Collaborations enter scope relative to org Commissions?

| Option | Description |
|--------|-------------|
| **A. With Opportunity MVP (2c)** | Creatives can spawn collaborations alongside org briefs |
| **B. After Production (2d)** | Org commission workflow proven first |
| **C. Post-2e or never** | Org-only production orchestration |

**Pros**

| Option | Pros |
|--------|------|
| A | Inclusive for independent Creatives; “Opportunity” feels complete |
| B | Reduces MVP scope; org B2B revenue first |
| C | Simplest governance; org-as-publisher only |

**Cons**

| Option | Cons |
|--------|------|
| A | Two originators; duplicate team/milestone logic early |
| B | Creatives wait for peer path |
| C | Contradicts Blueprint multi-discipline peer teams |

**Recommendation:** **B — After Production (2d).** 2c is org Brief → Application → Commission only. Collaboration as peer-led Project with shared invite model in 2d.

**Status:** PENDING

---

## 2. Originator permissions

### ADR-06 — Who may create Programmes

| Option | Description |
|--------|-------------|
| **A. Org admin only** | `gallery_users` role admin |
| **B. Admin + staff** | Admin and staff roles |
| **C. Any org member** | Including associated creatives on roster |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Tight brand control | Bottleneck on small orgs |
| B | Matches existing gallery staff model; practical | Staff need clear audit trail |
| C | Too loose; roster artists are not publishers |

**Recommendation:** **B — Admin + staff**, same as catalogue filing authority today. Creative roster members cannot create Programmes unless they hold staff role.

**Status:** PENDING

---

### ADR-07 — Who may create / publish briefs (opportunities)

| Option | Description |
|--------|-------------|
| **A. Org admin only** | Single publisher |
| **B. Admin + staff** | Delegated publishing |
| **C. Verified org only** | Unverified orgs cannot publish |
| **D. B + subscription gate** | Staff may publish if org subscription active |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Maximum control | Ops burden on admins |
| B | Scales for festivals/production cos | Needs permission model |
| C | Reduces spam | Blocks legitimate new orgs |
| D | Aligns revenue; quality bar | Complex gating; support edge cases |

**Recommendation:** **D — Admin + staff with active subscription gate for public publish.** Draft briefs allowed without subscription; **publish to Field** requires subscription (or verified tier bundle). Unverified orgs: draft only or roster-private briefs (see ADR-08).

**Status:** PENDING

---

### ADR-08 — Verification requirements for publishing

| Option | Description |
|--------|-------------|
| **A. None** | Subscription only |
| **B. Verified for public open calls** | `galleries.verified` required for Field listing |
| **C. Tiered** | Unverified = roster-only briefs; verified = public open calls |
| **D. Verified for registry-outcome briefs only** | Public listing allowed; outcome requirement gated |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Lowest friction | Spam and trust risk |
| B | Strong trust on open calls | Slow onboarding |
| C | Progressive trust path | Two brief visibility modes to explain |
| D | Protects registry integrity | Unverified orgs still listed |

**Recommendation:** **C — Tiered visibility.** Verified org → public `/field/open-calls`. Unverified → brief visible to roster / invite-only until verified. Registry-outcome-required briefs **always** require verified org (combine with D rule).

**Status:** PENDING

---

## 3. Creative participation model

### ADR-09 — Application (open apply)

| Option | Description |
|--------|-------------|
| **A. Always open** | Any authenticated Creative may apply to any public brief |
| **B. Gated apply** | Brief flags: open / roster-only / invite-only |
| **C. Apply + fee** | Paid application (not recommended per Blueprint) |

**Recommendation:** **B — Gated apply** with default **open** for verified-org public briefs. Org selects roster-only for represented-artist-first workflows.

**Status:** PENDING

---

### ADR-10 — Invitation

| Option | Description |
|--------|-------------|
| **A. No invitations in MVP** | Application only |
| **B. Org invites roster Creatives** | Parallel to application; invite bypasses open queue |
| **C. Org invites + team invites on Project** | Invitation at brief and at project team layer |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Simplest 2c | Ignores existing roster/invite muscle memory |
| B | Matches representation model | Two paths to same commission |
| C | Full production flexibility | Complex; belongs in 2d |

**Recommendation:** **B for 2c** (org invites roster to apply or pre-accept). **C for 2d** (department head invites on Project team).

**Status:** PENDING

---

### ADR-11 — Direct award (no application period)

| Option | Description |
|--------|-------------|
| **A. Disallowed** | All awards follow published brief + application window |
| **B. Direct commission** | Org creates brief type “direct”; no public listing; award named Creative |
| **C. Direct without brief** | Award creates Commission/Project directly |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Maximum transparency | Ignores real commissioning practice |
| B | Supports sole-source commission; still auditable | “Brief” may never be public |
| C | Fastest for orgs | Weak discovery story; audit gap |

**Recommendation:** **B — Direct commission brief type.** Not listed on open calls; still creates Commission → Project trail. Disallow **C** (no orphan commissions).

**Status:** PENDING

---

### ADR-12 — Hybrid participation model (founder decision)

| Option | Description |
|--------|-------------|
| **A. Application-first** | Default; invitation and direct are exceptions |
| **B. Invitation-first for verified orgs** | Roster invitation before public open call |
| **C. Org-configurable per brief** | Publisher chooses: open / roster-only / invite-only / direct |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Clearest public fairness story | Less flexible |
| B | Privileges existing relationships | Harder for new Creatives |
| C | Maximum flexibility | Highest explainability cost |

**Recommendation:** **C — Org-configurable per brief**, default **open** for public verified briefs. Enforces ADR-09/B/D in one model.

**Status:** PENDING

---

## 4. Reputation model

### ADR-13 — Records (Registry-backed trust)

| Option | Description |
|--------|-------------|
| **A. Verification-primary** | Public sort and trust bands led by verification + certificate |
| **B. Footprint-primary** | Count of records dominates profile trust |
| **C. Balanced hierarchy** | Blueprint order: verification → certificate → continuity → participation |

**Recommendation:** **C — Balanced hierarchy** exactly as Blueprint §12 and Phase 2 blueprint §12.1. Never sort explorer by raw record count alone.

**Status:** PENDING

---

### ADR-14 — Credits (production roles vs registry authorship)

| Option | Description |
|--------|-------------|
| **A. Registry only** | Public credit = participation chronology + confirmations only |
| **B. Field team + Registry** | Field shows team roles; Registry shows confirmed authorship separately |
| **C. Unified credit line** | Merge team role into registry display without confirmation |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Single trust source | Under-represents crew before filing |
| B | Honest dual layer | Users must understand difference |
| C | Simplest UX | Misstates trust; violates preservation spirit |

**Recommendation:** **B — Field team + Registry.** Field project pages show production roles; Record page shows **confirmed** registry participation only. Never imply registry authorship from Field team row alone.

**Status:** PENDING

---

### ADR-15 — Organisations (publisher reputation)

| Option | Description |
|--------|-------------|
| **A. Verified badge only** | Binary trust signal |
| **B. Verified + commission history** | Org profile lists delivered commissions (public opt-in) |
| **C. Verified + subscriber tier** | Tier labels (e.g. partner org) |

**Recommendation:** **B with public opt-in**, plus **A** always visible. Avoid **C** as pay-to-display rank; subscription gates **publish**, not badge shape.

**Status:** PENDING

---

### ADR-16 — Commissions (production completion as signal)

| Option | Description |
|--------|-------------|
| **A. No public commission reputation** | Only linked Record matters |
| **B. Completion badge** | “Delivered via RROWM” on Record when filed from commission |
| **C. Commission ratings** | Post-project scores (excluded per Blueprint) |

**Recommendation:** **B only.** Link Record → commission context on Field Record page. Reject **C** explicitly.

**Status:** PENDING

---

### ADR-17 — Reputation explicit exclusions

**Question:** Which signals are **forbidden** on The Field?

| Exclusion | Adopt? |
|-----------|--------|
| Follower / following counts | **Yes — exclude** |
| Like, heart, star from anonymous users | **Yes — exclude** |
| Algorithmic “influence score” | **Yes — exclude** |
| Pay-to-boost discovery placement | **Yes — exclude** |
| Pay-to-verify without attestation | **Yes — exclude** |
| Field team role displayed as registry verification | **Yes — exclude** |
| NFT / token-granted reputation | **Yes — exclude** |
| Org-subscriber tier as sort rank | **Recommend exclude** |

**Recommendation:** Adopt all exclusions. Document in Phase 2 spec as **AC-reputation** guardrails. Subscriber tier affects **whether** org may publish, not **where** brief appears in sort order.

**Status:** PENDING

---

## 5. Discovery model

### ADR-18 — Search

| Option | Description |
|--------|-------------|
| **A. Filter-only (2a)** | Facets on explorer; no full-text search |
| **B. Full-text search (2b)** | Title, artist name, registry_id, org name |
| **C. External search (Algolia/etc.)** | Managed index |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Ships with Field: Record migration | Limited discoverability |
| B | Expected UX for registry scale | Engineering cost |
| C | Best relevance | Vendor cost; ops |

**Recommendation:** **A for 2a**, **B for 2b** using existing DB/read-model queries first; **C** only if scale demands (founder decision at 2b spec).

**Status:** PENDING

---

### ADR-19 — Matching (brief ↔ Creative)

| Option | Description |
|--------|-------------|
| **A. Manual filters only** | User sets discipline, geo, org |
| **B. Org-side assist** | Org filters applications by declared practice |
| **C. Platform auto-match** | System ranks Creatives for brief |

**Recommendation:** **A public-side; B org-side for 2c.** Reject **C** as default (Blueprint: explainable, not opaque). Optional opt-in digest (ADR-20) is not auto-match.

**Status:** PENDING

---

### ADR-20 — Recommendations

| Option | Description |
|--------|-------------|
| **A. None** | No recommendations |
| **B. Opt-in email digest** | Saved disciplines → new brief alerts |
| **C. In-app “ suggested for you” | Persistent recommendation feed |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Purest anti-feed stance | Misses re-engagement |
| B | Transactional; opt-in | Email deliverability |
| C | Engagement | Feels social; hard to explain |

**Recommendation:** **A for 2a–2c.** **B optional late 2c** if org brief volume warrants. Defer **C** indefinitely unless founder explicitly wants soft recommendations (would require ADR-17 review).

**Status:** PENDING

---

## 6. Film and production extensions

### ADR-21 — Film and production scope

| Sub-decision | Options | Recommendation |
|--------------|---------|----------------|
| **When film templates ship** | 2c with brief types / 2d with teams | **2d** — after Commission → Project exists |
| **Crew model** | Flat role list / department hierarchy | **Department hierarchy** (lead → heads → contributors) for film; flat for simple commissions |
| **Registry outcome for film** | Single still / installation record / policy TBD for born-digital video | **Founder decision:** default **registered artefact = editioned still or installation object**; born-digital master as metadata hash policy — legal review before “film as record” claim |
| **Fabrication RFP** | Same as film template / separate | **Same milestone engine**, separate brief_type preset |
| **Multi-record deliverables** | One project → one primary Record / many Records | **One primary Record** per commission MVP; secondary objects Phase 2.x |

**Film ADR — overall recommendation:** Include film as **first-class brief_type and crew template in 2d**, not 2c. 2c proves org → apply → award; 2d proves team → milestone → deliverable → register.

**Status:** PENDING (born-digital record policy **requires founder/legal**)

---

## 7. Revenue model decisions

### ADR-22 — Organisation subscription vs verified tier

| Option | Description |
|--------|-------------|
| **A. Separate** | Subscription = seats/features; Verified = trust credential (existing) |
| **B. Bundled** | Verified included in premium subscription |
| **C. Verified fee only** | No subscription; pay per verify |

**Recommendation:** **B — Bundled premium tier** for go-to-market simplicity, with **A** semantics documented: verification still requires attestation, not payment alone. Reject **C** (pay-to-verify risk).

**Status:** PENDING

---

### ADR-23 — Brief posting fees

| Option | Description |
|--------|-------------|
| **A. Included in subscription** | Unlimited briefs per tier cap |
| **B. Per-brief fee** | À la carte posting |
| **C. Freemium** | N free public briefs then paid |

**Recommendation:** **A with fair-use cap** (e.g. active brief limit per tier). **C** as fallback if subscription adoption lags.

**Status:** PENDING

---

### ADR-24 — Commission facilitation fee

| Option | Description |
|--------|-------------|
| **A. None** | Revenue from subscription only |
| **B. Optional % on award value band** | Declared compensation band on brief |
| **C. Flat fee on award** | Per commission |

**Recommendation:** **Defer to 2d** — **A** until production volume proven, then pilot **B** with org opt-in and transparent disclosure. Avoid hidden fees on Creative applicants.

**Status:** PENDING

---

### ADR-25 — Marketplace vs Field Opportunity

| Option | Description |
|--------|-------------|
| **A. Field: Commerce lane** | `market_listings` as sale-of-existing-Record under Field |
| **B. Registry sale RPC only** | Keep `complete_market_sale`; remove/sunset listing UX |
| **C. Status quo** | Parallel systems until further notice |

**Recommendation:** **B for product clarity** — Field Opportunity owns **new production**; Registry path owns **transfer of existing Record**. Deprecate public listing UX; retain sale completion for provenance. Founder must confirm impact on live `market_listings` users.

**Status:** PENDING — **founder decision**

---

### ADR-26 — Patron (Collector) commission line

| Option | Description |
|--------|-------------|
| **A. Ship in 2e** | Collector-funded briefs |
| **B. Never** | Collectors custody-only |
| **C. Org-proxy only** | Collector funds via org programme |

**Recommendation:** **Defer A to 2e** after org commissioning proven. Prefer **C** if patron demand appears before 2e (collector funds org programme, org publishes brief).

**Status:** PENDING

---

## 8. Decisions required before Phase 2A implementation

Phase **2a — Field: Record** is public read migration only (Blueprint §13). The following must be **DECIDED** before 2a spec lock. Opportunity/Project ADRs (1–7, 9–12, 19–21, 23–26) may remain **PENDING** until 2c/2d planning.

### ADR-27 — Public URL canonical form

| Option | Description |
|--------|-------------|
| **A. Full Field namespace** | `/field/explorer`, `/field/record/[id]`, profiles under `/field/*` |
| **B. Staggered** | Explorer/record first; profiles remain legacy URLs until 2b |
| **C. Dual canonical** | Keep `/registry` and `/field/explorer` both canonical (reject) |

**Pros / Cons**

| Option | Pros | Cons |
|--------|------|------|
| A | Clean story; one public namespace | Big-bang redirect |
| B | Lower 2a risk | Split namespace longer |
| C | — | SEO and trust fragmentation |

**Recommendation:** **A for record surfaces** (`/field/explorer`, `/field/record`, `/field/verify`). **B for profiles** if schedule tight — profiles in 2a.1. Never **C**.

**Status:** PENDING — **blocks 2a**

---

### ADR-28 — Signed-in chrome on public Field browse

| Option | Description |
|--------|-------------|
| **A. Remove Studio shell** | Lightweight header only on Field (Blueprint chrome rule) |
| **B. Keep shell for signed-in users** | Phase 1 behaviour on `/registry` |
| **C. Header + minimal account menu** | No sidebar; auth-aware header |

**Recommendation:** **C** (implements Blueprint §2.2 rule 3). Explicitly **reject B** — contradicts Field layer model and Phase 1 known overlap.

**Status:** PENDING — **blocks 2a**

---

### ADR-29 — Redirect retention policy

| Option | Description |
|--------|-------------|
| **A. 301 ≥ 2 release cycles** | Blueprint §7.3 |
| **B. Permanent 301** | Never remove |
| **C. 302 temporary** | Reversible |

**Recommendation:** **A minimum; prefer B** for `registry_id`-stable paths. Document redirect map in 2a spec.

**Status:** PENDING — **blocks 2a**

---

### ADR-30 — Phase 2a scope boundary

| Option | Description |
|--------|-------------|
| **A. Record-only strict** | Explorer, record, verify, redirects — no open calls, no profile enrichment |
| **B. Record + profiles** | Include `/field/creative|organisation|collector/[slug]` migration |
| **C. Record + discovery filters** | Include discipline filters without Opportunity objects |

**Recommendation:** **B** — ship profile URL migration with record surfaces (Blueprint 2a table). **Exclude** open calls and brief objects (**A** for Opportunity). **C** filters → 2b.

**Status:** PENDING — **blocks 2a**

---

### ADR-31 — “Registry” in user-facing copy on Field pages

| Option | Description |
|--------|-------------|
| **A. Dual label** | Surface “The Field”; record trust copy says “Registry record”, “Registry ID” |
| **B. Field-only copy** | Remove “Registry” from public headings |
| **C. Registry primary** | Keep “Registry” as explorer title |

**Recommendation:** **A — Dual label.** Field is surface; Registry is trust system (matches product-language-freeze three surfaces).

**Status:** PENDING — **blocks 2a copy/i18n**

---

### ADR-32 — Certificate page visibility

| Option | Description |
|--------|-------------|
| **A. Verify public; full cert auth** | `/field/verify` public status; full certificate doc requires session |
| **B. Migrate `/certificate/[id]` to Field** | Optional auth-gated cert view |
| **C. Deprecate standalone cert route** | Verify-only public |

**Recommendation:** **A** for 2a. **B** optional if standalone cert URL heavily used — measure analytics before 2a.

**Status:** PENDING — **blocks 2a if B chosen**

---

### Phase 2A decision gate summary

| Must decide before 2a spec lock | ADR |
|---------------------------------|-----|
| Canonical URLs and redirect policy | 27, 29 |
| Signed-in public chrome | 28 |
| 2a scope (profiles in or out) | 30 |
| Copy strategy (Field vs Registry) | 31 |
| Certificate public/auth split | 32 |
| Record trust hierarchy | 13, 17 |
| Org verified badge on public profiles | 15 (display only; no briefs yet) |

| Explicitly **not** required for 2a | ADR |
|-------------------------------------|-----|
| Programme, Brief, Project model | 01–05 |
| Publishing permissions | 06–08 |
| Application / invitation / award | 09–12 |
| Matching and recommendations | 19–20 |
| Film templates | 21 |
| Brief posting and facilitation fees | 23–24 |
| Marketplace and patron | 25–26 |

---

## Approval and promotion

| Step | Owner | Outcome |
|------|-------|---------|
| Founder review | Product/founder | Each ADR marked DECIDED with chosen option |
| Blueprint alignment | Product | Amend Blueprint v1.1 if ADR contradicts — version bump |
| 2a spec lock | Engineering + product | Only after ADR 27–32 + 13/17 decided |
| Document promotion | Governance | DRAFT → ACTIVE in DOCUMENT_GOVERNANCE when complete |

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Parent architecture |
| [product-blueprint-v1.1.md](./product-blueprint-v1.1.md) | Strategic constraints |
| [phase-1-freeze.md](./phase-1-freeze.md) | Phase 1 boundary |
| [product-language-freeze.md](./product-language-freeze.md) | Surface labels |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial ADR set from Phase 2 Field blueprint |
