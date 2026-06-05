# Phase 2 Blueprint — The Field

**Document status:** DRAFT  
**Drafted:** 31 May 2026  
**Authority:** [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED), [Phase 1 Scope Freeze](./phase-1-freeze.md) (FROZEN)  
**Predecessor:** Phase 1 Studio Foundation — production-certified @ `checkpoint-phase1-production`  
**Constraint:** Preserve all existing Registry functionality; Field reads and orchestrates — **never mutates the ledger directly**  
**Scope of this document:** Product architecture only. **No UI designs. No database table designs.**

---

## Document purpose

Define **The Field** as the **third surface** of the RROWM ecosystem — alongside **Studio** (identity and stewardship) and **Registry** (system of record).

Phase 1 delivered Studio Foundation and left The Field as a **terminology label only**. Phase 2 introduces The Field as a **public production and discovery layer** that connects participants to opportunities, projects, and Registry outcomes.

This blueprint is a **DRAFT** planning artifact. Implementation requires a future locked Phase 2 specification, feasibility review, and explicit unlock of frozen Phase 1 scope where routes or surfaces overlap.

---

## 1. Vision

### 1.1 North star

The Field is where **cultural production becomes visible and actionable** — before, during, and after a work enters the Registry.

A visitor discovers verified records and public practices. A Creative finds commissioning opportunities matched to capability. An Organisation publishes briefs, assembles teams, and delivers outcomes that **file to the Registry as trusted records**. A Collector enters through custody and provenance — with an optional future path to patron-funded production.

**The Registry remains the enduring truth layer.** The Field does not compete with the ledger; it **feeds** it.

### 1.2 Strategic position

| Layer | Role | Field relationship |
|-------|------|-------------------|
| **Registry** | Trust, provenance, verification, permanence | Field **reads** record truth; all filings go through Registry RPCs |
| **Studio** | Identity, practice, stewardship, transactional inbox | Field **surfaces** public projections; Studio **owns** edits and applications |
| **The Field** | Discovery, opportunities, production orchestration, public verify | Third surface — anonymous-first, auth-enhanced |

### 1.3 What The Field is not

- Not a social network (no follow graph, algorithmic feed, or DM-first product)
- Not a generic freelance marketplace (Upwork/Fiverr positioning)
- Not a replacement for legal title transfer or land registry
- Not a blockchain/NFT trust model (optional anchors remain ops-adjacent)
- Not a second Studio — no private portfolio editing or account lifecycle on Field routes

### 1.4 Success criteria (product-level)

| Horizon | Outcome |
|---------|---------|
| **Field: Record** | Public discovery and verify under `/field/*`; Registry URLs redirect; trust hierarchy preserved |
| **Field: Discovery** | Creative, Organisation, and Collector public profiles unified under Field namespace |
| **Field: Opportunity** | Organisation briefs → Creative applications → awarded commissions → deliverable → Registry record |
| **Field: Production** | Multi-discipline teams (including film crews) with milestone delivery |
| **Ecosystem** | End-to-end journey: brief → apply → produce → register → public record — without ledger bypass |

---

## 2. Relationship to Studio

### 2.1 Division of responsibility

| Concern | Studio | The Field |
|---------|--------|-----------|
| Authentication session | **Owns** | Consumes (auth-gated sub-routes only) |
| Profile editing | **Owns** | Reads public projection |
| Practice types and capabilities (future) | **Owns** source data | Displays filtered discovery |
| Personal archive | **Owns** mutations | May show save CTA + count on public record |
| Registry stewardship (register, verify, represent) | **Owns** workflows | Deep-links to Studio actions |
| Applications to briefs | **Owns** submission UX | Hosts public brief; receives apply intent |
| Commission / project inbox | **Owns** (V3+) | Hosts party-visible status where appropriate |
| Account lifecycle | **Owns** | No Field account settings |

### 2.2 Interaction patterns

1. **Field → Studio (CTA):** Public record page offers “Register similar”, “Claim ownership”, “Continue provenance”, “Apply to brief” — authenticated actions execute in Studio or Registry APIs.
2. **Studio → Field (publish):** Organisation publishes brief from Studio; public listing appears on Field. Creative applies from Studio; award notification in Studio inbox.
3. **Chrome rule:** Field routes **do not** render Studio sidebar shell. Signed-in users on Field see lightweight header chrome with Studio entry — not full workspace nav (resolves Phase 1 `SignedInCatalogueShellLayout` overlap on `/registry`).

