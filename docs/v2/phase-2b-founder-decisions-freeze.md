# Phase 2B Founder Decisions Freeze

**Document status:** FROZEN  
**Frozen:** 31 May 2026  
**Authority:** [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md) (LOCKED DRAFT), [Phase 2B Discovery Expansion Plan](./phase-2b-discovery-expansion-plan.md) (DRAFT), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT)  
**Purpose:** Capture **founder-level decisions settled before Phase 2B implementation begins**.  
**Scope:** Product philosophy only — **no implementation details, no database schema, no UI design.**

**Effect:** This document **freezes** ADR outcomes for Phase 2B (ADR-13, 17, 18, 19, 20 and 2B-specific product policy). Phase 2A frozen decisions **remain binding** unless explicitly superseded here. Implementation must conform unless this document is unlocked.

---

## 1. Search model

### Decision

**Phase 2B search is explainable full-text and facet search — not algorithmic discovery.**

| Surface | 2B search capability |
|---------|---------------------|
| **Record Explorer** | `q` on title, `registry_id`, artist display name; verification filter; explicit sort; pagination |
| **Creative Explorer** | `q` on display name, slug, bio; optional `practice` facet (PR2 within 2B); pagination |
| **Organisation Explorer** | `q` on name, location (when public), description; verified toggle; pagination |
| **Explorer hub** | Unified search **entry** — routes intent (Registry ID vs general text); **not** a blended ranked results page |

**Field Search Contract parameters:** `q`, `verified`, `practice`, `sort`, `page` — composed with **AND** logic against visibility gates. No hidden ranking factors.

**Search infrastructure:** Existing read-model / database query patterns first (**ADR-18-B**). Managed external index (Algolia, etc.) **excluded** unless this freeze is unlocked (**ADR-18-C**).

**Recommendations, similarity, match scores, “for you” feeds:** **Excluded** (**ADR-20-A**).

### Rationale

2A deferred full-text search to 2B while preserving Registry list parity. Explainable search extends discovery without black-box matching or engagement ranking. Hub routing avoids building a pseudo-recommendation engine disguised as global search.

### Future review trigger

- Query volume or latency → unlock ADR-18-C (managed index) with founder + engineering sign-off.
- Phase 2C open calls → separate brief list query vocabulary; do not merge into global ranked feed.
- Founder requests in-app “suggested Creatives” → ADR-20 unlock required.

---

## 2. Record discovery default

### Decision

**Record Explorer defaults to verified-first emphasis** with an **explicit user control** to include all public records.

| Policy | Rule |
|--------|------|
| Default listing | Verified records emphasised (2A signoff O-3 resolution) |
| Broaden scope | User-visible filter — not implicit inclusion |
| Copy | When unverified records shown, UI states scope clearly |
| Sort default | Registry list parity — **not** popularity or engagement |

**Registry ID lookup:** Exact/prefix match on `q` or hub entry routes to Field Record or verify not-found — never silent failure.

### Rationale

Trust-forward discovery aligns with Blueprint §8.2 and 2A verification hierarchy. Closing O-3 restores parity with legacy public Registry emphasis without hiding the broaden control.

### Future review trigger

- Analytics show users cannot find expected unverified records → copy/UX review only; **do not** switch default to all-records without unlock.
- Phase 2C brief-linked records → separate listing surfaces; not Record Explorer default change.

---

## 3. Practice taxonomy

### Decision

**Practice is a closed canonical taxonomy** — multi-valued, Studio-edited, Field-projected, explorer-filterable.

| Rule | 2B stance |
|------|-----------|
| Vocabulary | Closed list (Product Blueprint §2 practice types) — **no user-generated tags** |
| Declared practices | Creative selects up to **5** in Studio; **one primary** among declared |
| Registry-evidence practices | May display from **verified** work mediums — **distinct source label** from declared |
| Silent auto-declaration | **Forbidden** — medium inference never writes declared practices without Studio save |
| Explorer filter | `practice=` matches declared **or** registry-evidence slugs |
| Profile visibility | New `public_presence.practices` flag — default **`true`** when profile public |
| Practice vs medium | Practice = how Creative works; medium = record attribute — **not interchangeable** |

