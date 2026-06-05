# Phase 2B Implementation Specification — Field Discovery Expansion

**Document status:** LOCKED DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT), [Phase 2A PR1 Signoff](./phase-2a-pr1-signoff.md) (ACCEPTANCE SIGNOFF), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED)  
**Predecessor release:** Phase 2A Field Foundations — `checkpoint-phase2a-field-foundations` (recommended tag after 2A merge)  
**Document type:** Product specification only — **no database schema, no UI design, no implementation tasks, no code**

---

## Purpose

Define **Phase 2B — Field Discovery Expansion**: the second Field release after 2A foundations. Phase 2B deepens **anonymous-first discovery** — search, structured practice, richer explorer filters, profile completeness signals, and a connected relationship graph — without introducing production orchestration, commerce, or social product mechanics.

**North-star outcome for 2B:**

> A visitor can **find** Creatives, Organisations, and Registry records through **explainable search and filters**, understand **how a Creative works** through structured practice, trust credentials through consistent verification visibility, and **navigate the Field graph** without algorithmic ranking or social feeds.

Phase 2B **reads** Registry truth and **projects** Studio-authored public metadata. It does **not** mutate the ledger.

---

## Change control

| Rule | Detail |
|------|--------|
| **DRAFT** | Scope and acceptance criteria are fixed for planning review. Engineering may not expand scope without unlock. |
| **Promotion** | Becomes **LOCKED** after founder signs 2B acceptance and any blocking ADRs are **DECIDED**. |
| **Unlock** | Explicit product approval; documented delta; version bump (2B.1, etc.). |
| **Registry rule** | Zero ledger semantic change; Field reads Registry truth only. |
| **ADR alignment** | Adopts ADR-18-B (full-text search in 2B), ADR-13/17 (trust hierarchy), ADR-19-A (manual filters only — no platform matching), ADR-20-A (no recommendations). |

---

## Scope summary

| In scope (2B) | Out of scope (2B) |
|---------------|-------------------|
| Unified Field search architecture (explainable, non-algorithmic) | Opportunities, briefs, programmes, applications |
| Practice taxonomy — Studio edit, Field display, explorer filters | Commissioning, production workflows, teams |
| Creative, Organisation, Record discovery enrichment | Marketplace, payments, sale listings |
| Relationship graph navigation (deterministic cross-links) | Social feeds, follow graph, DMs |
| Profile completeness (Studio stewardship + Field projection) | Recommendation engines, similarity scores, “for you” |
| Verification visibility consistency across discovery surfaces | Matching engines (brief ↔ Creative) |
| Explorer information architecture refinements | Patron briefs, open calls routes |
| Legacy record URL redirect completion (2A deferral) | Full certificate route migration (optional 2B.1) |
| i18n keys for new public discovery copy | Sector/capability taxonomy editor (2C+ prep only) |

---

## Predecessor baseline (Phase 2A)

Phase 2A (PR1 signoff) delivers:

| Capability | Canonical surface |
|------------|-------------------|
| Explorer hub | `/field/explorer` |
| Record / Creative / Organisation explorers | `/field/explorer/records`, `/creatives`, `/organisations` |
| Presence profiles | `/field/creative`, `/organisation`, `/collector/[slug]` |
| Field Record + Verify | `/field/record/[id]`, `/field/verify/[id]` |
| Filter-only list queries | Verification, text on title/registry_id, pagination |
| Trust hierarchy on Field Record and verify | ADR-13 order preserved |
| Primary nav canonicalisation | Marketing/studio links → Field explorer |

**Known 2A deferrals absorbed by 2B:**

| ID | Gap | 2B treatment |
|----|-----|----------------|
| O-1 | Legacy `/registry/[id]`, `/artwork/[id]` not 301 to Field Record | §12 URL completion |
| O-3 | Record Explorer default scope vs legacy verified-only emphasis | §9 Record discovery |
| O-5 | Residual legacy profile links on Registry ledger views | §10 Relationship graph |

**Partial ahead-of-spec delivery (PR1):** Creative Explorer may expose practice filter UI and chip display backed by application-layer taxonomy. 2B **locks product rules** for declared vs registry-evidence practices and completes Studio edit + visibility gates.

---

## 1. Search architecture

### 1.1 Design principles (ADR-18, ADR-20)