### 2.3 Studio routes unchanged by Field intro

Phase 1 canonical Studio namespace (`/studio/creative`, `/studio/collector`, `/studio/organisation`, `/studio/account`, `/studio/archive`) remains the authenticated home. Field adds **parallel public routes** — it does not subsume Studio.

### 2.4 Future Studio extensions (Field-dependent)

| Studio extension | Triggered by Field |
|------------------|-------------------|
| Creative inbox (`/studio/creative/inbox`) | Applications, awards, team invites |
| Organisation programmes (`/studio/organisation/programmes`) | Brief and programme management |
| Practice profile editor | Discovery matching inputs |
| Collector patron briefs (optional, late phase) | Patron commission line |

---

## 3. Relationship to Registry

### 3.1 Registry preservation rule (inherited from Phase 1)

The Field **must not**:

- Write directly to `ownership_events`, `value_events`, `verification_events`, or certificate tables
- Bypass SECURITY DEFINER RPCs for ledger mutations
- Alter RLS on ledger tables
- Redefine verification authority without Organisation attestation model

The Field **may**:

- Read `artwork_read_model`, public cert status RPCs, participation chronology
- Invoke existing Registry HTTP APIs and RPCs for filings triggered by deliverables
- Display trust bands, registry IDs, continuity summaries, certificate public status

### 3.2 Record vs Field object

| Object | Layer | Relationship |
|--------|-------|--------------|
| **Record** | Registry | Canonical `registry_id`; append-only ledgers; permanent |
| **Brief** | Field | Intent; may never produce a Record |
| **Project** | Field | Runtime production; may produce zero or one primary Record |
| **Deliverable** | Field | Filing trigger; calls same register RPC as Studio |

**Record ≠ Project:** A Record may exist without any Field project (direct Studio registration). A project may complete without a Registry outcome if brief allows it — but premium org tiers may **require** registry outcome on delivery.

### 3.3 URL migration (Field: Record phase)

Blueprint target — public read surfaces migrate under Field namespace with 301 redirects:

| Legacy (live) | Field (target) |
|---------------|----------------|
| `/registry` | `/field/explorer` |
| `/registry/[registry_id]`, `/artwork/[registry_id]` | `/field/record/[registry_id]` |
| `/verify/[id]` | `/field/verify/[registry_id]` |
| `/artist/[slug]` | `/field/creative/[slug]` |
| `/institutional-studio/[slug]`, `/gallery/[slug]` | `/field/organisation/[slug]` |
| `/collector-studio/[slug]` | `/field/collector/[slug]` |

Registry **remains** the internal system term and API namespace. “Registry” in user copy may persist on record pages as trust descriptor (“Registry record”, “Registry ID”).

### 3.4 Bridge concept (future implementation — not schema design here)

A nullable link from Record to Field commission (e.g. `field_commission_id` on artwork) allows public record pages to show production provenance (“Commissioned via …”) without merging objects. Field deliverable filing sets this link **via Registry RPC**, not direct table write from Field layer.

---

## 4. Participant types

### 4.1 Public labels vs internal roles (unchanged from Phase 1)

| Internal role (`actor_profiles.role`) | Public label | Field participation |
|---------------------------------------|--------------|---------------------|
| `artist` | **Creative** | Discovery profile, applications, team membership, authorship |
| `gallery` | **Organisation** | Programmes, briefs, verification authority, commissioning |
| `collector` | **Collector** | Public collection, custody CTAs; patron briefs (late phase) |
| Anonymous | — | Explorer, open calls listing, record verify, profile browse |

### 4.2 Creative (expanded identity — product level)

**Purpose on Field:** Be discoverable by practice, capability, and registry footprint — not only by represented roster.

| Dimension | Phase 2 intro | Later Field phases |
|-----------|---------------|-------------------|
| Public profile | Migrate `/artist/[slug]` → `/field/creative/[slug]` | Practice types, disciplines, geo |
| Registry footprint | Linked records where public | Portfolio filters on explorer |
| Opportunities | Apply to briefs | Saved opportunities, match alerts |
| Production | Team member on commission | Peer collaborations |

**Practice types (vision):** artist, filmmaker, curator, photographer, production designer, set designer, fabricator, creative director, spatial designer — **capabilities on one Creative account**, not separate account types.

### 4.3 Organisation (expanded identity — product level)