**Organisation practice filter** (orgs by represented Creative practice): **Deferred to 2B.1** — not required for 2B gate.

### Rationale

2A explicitly excluded practice editor; 2B north star requires “understand how a Creative works.” Dual lineage (declared + evidence) preserves honesty — evidence is not self-assertion. Closed taxonomy prevents tag spam and enables future 2C brief filters without rework.

### Future review trigger

- New practice type → product version bump + taxonomy governance review.
- Sector / capability dimensions → separate 2C+ spec; do not collapse into practice slugs.
- Founder proposes user-defined practice tags → unlock required.

---

## 4. Verification and trust (inheritance + 2B extension)

### Decision

**2A trust hierarchy is unchanged.** 2B adds **visual and search consistency** only — no new trust primitives.

**Fixed priority order (highest first):**

1. Record verification status  
2. Certificate public status  
3. Provenance / continuity summary  
4. Participation chronology (confirmed events only)  
5. Organisation verified badge  

**2B additions:**

| Rule | Detail |
|------|--------|
| Practice chips | **Visually distinct** from verification badges — never trust-green styling |
| Search results | Verification state visible on Record cards before secondary metadata |
| Context panels | Verified records listed first within deterministic caps — **not** engagement order |

**Dual label preserved:** Surface **The Field**; trust copy retains **Registry record** / **Registry ID** (ADR-31-A, 2A freeze §3).

### Rationale

Practice introduction must not dilute verification as primary trust signal. 2B discovery enrichment must not introduce alternate reputation economy (2A freeze §9).

### Future review trigger

- Phase 2D commission-delivered records → Field production link position in hierarchy (below participation — 2D spec).
- Certificate public access policy → unlock ADR-32.

---

## 5. URL and redirect policy (2A completion)

### Decision

**Complete 2A-deferred record detail canonicalisation in 2B PR1.**

| Legacy | Canonical | Policy |
|--------|-----------|--------|
| `/registry/[registry_id]` | `/field/record/[registry_id]` | **301 permanent** |
| `/artwork/[registry_id]` | `/field/record/[registry_id]` | **301 permanent** |

**Stable identifiers:** `registry_id` unchanged across redirects.

**Registry ledger view:** `/registry/[registry_id]` may remain reachable as **secondary authoritative surface** after redirect stub — primary **discovery** links target Field Record.

**Redirect retention:** Minimum **301 for two release cycles**; **prefer permanent 301** (ADR-29, 2A freeze §7).

**No new canonical URLs in 2B PR1** — search and IA enrich existing `/field/explorer/*`, presence, and record routes.

### Rationale

Closes 2A signoff O-1. Single public discovery path for records while preserving Registry as system of record terminology and optional ledger deep-link.

### Future review trigger

- `/certificate/[id]` migration → optional 2B.1 (ADR-32).
- Phase 2C routes (`/field/open-calls`, etc.) → extend redirect matrix document.

---

## 6. Relationship graph

### Decision

**Field browse graph is deterministic — not a social graph.**

| Rule | 2B stance |
|------|-----------|
| Required edges | Explorer → presence/record → profiles ↔ records per 2B spec §6.2 |
| Context panels | Rule-based (“same Creative”, “same Organisation”, practice explorer link) — **≤6 items**, verification-first ordering |
| Similarity language | **Forbidden** if it implies ML (“similar items”, “you may also like”) |
| Legacy profile links | Primary targets use `/field/creative/[slug]`, `/field/organisation/[slug]` — closes O-5 |
| Private targets | Omit link or neutral copy — no existence leak beyond 2A policy |

**No follow graph, no connection counts, no browse history surfaced to other users.**

### Rationale

2B completes connected discovery promised in 2A without social network mechanics. Deterministic panels extend navigation explainably.

### Future review trigger