| Principle | Rule |
|-----------|------|
| **Explainable** | Every result set is attributable to explicit query text and/or user-selected filters |
| **Non-algorithmic** | No engagement-weighted ranking, no ML relevance, no “similar items” |
| **Registry-forward** | Record search prioritises `registry_id` exact match and verification status clarity |
| **Surface-appropriate** | Each explorer has a defined searchable field set; no opaque global index |
| **Anonymous-first** | Full discovery search works without authentication |

### 1.2 Search model

Phase 2B introduces a **Field Search Contract** — a product-level query vocabulary shared across explorers:

| Parameter | Meaning | Applies to |
|-----------|---------|------------|
| `q` | Free-text query (full-text scope per surface — §1.3) | All explorers + optional hub |
| `verified` | Verification filter (`1` = verified-only where supported) | Record Explorer; optional on Creative footprint |
| `practice` | Canonical practice slug filter | Creative Explorer; Creative Presence list on profile |
| `sort` | Explicit sort key from allowed set | Per explorer |
| `page` | Pagination | All explorers |

**Composition rule:** Text query **AND** active filters **AND** visibility gates (`public_presence.profile`, etc.). No implicit OR expansion beyond documented cross-surface hub behaviour.

### 1.3 Full-text scope (ADR-18-B)

| Surface | Indexed / searchable fields (2B) | Not searchable in 2B |
|---------|----------------------------------|----------------------|
| **Record Explorer** | `registry_id` (exact/prefix), artwork title, artist display name | Private owner fields, dispute notes |
| **Creative Explorer** | Display name, slug, bio excerpt | Email, internal IDs |
| **Organisation Explorer** | Organisation name, location (when public), description excerpt | Subscription tier, staff emails |
| **Field Verify hub** | Registry ID entry only (navigational, not index) | — |

**Bio full-text on Creative Explorer:** **In scope** for 2B — supports “understand their practice” north star. Must remain substring/FTS style, not semantic embedding search.

**Managed external index (Algolia, etc.):** **Out of scope** for 2B unless founder unlocks ADR-18-C at spec lock. Default: existing read-model / database query patterns.

### 1.4 Sort rules (non-ranking)

| Explorer | Default sort | Allowed alternates |
|----------|--------------|-------------------|
| Record Explorer | Registry list parity (existing sort params) | Date added, title, verification-first **only as explicit user sort** — never default popularity |
| Creative Explorer | Alphabetical by display name | Recently updated (activity timestamp if available) |
| Organisation Explorer | Alphabetical by name | Verified-first **only when user selects** — not paid tier |

**Forbidden sorts:** follower count, view count, subscription tier, “recommended”, composite influence score.

### 1.5 Hub search entry (Explorer IA)

`/field/explorer` may expose a **unified search entry** that routes intent:

| User intent | Route behaviour |
|-------------|-----------------|
| Query matches Registry ID pattern | Navigate to `/field/verify/[id]` or `/field/record/[id]` per ID validation rules |
| General text | Default to active explorer tab with `q` preserved |
| Tab switch | Retain compatible params (`q`, `page` reset on filter change) |

Hub search is **routing + param preservation** — not a blended relevance-ranked results page.

### 1.6 Empty and ambiguous results

| Case | Product behaviour |
|------|-------------------|
| Zero results | Surface which filters/query applied; offer “clear filters” — no alternate suggestions |
| Registry ID not found | Verify hub / record not-found UX with link to Record Explorer |
| Partial practice filter | Show count “N Creatives match” on explorer — no “did you mean” auto-correction beyond spelling-normalised slug match |

### 1.7 Acceptance criteria (AC-SR*)

| ID | Criterion |
|----|-----------|
| AC-SR1 | Record, Creative, and Organisation explorers accept `q` full-text within §1.3 scopes |
| AC-SR2 | All result sets explain active query + filters; no hidden ranking factors |
| AC-SR3 | No recommendation, similarity, or “suggested for you” UI on search results |
| AC-SR4 | Registry ID lookup path resolves to Field Record or verify not-found |
| AC-SR5 | Sort defaults comply with §1.4 — no engagement-based default |

---

## 2. Practice taxonomy expansion

### 2.1 Definition