**Purpose on Field:** Programme authority — publish briefs, run open calls, verify works, commission production.

| Dimension | Product note |
|-----------|--------------|
| `organisation_kind` (future) | gallery, museum, studio, festival, brand, production company — gallery is one kind |
| Verified tier | `galleries.verified` — priority placement, verify authority (existing) |
| Public surface | Programme pages, open calls, org profile |
| Registry role | Unchanged — filing, verify, representation via RPCs |

### 4.4 Collector

**Purpose on Field:** Custody narrative and public collection — **not** default production participant.

| Entry | Path |
|-------|------|
| Primary | Ownership claim, provenance continuity (live flows) |
| Secondary | Public collector profile and collection browse |
| Optional (late) | Patron-funded briefs with registry outcome requirement |

### 4.5 Anonymous public

Primary Field audience. Must access explorer, records, verify, open calls (read), and public profiles without authentication. Auth unlocks apply, save, and inbox — not basic trust reading.

---

## 5. Opportunity model

### 5.1 Core objects (conceptual — no schema)

| Object | Definition | Owner |
|--------|------------|-------|
| **Programme** | Organisation-scoped container for related briefs — season, residency slate, festival line, production series | Organisation |
| **Brief** | Structured production request — scope, timeline, disciplines, deliverables, compensation band (optional), registry outcome rule | Organisation |
| **Application** | Creative response to a published brief | Creative (via Studio) |
| **Commission** | Awarded contract from brief to Creative(s) | Organisation → Creative |
| **Collaboration** | Peer-led production container (non-org-led) | Creative peers |

### 5.2 Brief types (product taxonomy)

| Brief type | Typical publisher | Registry outcome |
|------------|-------------------|------------------|
| Open call | Organisation | Often required |
| Commission (direct) | Organisation | Usually required |
| Residency / award | Organisation | Required for alumni record |
| Fabrication RFP | Organisation | Optional per deliverable |
| Patron commission | Collector (late) | Required |
| Peer collaboration | Creative | Optional |

### 5.3 Brief lifecycle (states)

```
draft → published → [applications open] → awarded | withdrawn | closed
                              ↓
                    applications: submitted → shortlisted → accepted | rejected
```

**Publishing rules:**

- Only Organisation admin/staff may publish (extends existing gallery role model)
- Published briefs appear on Field open calls listing
- Withdrawn briefs remain auditable but not discoverable
- Award creates Commission (1:0..1 per brief)

### 5.4 Opportunity discovery surfaces (conceptual routes)

| Surface | Purpose |
|---------|---------|
| `/field/open-calls` | Filterable public listing |
| `/field/open-calls/[id]` | Brief detail |
| `/field/programmes/[slug]` | Programme hub linking briefs |
| Saved opportunities (auth) | Studio/Field cross-link — product decision in spec |

### 5.5 Relationship to existing marketplace

`market_listings` is **Registry-adjacent commerce** (sale of existing Record). Field Opportunity is **production orchestration** (creation of new Record). Product decision required:

- **Recommended:** Market = transfer of existing Record; Field = production of new Record. Listing UX either integrates as **Field: Commerce** lane or narrows to sale-completion RPC only.

---

## 6. Matching model

### 6.1 Matching philosophy

RROWM matching is **structured and explainable** — not opaque algorithmic ranking. The Field surfaces opportunities Creatives can **discover and qualify for**, not a gig-economy blast feed.

### 6.2 Match inputs (future data — conceptual)

| Input source | Used for |
|--------------|----------|
| Practice types / disciplines | Brief discipline requirements |
| Organisation roster | Trusted Creatives already represented |
| Registry footprint | Prior verified works in medium/genre |
| Geo / timezone (optional) | Location-bounded briefs |
| Verification status | Briefs requiring verified Creative or org tier |
| Explicit application | Creative self-selects — always available |

### 6.3 Match outputs

| Output | Description |
|--------|-------------|
| **Explore filters** | User-controlled filters on open calls (discipline, org, programme, date) |
| **Org shortlist assist** | Organisation tools to filter applications by declared capabilities — not auto-reject |
| **Suggested briefs (optional, late)** | Email digest of new briefs matching saved discipline preferences — opt-in only |
| **Roster fast-path** | Organisation may restrict brief to represented artists before public publish |

### 6.4 Non-goals