- Phase 2C brief publisher graph → add brief → org → roster edges in 2C spec only.
- “Similar medium” panel copy → must remain factual (shared medium string), not scored similarity.

---

## 7. Profile completeness

### Decision

**Completeness is a Studio stewardship tool — not a public Field reputation signal.**

| Rule | Detail |
|------|--------|
| Studio meter | Private checklist for Creative and Organisation (bio, practices, links, verified works, etc.) |
| Field public pages | **No** completeness percentage, progress ring, or rank to anonymous visitors |
| Explorer inclusion | **No** minimum completeness required for listing when `public_presence.profile` true |
| Owner guidance | Authenticated owner may see practice declaration nudge — **not** shown to anonymous users |

### Rationale

Encourages metadata quality without gamification or discovery pay-to-complete dynamics. Aligns with ADR-17 exclusions.

### Future review trigger

- Public “verified profile” badges tied to completeness → **reject** unless unlock + ADR-17 review.
- Org public commission portfolio (ADR-15-B) → 2D+ only.

---

## 8. Explorer information architecture

### Decision

**2A hub structure is unchanged.** 2B adds search entry and param rules only.

| Element | Rule |
|---------|------|
| Hub | `/field/explorer` — **Record Explorer default tab** (2A freeze §2) |
| Sub-nav | Records \| Creatives \| Organisations — URL is source of truth |
| Hub search | Routes Registry ID vs general `q` — §1 |
| Param preservation | `q` persists across compatible tab switches; `practice` dropped outside Creative explorer; `page` resets on tab switch |
| Orientation copy | Plain-language line per explorer (i18n in 2B) |

**Excluded from hub nav:** open calls, programmes, briefs, marketplace, recommendations.

### Rationale

2B enriches discovery without restructuring 2A IA. Records-first default honours Registry traffic heritage (2A founder freeze §2).

### Future review trigger

- Phase 2C → add open calls to hub nav with founder review of default landing tab.
- Analytics-driven default tab change → unlock 2A freeze §2 explorer model.

---

## 9. Studio and Registry relationship (unchanged)

### Decision

**2A division of responsibility remains binding.**

| Concern | Owner |
|---------|--------|
| Practice declaration, profile edit, presence toggles | **Studio** |
| Search, filters, explorers, graph navigation | **Field** (read-only) |
| Ledger mutations | **Studio / Registry APIs only** |
| Field chrome | **No Studio sidebar** on public Field routes |

Phase 2B introduces **no** Field write paths and **no** ledger semantic change.

### Rationale

Discovery expansion must not blur three-surface architecture established in Phase 1 and 2A.

### Future review trigger

- Any Field route proposing ledger write → **reject** unless Blueprint amended.

---

## 10. Explicit anti-features (Phase 2B)

### Decision

The following are **frozen exclusions for Phase 2B** — implementation must **not** ship them, including placeholders:

| Anti-feature | Status |
|--------------|--------|
| Opportunities, briefs, programmes, applications | **Excluded** → 2C |
| Commissions, projects, teams, milestones | **Excluded** → 2C–2D |
| Commissioning, production workflows | **Excluded** → 2D |
| Marketplace, payments, checkout on Field | **Excluded** → 2E / ADR-25 |
| Social feeds, follow graph, DMs | **Excluded** — permanent guardrail |
| Recommendation algorithms, similarity scores, “for you” | **Excluded** — permanent guardrail |
| Platform auto-matching (brief ↔ Creative) | **Excluded** → 2C (**ADR-19-C** rejected) |
| Pay-to-rank / pay-to-boost discovery | **Excluded** — permanent guardrail |
| Programme stub landing pages | **Excluded** — not 2B scope |
| Sector / capability taxonomy editor | **Excluded** → 2C+ prep |
| Managed search index without unlock | **Excluded** — ADR-18-C locked out |
| User-generated practice tags | **Excluded** |
| Public completeness scores on Field | **Excluded** |
| Geo map search | **Excluded** |
| Field ledger writes | **Excluded** — permanent guardrail |
| Studio sidebar on Field | **Excluded** — 2A chrome rule |