**Practice** = a normalized **discipline through which a Creative works** — multi-valued, Studio-authored, publicly projectable, filterable on Field.

| Concept | Is Practice? |
|---------|--------------|
| Account type (`artist`, `gallery`, `collector`) | **No** |
| Artwork medium on a Registry record | **No** — work attribute; may inform **registry-evidence** display only |
| Sector / cultural context (museum, festival) | **No** — deferred capability dimension (2C+ prep) |
| Unstructured bio prose | **Complementary** — narrative, not a filter substitute |

### 2.2 Canonical vocabulary

Phase 2B ships a **closed canonical list** of practice types at product level. Initial set aligns with Product Blueprint v1.1 and Phase 2 creative identity vision:

| Slug (illustrative) | Public label |
|---------------------|--------------|
| `painting` | Painting |
| `sculpture` | Sculpture |
| `photography` | Photography |
| `film` | Film |
| `production` | Production |
| `scenography` | Scenography |
| `public-art` | Public Art |
| `architecture` | Architecture |
| `research` | Research |
| `writing` | Writing |
| `performance` | Performance |
| `curation` | Curation |
| `creative-direction` | Creative Direction |
| `placemaking` | Placemaking |

**Taxonomy governance:** New practice types require product version bump — not user-generated tags. Custom labels are **out of scope**.

### 2.3 Practice sources (dual lineage)

| Source | Definition | Field display |
|--------|------------|---------------|
| **Declared** | Creative selects up to **5** practices in Studio account | Chip label “Declared” or neutral chip without rank |
| **Registry-evidence** | Derived from **verified** work mediums matching taxonomy keywords | Distinct chip source label — **evidence**, not self-assertion |

**Product rules:**

1. Declared practices require explicit Creative save in Studio — never silently written from medium inference alone.
2. Registry-evidence practices may appear **in addition to** declared practices; dedupe by slug on display.
3. Primary practice: Creative designates **one** primary among declared practices; shown first on profile and explorer card.
4. Explorer filter `practice=` matches Creatives where slug appears in **declared OR registry-evidence** set (filter is discovery-inclusive; UI distinguishes sources on profile).

### 2.4 Studio edit requirements

| Requirement | Rule |
|-------------|------|
| Edit location | Studio account — dedicated **Practice** section (not Field) |
| Control | Multi-select from canonical list; primary selector among selected |
| Limits | 0–5 declared practices allowed |
| Helper copy | Practices describe **how you work** — not account type; visible on Field when enabled |
| Save model | Same stewardship session as profile / public presence |

### 2.5 Public visibility

Extend public presence model with **`practices` visibility flag**:

| Condition | Field shows practice chips |
|-----------|---------------------------|
| `public_presence.profile` false | Hidden (profile 404) |
| `public_presence.practices` false | Hidden — Studio edit preserved |
| No declared and no registry-evidence practices | Omit practice row — no placeholder shaming |

Default: **`practices` visible when profile is public** (founder freeze §1 review).

### 2.6 Field display (Creative Presence)

| Element | Rule |
|---------|------|
| Placement | After identity headline; before or alongside participation / verification strip |
| Treatment | Read-only neutral chips; primary declared practice first |
| Interaction on profile | Chips are informational on presence page — filter interaction lives on Creative Explorer |
| i18n | Practice labels use locale message keys |

### 2.7 Explorer filter (Creative Explorer)

| Element | Rule |
|---------|------|
| Facet | Single-select or multi-select practice slug filter — product pick at design; must preserve explainability |
| URL | `practice=` query param with canonical slug |
| Empty filter | Shows all public Creatives (subject to `q`, pagination) |
| Cross-link | Explorer cards show up to **3** practice chips with source-neutral labels |

### 2.8 Acceptance criteria (AC-PR*)

| ID | Criterion |
|----|-----------|
| AC-PR1 | Creative selects declared practices in Studio; max 5 enforced |
| AC-PR2 | Primary declared practice identified and ordered first on Field profile |
| AC-PR3 | Registry-evidence practices display with distinct source semantics from declared |
| AC-PR4 | `public_presence.practices` gates public chip visibility |
| AC-PR5 | Creative Explorer filters by `practice=` slug across declared + registry-evidence |
| AC-PR6 | No pay-to-boost, popularity rank, or auto-declared practice without Studio save |

---