- No pay-to-boost brief placement in discovery (monetisation via subscription tiers, not auction)
- No engagement-optimised ranking
- No mandatory auto-matching without Creative consent

### 6.5 Trust gates in matching

| Gate | Rule |
|------|------|
| Verified org brief | May require verified org badge on listing |
| Registry outcome brief | Applicant sees requirement before apply |
| Representation brief | May limit to org roster until public phase |

---

## 7. Project lifecycle

### 7.1 Project definition

A **Project** is the **runtime container** for an awarded Commission or peer Collaboration — team, milestones, deliverables, status. One Commission maps 1:1 to one Project.

### 7.2 Project types

| Type | Lead | Team |
|------|------|------|
| **Commission** | Organisation | Creative lead + optional multi-discipline members |
| **Collaboration** | Creative peer | Self-assembled team |

### 7.3 Project lifecycle (states)

```
forming → active → [milestones] → delivery → completed | cancelled
                                      ↓
                              deliverable review → registry filing (optional/required)
```

### 7.4 Milestones and deliverables (conceptual)

| Concept | Purpose |
|---------|---------|
| **Milestone** | Scheduled checkpoint — approval, payment band trigger (product-level), deliverable due |
| **Deliverable** | Artefact or registry filing target — may invoke register RPC on acceptance |
| **Team member** | Production role — distinct from Registry participation chronology |

**Rule:** Field team membership is **production metadata**. Authorship and institution filing appear in Registry via existing confirmation and representation RPCs — not by copying team table into ledger.

### 7.5 Party visibility

| Party | Sees |
|-------|------|
| Organisation | Full project status, team, milestones |
| Creative team | Assigned milestones, deliverables, org feedback |
| Public | Programme/brief level only unless org opts into public progress (late) |
| Collector | Patron projects only if patron line ships |

### 7.6 Cancellation and dispute

Production disputes on Field route to existing **Registry dispute** evidence model when they concern record integrity. Pure production disagreements remain Field/Studio workflow — not ledger mutations.

---

## 8. Creative discovery

### 8.1 Discovery surfaces

| Surface | Content |
|---------|---------|
| **Field Explorer** | Verified records, filters, search — migrates from `/registry` |
| **Field Record** | Single record trust page — provenance, cert status, participation |
| **Creative profiles** | Public practice projection, linked records |
| **Open calls** | Brief discovery |
| **Programme pages** | Curated org seasons |

### 8.2 Discovery principles

1. **Verification-forward** — explorer emphasises verified records; unverified clearly labelled
2. **Registry ID as anchor** — mono registry IDs on all record surfaces
3. **No vanity metrics** — no follower counts as primary sort
4. **International** — build on Phase 1 i18n for Field public copy

### 8.3 Creative discovery journey (anonymous → auth)

```
Land on Explorer → filter/browse → open Record → read trust band
       → optional: sign in → save to archive (Studio API) → apply to brief (Studio)
       → optional: view Creative profile → see registry footprint → apply
```

### 8.4 Differentiation from Studio portfolio

| Studio | Field |
|--------|-------|
| Private drafts, stewardship tools, register modal | Public projection only |
| Full nav, activity feed | Explorer chrome, no workspace sidebar |
| Edit source of truth | Read-optimized mirror |

---

## 9. Organisation commissioning

### 9.1 Commissioning authority

Organisations commission through **Programmes** and **Briefs** — not through explorer admin tools. Verification and catalogue filing remain Studio workflows.

### 9.2 Organisation journey

```
Studio: create programme → draft brief → publish to Field
       → receive applications (Studio inbox) → shortlist → award commission
       → project active → milestone review → accept deliverable
       → Studio/Registry: verify + issue certificate when required
       → Field Record: public sees linked outcome
```

### 9.3 Organisation kinds (product vision)

| Kind | Typical brief types |
|------|---------------------|
| Gallery | Exhibition, representation, catalogue |
| Museum | Acquisition, commission, residency |
| Festival | Open call, programme season |
| Production company | Film, spatial, fabrication |
| Brand | Commissioned work, campaign artefact |
| Studio (physical) | Fabrication RFP, spatial |

### 9.4 Verification and commissioning intersection

Organisation **verified** status affects:

- Priority placement on Field explorer and open calls
- Eligibility to publish briefs requiring registry outcome
- Authority to verify delivered works (existing RPC path)

**Never sell trust:** paid tiers bound to credential and attestation — not pay-to-stamp without review.