**Placeholder rule:** No nav items, CTAs, or empty states implying excluded features are available in 2B.

### Rationale

2B is **discovery expansion only** — the first enrichment release after 2A foundations. Scope containment prevents drift into Opportunity (2C) or social product patterns.

### Future review trigger

- Each excluded capability unlocks only via **Phase 2 sub-spec** (2C, 2D, 2E) + governance unlock — not piecemeal in 2B patches.

---

## 11. Phase 2B PR sequencing (product)

### Decision

Phase 2B ships as **sequenced implementation trains** — not a single undifferentiated release:

| Train | Scope | Gate |
|-------|-------|------|
| **PR1 — Search and discovery** | Record URL redirects; Field Search Contract; verified-default Record Explorer; explorer text search; hub search IA; primary graph link canonicalisation | PR1 signoff |
| **PR2 — Practice** | Studio practice edit; Field practice display; Creative Explorer `practice=` facet | PR2 signoff |
| **PR3 — Graph and completeness** | Context panels; Studio completeness meter; verification visibility pass | PR3 signoff |
| **PR4 — Acceptance** | i18n pass; full 2B AC gate; checkpoint tag | 2B complete |

PR1 **must not** wait for PR2 practice Studio edit. PR2 **must not** ship before PR1 redirects and search contract are stable.

### Rationale

Separates search infrastructure and URL completion from practice taxonomy work — reduces merge risk and allows incremental staging validation.

### Future review trigger

- Founder merges trains → unlock §11 with documented rationale.

---

## Unlock procedure

To change any frozen §1–§11 decision:

| Step | Required action |
|------|-----------------|
| 1 | **Founder + product** written approval for the specific section change |
| 2 | **Engineering lead** impact assessment (redirects, search, Registry preservation) |
| 3 | **Documented delta** — what changes, what stays excluded, which AC-* affected |
| 4 | **Version bump** — e.g. `phase-2b-founder-decisions-freeze` v1.1 |
| 5 | **Downstream update** — amend [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md) and PR plans in same governance commit |
| 6 | **ADR sync** — mark affected ADRs DECIDED with new option in [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) |

**Emergency unlock (production incident only):** Engineering lead may temporarily bypass a **non-safety** product rule with founder notification within 24h and retroactive doc update — **never** for anti-features §10 or ledger write paths.

**Conflicts:** This freeze **prevails** on product philosophy; [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md) **prevails** on acceptance criteria detail. Phase 2A founder freeze **prevails** where 2B is silent.

---

## Freeze attestation

| Field | Value |
|-------|--------|
| **Frozen decisions** | §1–§11 above |
| **Supersedes** | PENDING status on ADR-18, 19, 20 for Phase 2B scope; resolves 2A deferrals O-1, O-3, O-5 |
| **Inherits** | Phase 2A founder freeze §1–§10 where not superseded |
| **Implementation authority** | [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md) AC-* criteria |
| **PR1 execution authority** | [phase-2b-pr1-search-and-discovery-plan.md](./phase-2b-pr1-search-and-discovery-plan.md) |

**Statement:**

> Phase 2B founder decisions are **frozen** as of 31 May 2026. Implementation of Field Discovery Expansion may proceed against the 2B spec and PR1 plan without re-litigating §1–§11 unless this document is unlocked.

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md) | Acceptance criteria |
| [phase-2b-discovery-expansion-plan.md](./phase-2b-discovery-expansion-plan.md) | Full 2B rollout sequence |
| [phase-2b-pr1-search-and-discovery-plan.md](./phase-2b-pr1-search-and-discovery-plan.md) | PR1 execution |
| [phase-2a-founder-decisions-freeze.md](./phase-2a-founder-decisions-freeze.md) | Predecessor freeze |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR catalogue |
| [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) | Document registry |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | FROZEN | Initial Phase 2B founder decisions freeze |