## 3. Creative discovery

### 3.1 Discovery unit

**Creative profile card** in Creative Explorer — links to `/field/creative/[slug]`.

### 3.2 Card content (2B enrichment)

| Field | Source | Required |
|-------|--------|----------|
| Display name | `artists.display_name` | Yes |
| Practice chips (≤3) | Declared + registry-evidence | When visible |
| Primary practice hint | Declared primary | When set |
| Verified work count | Registry read model | Factual count — not score |
| Representation hint | Org link when public | When on file |
| Bio excerpt | First ~160 chars when `q` matches bio | When search active |

### 3.3 Filters and search

| Control | 2B |
|---------|-----|
| Text `q` | Name, slug, bio |
| Practice `practice` | Slug facet |
| Pagination | Required |
| Sort | §1.4 |

**Excluded:** “Creatives like this”, roster-recommendation rows, org-subscriber boost.

### 3.4 Profile → record discovery

Creative Presence registry footprint preserves 2A pagination with added optional filters:

| Filter | Rule |
|--------|------|
| Status / verification | Preserve existing registry list filters on profile works |
| Practice | **Not** filter works by practice on profile — works filter by verification/status only |

### 3.5 Acceptance criteria (AC-DC*)

| ID | Criterion |
|----|-----------|
| AC-DC1 | Creative Explorer cards show practice chips when visibility allows |
| AC-DC2 | Text search finds Creatives by name and bio within §1.3 |
| AC-DC3 | Creative profile → Field Record navigation unchanged from 2A graph |
| AC-DC4 | No social or recommendation UI on Creative discovery paths |

---

## 4. Organisation discovery

### 4.1 Discovery unit

**Organisation profile card** in Organisation Explorer — links to `/field/organisation/[slug]`.

### 4.2 Card content (2B enrichment)

| Field | Source | Required |
|-------|--------|----------|
| Name | `galleries.name` | Yes |
| Verified badge | `galleries.verified` | When true |
| Location | When `public_presence.location` | Optional |
| Roster / work counts | Derived | Factual |
| Description excerpt | When `q` matches | When search active |

### 4.3 Filters and search

| Control | 2B |
|---------|-----|
| Text `q` | Name, location, description |
| Verified toggle | Preserve 2A — default shows all public orgs |
| Practice-aware discovery | **Optional 2B.1:** filter orgs representing Creatives with given practice via roster join — not org self-declared practice |
| Pagination | Required |

**Organisation kind** (`museum`, `festival`, etc.): **Out of scope** for 2B — remains narrative in description until taxonomy product spec.

### 4.4 Organisation → Creative → Record graph

| Link | Rule |
|------|------|
| Org explorer → org profile | Required |
| Org profile roster → Creative profile | When Creative public |
| Org catalogue → Field Record | Primary CTA on work cards |

### 4.5 Acceptance criteria (AC-DO*)

| ID | Criterion |
|----|-----------|
| AC-DO1 | Organisation Explorer supports text search §1.3 |
| AC-DO2 | Verified filter behaviour unchanged from 2A (AC-XO3) |
| AC-DO3 | Org profile roster and catalogue link into Creative and Field Record graph |
| AC-DO4 | No paid placement or subscriber-tier sort on Organisation Explorer |

---

## 5. Record discovery

### 5.1 Discovery unit

**Record card** in Record Explorer — links to `/field/record/[registry_id]`.

### 5.2 Default scope policy (O-3 resolution)

| Policy option | 2B decision |
|---------------|-------------|
| **A. Verified-default** | Record Explorer default view emphasises verified records (legacy `/registry` parity) |
| **B. All-records default** | Default all public records; verified via explicit filter |

**Recommendation:** **A — Verified-default** with visible filter control to include all records. Aligns with 2A trust-forward principle (Blueprint §8.2) and Registry positioning.

Product copy must state when unverified records are included.

### 5.3 Filters and search (2B enrichment)

| Control | Rule |
|---------|------|
| `q` | Title, registry_id, artist display name |
| `verified` | Toggle — default **on** at explorer entry |
| `sort` | Preserve registry sort vocabulary |
| Medium / year | **Optional 2B.1** — facet on record metadata when data quality supports |
| Pagination | Required with out-of-range behaviour preserved |

### 5.4 Record card trust signals