### 9.5 Cross-organisation commissioning (late)

Co-commission between two Organisations — dual publisher on brief, shared programme. Requires explicit Phase 2.x scope add.

---

## 10. Film and production pathways

### 10.1 Why film is first-class

Film and spatial production are **multi-role, milestone-heavy, deliverable-bound** — they stress-test Field teams, briefs, and registry outcomes better than single-author object workflows.

### 10.2 Film brief template (conceptual)

| Brief field | Purpose |
|-------------|---------|
| Discipline set | Director, cinematographer, editor, production designer, etc. |
| Format / runtime | Short, feature, installation |
| Delivery spec | Master file, stills, physical artefact for registry |
| Registry outcome | Registered work type — film still, installation record, edition |
| Milestone schedule | Treatment → shoot → post → delivery |

### 10.3 Crew team model

| Role layer | Examples |
|------------|----------|
| **Lead** | Director, creative lead (1 per commission) |
| **Department heads** | DP, production designer, editor |
| **Contributors** | Fabricator, composer, curator advisor |
| **Organisation** | Production company as publisher |

Team roles map to **practice types** on Creative accounts. One Creative may hold multiple roles across projects.

### 10.4 Deliverable → Record pathways for film

| Outcome type | Registry filing |
|--------------|-----------------|
| Editioned still / frame | Register as artwork record with medium metadata |
| Installation | Register with dimensions, fabrication chronology |
| Film as registered artefact | Product policy — metadata hash of approved master; cert on verify |

Filing always via **existing register + verify RPCs** — Field captures production context link only.

### 10.5 Fabrication and spatial parallel

Fabrication RFP brief type shares team/milestone model with film — optimised for physical deliverables and registry dimension fields.

---

## 11. Revenue model

### 11.1 Layer monetisation principle (from Blueprint)

| Layer | Monetises |
|-------|-----------|
| **Field** | Motion — briefs, commissions, facilitation |
| **Registry** | Permanence — filing tiers, certificates, audit |
| **Studio** | Identity — org seats, subscriptions |

**No engagement monetisation** — no promoted posts or algorithmic ads.

### 11.2 Field revenue streams (phased)

| Stream | Buyer | Phase | Notes |
|--------|-------|-------|-------|
| Organisation subscription | Organisation | Live scaffold → productise | Existing `subscription_status`, pricing modal |
| Verified organisation tier | Organisation | Field: Record+ | Priority placement, verify authority |
| Brief / programme posting | Organisation | Field: Opportunity | Per brief or bundle |
| Commission facilitation fee | Organisation (or split) | Field: Opportunity | Optional % on awarded value band |
| Open call listing (premium) | Organisation | Late | Featured programme — not pay-to-rank |
| Patron commission fee | Collector | Late | If patron line ships |
| Marketplace (decision) | Seller | Parallel track | Productise as Field: Commerce or narrow to sale RPC |

### 11.3 Revenue sequencing (recommended)

| Phase | Focus |
|-------|-------|
| **2a — Field: Record** | Verified org tier + subscription productisation |
| **2b — Field: Opportunity** | Brief posting + facilitation |
| **2c — Production** | Team/milestone features in org plans |
| **Year 3+** | API, institutional audit (Registry-adjacent) |

### 11.4 Free tier principles

- Public explorer and verify remain **free**
- Creative applications remain **free**
- Registry outcome filing uses existing paths — fees (if any) are Registry policy, not Field discovery tax

---

## 12. Trust and reputation model

### 12.1 Trust sources (ordered)

| Signal | Layer | Public on Field |
|--------|-------|-----------------|
| Registry verification status | Registry | Primary trust band on Record |
| Certificate public status | Registry | Badge on Record |
| Participation chronology | Registry | Authorship, institution filing |
| Organisation verified tier | Studio/Registry | Org profile, brief publisher badge |
| Representation on file | Registry | Creative–org relationship |
| Field project completion | Field | “Delivered via RROWM commission” link — not a replacement for verification |
| Dispute outcome | Registry | Flag on record when public |

### 12.2 What is not reputation

- Follower counts, likes, stars from anonymous users
- Pay-to-verify without attestation
- Field team role as substitute for registry authorship confirmation

### 12.3 Reputation propagation rules

1. **Record page trust hierarchy:** verification → certificate → continuity → participation → Field production link
2. **Brief publisher trust:** org verified badge + registry footprint of prior commissions
3. **Creative applicant trust:** registry works + representation — application shows attestations, not scores
4. **Collector trust:** custody claims and provenance chain on Record — not production reputation

### 12.4 Abuse and integrity

| Risk | Mitigation (product-level) |
|------|---------------------------|
| Spam briefs | Org subscription + rate limits |
| Fraudulent applications | Studio identity + optional roster gate |
| Verify gaming | Existing dispute + admin queue |
| Mislinked production | Deliverable filing requires org acceptance before registry link |

---

## 13. Phase breakdown

Phase 2 is **not a single release** — it decomposes into sub-phases. Phase 1 freeze explicitly excluded all Field functionality; each sub-phase requires its own spec lock and acceptance gate.

### Phase 2a — Field: Record (public read migration)

| Deliverable | Description |
|-------------|-------------|
| Field Explorer | `/field/explorer` ← `/registry` |
| Field Record | `/field/record/[registry_id]` |
| Field Verify | `/field/verify/[registry_id]` |
| Public profiles | `/field/creative`, `/field/organisation`, `/field/collector` |
| Redirects | 301 from all legacy public URLs |
| Chrome | Remove signed-in Studio shell from public browse |
| Registry preservation | Zero ledger change; read-only Field BFF optional |

**Journeys:** J1, J6, J7 (public discovery + custody CTAs)  
**Depends on:** Phase 1 complete  
**Does not include:** Briefs, projects, teams

### Phase 2b — Field: Discovery enrichment

| Deliverable | Description |
|-------------|-------------|
| Practice-aware profiles | Public discipline tags (Studio-sourced) |
| Explorer filters | Discipline, org, verification |
| Programme stub pages | Static org programme landing (pre-opportunity DB) |
| i18n pass | Field public strings |

**Does not include:** Applications, awards, commissions

### Phase 2c — Field: Opportunity MVP

| Deliverable | Description |
|-------------|-------------|
| Programme object | Org-scoped containers |
| Brief object | Publish, withdraw, listing |
| Application flow | Studio submit → org review |
| Award → Commission | Creates project container |
| Open calls routes | `/field/open-calls`, `/field/programmes/[slug]` |
| Studio inbox | Creative + org transactional notifications |

**Journeys:** J10  
**Monetisation:** Brief posting, subscription gates

### Phase 2d — Field: Production

| Deliverable | Description |
|-------------|-------------|
| Project runtime | Teams, milestones, deliverables |
| Film / crew templates | Brief type presets |
| Deliverable → register bridge | RPC filing with commission link |
| Party-visible commission status | Auth-gated `/field/commissions/[id]` |

**Journeys:** J11  
**Monetisation:** Facilitation fee (optional)

### Phase 2e — Field: Patron and commerce (optional / late)

| Deliverable | Description |
|-------------|-------------|
| Patron briefs | Collector-funded |
| Marketplace decision | Field: Commerce or deprecate listing UI |
| Cross-org commissioning | Dual publisher |

**Journeys:** J12  
**Founder decision required** before spec lock

### Cross-phase dependencies

```
Phase 1 (frozen) → 2a Record → 2b Discovery → 2c Opportunity → 2d Production → 2e Patron/Commerce
                      ↓
              post-cert remediation (parallel, not blocking 2a planning)
```

---

## 14. Technical architecture

**Product-level only** — no table or component designs.

### 14.1 Layer diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  The Field (public-first, optional auth enclaves)                │
│  Explorer · Record · Verify · Profiles · Open calls · Programmes │
└────────────────────────────┬─────────────────────────────────────┘
                             │ read + orchestration HTTP
┌────────────────────────────▼─────────────────────────────────────┐
│  Studio (authenticated)                                          │
│  Identity · stewardship · inbox · applications · programmes edit │
└────────────────────────────┬─────────────────────────────────────┘
                             │ RPC / Registry API