| Signal | Priority on card |
|--------|------------------|
| Verification status | Primary badge |
| Certificate on file / revoked | Secondary badge when present |
| Artist name → Creative profile | Link when public |
| Organisation attribution | Link when public |
| Registry ID (mono) | Always visible |

### 5.5 Field Record page (read discovery terminus)

Field Record remains discovery **terminus** for trust reading — enriched cross-links per §10. No new ledger fields on Field.

### 5.6 Acceptance criteria (AC-DR*)

| ID | Criterion |
|----|-----------|
| AC-DR1 | Record Explorer default emphasises verified records; user can broaden scope explicitly |
| AC-DR2 | Text search covers title, registry_id, artist name |
| AC-DR3 | Record cards link to Field Record; graph links to public profiles |
| AC-DR4 | No recommendation or similarity rows on Record Explorer |

---

## 6. Relationship graph navigation

### 6.1 Graph model

The Field **relationship graph** is a deterministic browse lattice — not a social graph.

```
                    ┌─────────────────┐
                    │  Explorer Hub   │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
   Creative Explorer  Organisation Explorer  Record Explorer
           │                 │                 │
           ▼                 ▼                 ▼
   Creative Presence  Organisation Presence   Field Record
           │                 │                 │
           └────────┬────────┴────────┬────────┘
                    ▼                 ▼
              Field Record      Creative / Org profiles
                    │
                    ▼
              Field Verify
```

### 6.2 Required edges (2B completeness)

| From | To | Condition |
|------|-----|-----------|
| Field Record | Creative profile | Artist public |
| Field Record | Organisation profile | Verifier/filed-by org public |
| Field Record | Collector profile | Current public owner catalogue |
| Field Record | Field Verify | Always |
| Field Record | Registry ledger | Secondary authoritative link (2A pattern) |
| Creative profile | Field Records | Footprint list |
| Creative profile | Organisation profile | When represented + public |
| Organisation profile | Creative profiles | Roster entries public |
| Organisation profile | Field Records | Catalogue |
| Collector profile | Field Records | Public holdings |
| Each explorer card | Respective presence / record | Always |
| Verify hub | Record Explorer | CTA |

### 6.3 Contextual navigation blocks (2B — deterministic)

Field Record and presence pages may add **context panels** — rule-based, not algorithmic:

| Panel | Rule | Example copy |
|-------|------|--------------|
| **Same Creative** | Other public records sharing artist | “More works by [Creative]” |
| **Same Organisation** | Other records linked to org | “More from [Organisation]” |
| **Same medium** | Records sharing medium string | “Records with similar medium” — **label must not imply ML similarity** |
| **Creative practice context** | Link to Creative Explorer with `practice=` pre-filled | “Creatives working in [Practice]” |

**Cap:** Each panel ≤6 items, paginated link to filtered explorer. Order: verification-first, then recency — **not** engagement.

### 6.4 Legacy URL completion

| Legacy | Canonical | 2B requirement |
|--------|-----------|----------------|
| `/registry/[id]` | `/field/record/[id]` | 301 redirect |
| `/artwork/[id]` | `/field/record/[id]` | 301 redirect |
| `/artist/[slug]` on Registry ledger views | `/field/creative/[slug]` | Primary link target (O-5) |

Registry ledger view remains available at `/registry/[id]` as **secondary authoritative surface** until a future consolidation decision — but **primary discovery links** use Field Record.

### 6.5 Acceptance criteria (AC-GN*)

| ID | Criterion |
|----|-----------|
| AC-GN1 | §6.2 edge matrix fully navigable for public sample data |
| AC-GN2 | Context panels use deterministic rules only; no similarity score |
| AC-GN3 | Legacy record detail URLs 301 to Field Record |
| AC-GN4 | No broken graph links when target profile is private — neutral omission |

---

## 7. Profile completeness

### 7.1 Purpose

Help Creatives and Organisations **steward public discoverability** from Studio without turning Field into a gamified social profile product.

### 7.2 Completeness dimensions

**Creative completeness checklist (Studio-only stewardship view):**

| Signal | Weight |
|--------|--------|
| Public profile enabled | Required for Field presence |
| Bio present | Recommended |
| ≥1 declared practice | Recommended (2B) |
| Website or Instagram | Optional |
| ≥1 verified work on public footprint | Trust recommended |
| Representation / participation visible | Informational |

**Organisation completeness checklist:**

| Signal | Weight |
|--------|--------|
| Public profile enabled | Required |
| Description present | Recommended |
| Location (when flag on) | Recommended |
| ≥1 roster Creative public | Recommended |
| Verified badge | Trust credential — not completeness score |

### 7.3 Field projection rules

| Rule | Detail |
|------|--------|
| **No public completeness score** | Field does not show “85% complete” or progress rings to anonymous visitors |
| **No ranking boost for completeness** | Complete profiles are not sorted higher in explorers |
| **Studio nudges only** | Account hero / practice section shows private completeness meter |
| **Explorer inclusion** | Incomplete profiles remain discoverable if `public_presence.profile` true |

### 7.4 Discoverability copy (Field)

When profile lacks declared practices but has registry-evidence practices, Field may show:

> “Practices inferred from verified Registry records. Add declared practices in Studio to describe how you work.”

Copy appears **only to profile owner** when authenticated preview path exists — not to anonymous visitors.

### 7.5 Acceptance criteria (AC-PC*)

| ID | Criterion |
|----|-----------|
| AC-PC1 | Studio surfaces private completeness checklist for Creative and Organisation |
| AC-PC2 | Field public pages show no completeness percentage or rank |
| AC-PC3 | Explorer inclusion does not require practice selection |
| AC-PC4 | Owner-only guidance copy for undeclared practice state |

---

## 8. Verification visibility

### 8.1 Trust hierarchy (unchanged — ADR-13, ADR-17)

On all discovery surfaces, signals appear in this **priority order**:

1. Record verification status  
2. Certificate public status  
3. Provenance / continuity summary (Field Record)  
4. Participation chronology (confirmed events only)  
5. Organisation verified badge  

### 8.2 2B consistency requirements

| Surface | 2B requirement |
|---------|----------------|
| Record Explorer cards | Verification badge before title/metadata |
| Creative Explorer cards | Verified **work count** — not a “verified Creative” badge unless derived from participation layer |
| Organisation Explorer | Org verified badge distinct from record verification |
| Practice chips | Must not use verification green styling — avoid trust confusion |
| Context panels | Verified records listed first within panel cap |
| Search results | Verification state visible without opening record |

### 8.3 Excluded signals (reaffirmed)

Stars, likes, followers, NFT badges, pay-to-rank placement, Field production completion badges (no commissions in 2B), team roles as verification substitutes.

### 8.4 Acceptance criteria (AC-VT*)

| ID | Criterion |
|----|-----------|
| AC-VT1 | Trust hierarchy order preserved on all new 2B discovery UI |
| AC-VT2 | Practice chips visually distinct from verification badges |
| AC-VT3 | Record Explorer default verified emphasis complies with §5.2 |
| AC-VT4 | No excluded reputation signals introduced in 2B |

---

## 9. Explorer information architecture

### 9.1 Hub structure (refined)

```
/field/explorer                    Hub — search entry + sub-nav
├── /field/explorer/records        Records (default tab — verified emphasis)
├── /field/explorer/creatives      Creatives (practice filters)
└── /field/explorer/organisations  Organisations
```

| Element | 2B behaviour |
|---------|--------------|
| Default tab | **Records** — honours Registry traffic and trust positioning (founder freeze) |
| Sub-nav | Records \| Creatives \| Organisations — persistent across explorer routes |
| Hub search | §1.5 unified entry |
| Active tab indicator | URL-driven — no client-only tab state |
| `/field` | Redirect to hub (2A) |

### 9.2 Global chrome (unchanged from 2A)

| Rule | Detail |
|------|--------|
| No Studio sidebar | ADR-28-C |
| Header nav | Field · Registry records explorer · About |
| Auth | Sign-in → Studio; no Field account settings |
| Terminology | “The Field” surface; “Registry record / Registry ID” on trust copy (ADR-31-A) |

### 9.3 Cross-explorer param preservation

| Param | Persists across tab switch? |
|-------|----------------------------|
| `q` | Yes — when target explorer supports text search |
| `practice` | No — Creative-only; dropped on tab switch |
| `verified` | Yes — Record and org-adjacent views only |
| `page` | Reset on tab switch |