┌────────────────────────────▼─────────────────────────────────────┐
│  Registry (system of record)                                     │
│  Ledgers · certificates · verification · disputes                │
└──────────────────────────────────────────────────────────────────┘
```

### 14.2 API namespace (target — from Blueprint)

| Namespace | Responsibility |
|-----------|----------------|
| `/api/field/*` | Public read BFF (optional), briefs, applications, commissions, teams |
| `/api/studio/*` | Account, archive, practice, inbox (migrate from current paths over time) |
| `/api/registry/*` | All ledger mutations |

**Rule:** Field mutations that affect truth → delegate to Registry RPCs. Field-owned mutations stay in Field namespace.

### 14.3 Auth model on Field

| Route class | Auth |
|-------------|------|
| Explorer, record, verify, profiles, open calls (read) | Anonymous OK |
| Apply, save opportunity, commission status | Session required |
| Admin, internal | Ops plane unchanged |

### 14.4 Event and notification model (conceptual)

| Channel | Owner | Content |
|---------|-------|---------|
| Studio activity feed | Studio | Past ledger/account events |
| Field notifications (V3) | Field | Actionable: application received, award, milestone due |
| Email digests | Field/Studio | Opt-in brief alerts — not social notifications |

### 14.5 Design system ownership (pointer — no UI spec)

| Layer | Atmosphere |
|-------|------------|
| Field public | `ds-page-environment`, explorer emerald hero, narrative layout |
| Field production pages | Narrative + trust bands |
| Studio | `ds-workspace-environment` — unchanged from Phase 1 |

### 14.6 Redirect and SEO policy

- 301 redirects from legacy URLs for ≥2 release cycles
- `registry_id` remains canonical key across URL migrations
- No duplicate public record URLs post-2a

### 14.7 Ops plane (unchanged)

`/admin`, `/internal/*`, cron, service role — outside Field product surface.

---

## 15. Risks and exclusions

### 15.1 Product risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Field/Registry URL migration breaks share links | High | 301 + monitoring; registry_id stable |
| Signed-in shell on public browse confuses layer model | Medium | 2a explicitly removes Phase 1 overlap |
| Marketplace vs Opportunity confusion | High | Founder decision in 2c planning |
| Film crew complexity delays MVP | Medium | Templates in 2d, not 2c |
| Pay-to-verify perception | High | Subscription-bound authority only |
| Scope creep into social network | Medium | This blueprint §1.3 guardrails |

### 15.2 Engineering risks (product-facing)

| Risk | Note |
|------|------|
| Missing baseline DDL / RPC in repo | Parallel remediation — blocks fresh env, not 2a on prod |
| API namespace migration cost | Phase incrementally; Field BFF optional for 2a |
| i18n surface expansion | Budget per sub-phase |

### 15.3 Explicit exclusions from Phase 2 blueprint

| Exclusion | Rationale |
|-----------|-----------|
| UI designs, wireframes, components | Future design phase |
| Database tables, RLS, migrations | Future schema spec |
| Phase 2 implementation spec / AC-* | Requires separate lock after blueprint approval |
| Ledger semantic changes | Registry preservation rule |
| Social graph, DMs, feeds | Blueprint guardrail |
| NFT/blockchain primary trust | Blueprint guardrail |
| Legal title transfer | Cultural record only |
| Teams/collaborations outside Field production context | Studio org feature creep |
| Replacing Supabase Auth | Out of scope |

### 15.4 Founder decisions required before spec lock

| Decision | Options |
|----------|---------|
| Marketplace future | Field: Commerce / sale-RPC only / deprecate |
| Patron briefs | 2e or never |
| Public project progress | Org-opt-in visibility |
| Registry filing fees | Free tier limits vs subscription inclusion |
| Programme required for all briefs | Yes (structured) vs optional (MVP simplicity) |

### 15.5 Approval path for this DRAFT

| Step | Action |
|------|--------|
| 1 | Founder/product review of this blueprint |
| 2 | Amend Blueprint v1.1 if contradictions found — new version, not silent drift |
| 3 | Lock Phase 2a implementation spec (Field: Record only) |
| 4 | Feasibility review for 2a engineering |
| 5 | Update DOCUMENT_GOVERNANCE when blueprint promoted from DRAFT |

---

## Related documents

| Document | Status | Relationship |
|----------|--------|--------------|
| [product-blueprint-v1.1.md](./product-blueprint-v1.1.md) | APPROVED | Strategic parent — Part II prevails on conflict |
| [phase-1-freeze.md](./phase-1-freeze.md) | FROZEN | Phase 1 delivered scope; Field explicitly out |
| [product-language-freeze.md](./product-language-freeze.md) | FROZEN | Surface and participant labels |
| [post-certification-remediation.md](./post-certification-remediation.md) | ACTIVE | Parallel engineering debt |
| [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) | ACTIVE | Does not block Field planning |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2 Field product architecture |