### 9.4 Breadcrumb and orientation copy

Each explorer page includes **plain-language orientation**:

| Explorer | Orientation line (illustrative) |
|----------|--------------------------------|
| Records | “Browse Registry records on file.” |
| Creatives | “Discover Creatives and how they work.” |
| Organisations | “Browse public Organisations.” |

### 9.5 Acceptance criteria (AC-IA*)

| ID | Criterion |
|----|-----------|
| AC-IA1 | Hub sub-nav switches three explorer routes with URL as source of truth |
| AC-IA2 | Default explorer tab is Records with verified emphasis |
| AC-IA3 | Hub search routes per §1.5 without blended ranking page |
| AC-IA4 | Field chrome rules from 2A preserved |

---

## 10. Permissions and data access

Phase 2B inherits 2A permissions (§11 of Field Foundations Spec). Additions:

| Action | 2B rule |
|--------|---------|
| Edit declared practices | Studio account only — authenticated owner |
| Toggle practice visibility | Studio public presence settings |
| Search / filter explorers | Anonymous allowed |
| View registry-evidence practices | Anonymous when profile public + practices visible |

**No new Field mutations.** No new ledger write paths.

---

## 11. Migration and URL policy

| Change | Policy |
|--------|--------|
| `/registry/[id]`, `/artwork/[id]` → Field Record | 301 permanent (ADR-29) |
| Redirect retention | ≥2 release cycles minimum |
| Shared links | `registry_id` stable across migrations |
| Email / marketing audit | Update templates referencing legacy record URLs |

---

## 12. Success metrics (directional)

| Metric | Intent |
|--------|--------|
| Search success rate | Sessions with `q` that reach a profile or record |
| Practice filter usage | Creative Explorer `practice=` engagement |
| Graph traversal depth | Explorer → profile → record within session |
| Verified-default comprehension | Users understand unverified inclusion when filter broadened |
| Registry registration rate | No regression vs 2A baseline |

**Not measured:** recommendation CTR, social engagement, brief applications.

---

## 13. Explicit exclusions

The following **must not appear** in Phase 2B:

| Exclusion | Rationale |
|-----------|-----------|
| Opportunities, briefs, programmes, applications | 2C scope |
| Commissioning, production, teams, milestones | 2D scope |
| Marketplace, payments, listing commerce | 2E / ADR-25 |
| Social feeds, follow graph, DMs | Blueprint guardrail |
| Recommendation algorithms, similarity scores, “for you” | ADR-20 |
| Platform auto-matching (brief ↔ Creative) | ADR-19 |
| Pay-to-boost discovery placement | ADR-17 |
| Programme stub pages | User scope constraint |
| Sector / capability taxonomy editor | Future phase |
| User-generated practice tags | Taxonomy governance |
| Geo map search | Deferred |
| Public completeness scores | §7 |

---

## Acceptance gate summary

Phase 2B is **complete** when:

1. All acceptance criteria **AC-SR, AC-PR, AC-DC, AC-DO, AC-DR, AC-GN, AC-PC, AC-VT, AC-IA** pass on staging sign-off.
2. Phase 2A checkpoint tag applied and 2A open issues O-1, O-3, O-5 closed or explicitly waived with documented delta.
3. ADR-18-B, ADR-13, ADR-17, ADR-19-A, ADR-20-A confirmed **DECIDED** or accepted as specified.
4. Registry preservation verified — no ledger regression.
5. Founder/product sign-off on DRAFT → **LOCKED** promotion.

---

## Dependencies

| Dependency | Requirement |
|------------|-------------|
| Phase 2A complete | `checkpoint-phase2a-field-foundations` |
| Practice foundation review | Product rules in §2 align with [phase-2a-practice-foundation-review.md](./phase-2a-practice-foundation-review.md) |
| Founder freeze | Public presence flag review for `practices` |
| Phase 1 Registry | Read models and RPCs unchanged |

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2b-discovery-expansion-plan.md](./phase-2b-discovery-expansion-plan.md) | Rollout sequence |
| [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) | Predecessor spec |
| [phase-2a-pr1-signoff.md](./phase-2a-pr1-signoff.md) | 2A baseline |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR source |
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Parent architecture |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | DRAFT | Initial Phase 2B Discovery Expansion specification |
