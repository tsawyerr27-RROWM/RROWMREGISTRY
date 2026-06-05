# Phase 2A — Trust Audit (Field Surfaces)

**Document status:** IMPLEMENTATION REVIEW  
**Effective:** 31 May 2026  
**Branch context:** `pr/phase2a-field-pr1` (post-PR1A / PR1B / PR1C)  
**Authority:** [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN §3–§4), [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT §6), [Phase 2A PR1 Plan](./phase-2a-pr1-field-foundation-plan.md) (§5 Verification layer)  
**Surfaces reviewed:** `/field` (homepage), `/field/creative/[slug]` (Creative Presence), `/field/explorer/creatives` (Creative Explorer)  
**Scope:** Read-only audit — **no code, schema, or UI redesign** in this document.

---

## Executive summary

The Field Creative path (**homepage → explorer → presence → legacy registry/artwork records**) establishes the right **anti-patterns** (no social metrics, no paid rank, discovery-not-recruitment copy) and surfaces **some** ledger-backed signals. Trust is **partially legible** to informed users but **not yet understandable end-to-end** for a first-time visitor.

| Verdict | Assessment |
|---------|------------|
| Trust signals present | Participation layers, per-work badges, verified-work counts, registry IDs, explorer verification filter |
| Trust signals missing | Certificate status, verify path (stub), Field Record trust band, hierarchy explainer, practice on Presence |
| Registry-derived evidence | **Moderate** on Presence; **light** on Explorer cards; **conceptual only** on homepage |
| Hierarchy clarity | **Weak** — participation and self-authored bio often appear **before** registry footprint; certificate tier absent |
| PR1D readiness | **Proceed with recommendations below** — do not ship verify move without addressing copy and hierarchy gaps |

---

## 1. Reference — frozen verification hierarchy

Per founder freeze §3 and PR1 plan §5.2, Field trust display order is:

| Rank | Signal | Authoritative source |
|------|--------|----------------------|
| 1 | Record verification status | `artworks.verification_status` / read model |
| 2 | Certificate public status | `get_certificate_public_status_*` RPC |
| 3 | Provenance / continuity summary | Record page (PR2 Field Record) |
| 4 | Participation chronology | Representation / authorship RPCs, confirmed events |
| 5 | Organisation verified badge | `galleries.verified` |

**Dual-label rule (ADR-31-A):** Surface branding = **The Field**; trust descriptors retain **Registry record** and **Registry ID**.

**Forbidden:** stars, likes, followers, NFT badges, pay-to-boost, Field production badges.

---

## 2. Surface-by-surface inventory

### 2.1 Field homepage (`/field`)

**Implementation:** `components/Field/FieldHomeContent.tsx`

#### Where trust signals appear

| Element | Type | Notes |
|---------|------|-------|
| `field.home.registryNote` | Conceptual | “Registry remains the system of record… Field reads from it” |
| Verify section copy | Conceptual | Points to Registry ID check via `/field/verify` |
| Explorer section copy | Process | “No recommendations or paid ranking” — anti-gaming signal |
| Verify link | Navigation | Routes to `/field/verify` (currently **stub**) |

#### Where trust signals are missing

| Gap | Impact |
|-----|--------|
| No live trust examples | Homepage orients but does not **demonstrate** verification |
| Verify entry is stub | Primary trust CTA resolves to placeholder — **breaks first-time visitor path** |
| No hierarchy explainer | Visitor cannot learn what “verified on file” means before clicking through |
| Records explorer link | Points to stub `/field/explorer/records` — no record-level trust yet |

#### Registry-derived evidence visibility

**Low (by design at this stage).** Homepage correctly frames Registry as authority but shows **no counts, badges, or sample records**.

#### First-time visitor comprehension

**Partial.** A careful reader understands Field ≠ Studio and Registry = truth. A casual visitor gets **navigation**, not **trust literacy**.

---

### 2.2 Creative Presence (`/field/creative/[slug]`)

**Implementation:** `lib/field-creative-presence.ts`, `components/Field/CreativePresenceView.tsx`

#### Where trust signals appear

| Location | Signal | Hierarchy tier | Source |
|----------|--------|----------------|--------|
| Participation layers strip | Representation on file, artist confirmation, historical representation | 4 | `get_artist_representation_state` RPC + gallery join |
| Organisation block | Institution-linked / representation copy; link when org public | 4–5 | `galleries.verified`, `presence.ownership` |
| Registry footprint header | “N verified on file” aggregate count | 1 (aggregate) | Count query on `artworks` |
| Work grid — image badge | `artworkCardParticipationLabel` per work | 1 + 4 blended | `verification_status` + institution link |
| Work grid — registry ID | Mono `registry_id` | 1 (identifier) | Artwork row |
| Work grid — status filter | Verified / pending / all | 1 | `RegistryListFilters` |
| Trust bridge footer | Copy + links to `/registry`, `/field/verify` | Conceptual + nav | Static |

#### Where trust signals are missing

| Gap | Spec / hierarchy impact |
|-----|-------------------------|
| **Certificate public status** | Tier 2 absent on profile and per-work cards |
| **Per-record verification label** | Badge uses participation phrasing (“Layered attestations on file”) not explicit “Verified record” |
| **Practice chips** | Explorer shows practice; **Presence does not** — inconsistent discovery story |
| **Verify deep link per work** | No `/field/verify/[registry_id]` from cards (stub route exists) |
| **Field Record link** | Links to legacy `/registry/[id]` and `/artwork/[id]` only — no Field Record trust band (PR2) |
| **Hierarchy explainer** | `ParticipationLayersStrip` footnote may show but no “Registry verification vs participation” primer |
| **Empty footprint state** | Directs to `/registry` browse — bypasses Field verify/explorer narrative |

#### Registry-derived evidence visibility

**Moderate on the works section; weak above the fold.**

| Strength | Weakness |
|----------|----------|
| Verified work count in section header | Appears **below** bio and participation strip |
| Registry ID on every card | Primary button is **“View artwork”** (curated) not **“Registry record”** |
| Per-work participation badge | Emerald styling overlaps visually with “trust green” used elsewhere |
| Filter by verification status | Requires user to discover filters — not surfaced in hero |

**Self-authored content outranks registry evidence in layout order:**

```
Current vertical order:
  Identity (display name)
  → Participation layers (tier 4)     ← before registry block
  → Bio (self-authored)
  → External links (self-authored)
  → Organisation (tier 4–5)
  → Registry footprint (tier 1 evidence)
```

This **inverts** the frozen hierarchy for above-the-fold scanning.

#### First-time visitor comprehension

**Weak to moderate.** Phrases like “Layered attestations on file” and “Institution-linked representation on file” assume Registry literacy. Without certificate status or a verify link per record, visitors cannot complete the trust loop on Field alone.

---

### 2.3 Creative Explorer (`/field/explorer/creatives`)

**Implementation:** `lib/fetch-creative-explorer-list.ts`, `components/Field/CreativeExplorer*.tsx`, `CreativePresenceCard.tsx`

#### Where trust signals appear

| Location | Signal | Notes |
|----------|--------|-------|
| Hero lede | Copy | “verification on file, and registry footprint… not a marketplace” |
| Verified filter | `verified=1` | Artists with `verification_status = verified` **or** ≥1 verified work |
| Practice chips (registry) | Emerald chips | Tooltip: “Inferred from verified registry records” — **registry-derived** |
| Practice chips (declared) | Neutral chips | Tooltip: “Declared on profile” — **self-authored** |
| Card verification line | “N verified on file”, artist confirmation, institution-linked | Understated 11px text — good tone |
| Card footer | “N works on registry” | Registry footprint count |
| Sort | Name / recent | No popularity rank — compliant |

#### Where trust signals are missing

| Gap | Impact |
|-----|--------|
| **Certificate status** | Tier 2 not representable at card level |
| **No sample registry ID** | Cards link to profile, not a verified record |
| **Verified filter label** | “Verified on file” undefined for visitors |
| **Creatives with zero signals** | Card may show only bio — indistinguishable from credible profiles |
| **Practice without registry inference** | Declared-only practices have **equal visual weight** to registry-inferred unless user hovers tooltip |
| **No link to verify** | Explorer does not offer record-level verify entry |

#### Registry-derived evidence visibility

**Light but directionally correct.**

Registry evidence appears as: verified work count, registry practice inference (emerald chips), total work count. **Insufficient alone** to establish credibility without clicking through to Presence — acceptable for an index, but cards with `0 works on registry` and no verification line are **trust-neutral**.

#### First-time visitor comprehension

**Moderate on tone; weak on semantics.** Anti-recruitment copy lands. Filter labels and chip tooltips help **hovering** users only; mobile/first glance does not explain hierarchy.

---

## 3. Cross-surface trust matrix

| Signal | Homepage | Explorer card | Presence profile | Hierarchy tier | Sufficiently visible? |
|--------|----------|---------------|------------------|----------------|-------------------------|
| Record verification status | — | Aggregate only | Per-work badge + filter | 1 | **Partial** |
| Certificate public status | — | — | — | 2 | **Missing** |
| Provenance / continuity | — | — | — (PR2 record) | 3 | **Missing** (expected pre-PR2) |
| Participation / representation | — | Text line | Strip + org block | 4 | **Yes** (maybe too prominent) |
| Organisation verified | — | “Institution-linked” | Org copy | 5 | **Partial** |
| Registry ID | — | — | Per card | 1 | **Yes** on Presence |
| Verified work count | — | Yes | Yes | Allowed factual count | **Yes** |
| Practice (registry-derived) | — | Emerald chips | **Missing** | N/A | **Partial** |
| Practice (declared) | — | Neutral chips | **Missing** | N/A | **Partial** |
| Verify entry | Link (stub) | — | Footer link (stub) | — | **Broken until PR1D** |

---

## 4. Assessment against audit questions

### 4.1 Where trust signals currently appear

**Summarized:** Participation representation (RPC-backed), per-work participation badges, verified-work aggregates, registry IDs, explorer verification filter, registry-inferred practice chips, and conceptual Registry-as-truth copy on homepage and footers.

### 4.2 Where trust signals are missing

**Critical path gaps before PR1D:**

1. **`/field/verify` and `/field/verify/[registry_id]` are stubs** — homepage and presence footers link to non-functional trust entry.
2. **Certificate public status (tier 2)** — nowhere on the three reviewed surfaces.
3. **Explicit record verification labeling** — participation language substitutes for “verified record” semantics.
4. **Hierarchy ordering on Presence** — bio and participation precede registry footprint.
5. **Practice on Presence** — explorer advertises practice; profile does not.
6. **Visitor-facing definitions** — “verified on file”, “on file”, “Registry record” used without a Field-level glossary or inline explainer.

### 4.3 Is Registry-derived evidence sufficiently visible?

| Surface | Rating | Rationale |
|---------|--------|-----------|
| Homepage | **N/A / Low** | Appropriately conceptual at entry |
| Explorer | **Light** | Counts + inferred practice; no record anchor |
| Presence | **Moderate** | Strongest surface — IDs, filters, badges, counts — but visually subordinate to bio |

**Overall: insufficient for a trust-first first impression**, adequate for users who reach the registry footprint section or open a work card. Primary CTA hierarchy (**View artwork** > **Registry record**) subtly deprioritizes ledger entry.

### 4.4 Is verification hierarchy understandable to a first-time visitor?

**No — not yet.**

| Confusion risk | Example |
|----------------|---------|
| Tier collapse | Participation strip uses emerald “on file” styling similar to verified connotations |
| Missing tier 2 | Certificate status invisible — visitor cannot distinguish verified record vs issued/revoked cert |
| Terminology stack | “Layered attestations”, “Institution-linked”, “verified on file” without ordered explanation |
| Broken verify promise | Homepage says check by Registry ID → stub page |
| Self-authored precedence | Bio and declared practice (explorer) appear before or beside registry evidence |

**What works:** factual counts (not scores), no social metrics, discovery-not-recruitment tone, registry ID monospace on works.

### 4.5 Recommendations before PR1D Verification

Prioritized for PR1D implementation planning (still within “no redesign” — behavioural/copy/ordering only):

#### P0 — Must address in PR1D

| # | Recommendation | Rationale |
|---|----------------|-----------|
| R-1 | **Ship verify move atomically** — `/field/verify` hub + `/field/verify/[registry_id]` with legacy redirect; remove stubs | Unblocks homepage + presence trust CTAs (AC-FV2) |
| R-2 | **Preserve existing verify logic** — certificate RPC, revoked state, auth-gated full cert | Tier 2 delivery |
| R-3 | **Trust copy pass (ADR-31-A)** — every verify surface uses “Registry record” / “Registry ID”; distinguish Field presentation vs Registry authority | AC-FV3 |
| R-4 | **Hub behaviour per plan §5.3** — instructional copy, record explorer link, registry ID input → `/field/verify/[id]` | Completes visitor trust loop |

#### P1 — Strongly recommended alongside PR1D (minimal Presence/Explorer touch)

| # | Recommendation | Rationale |
|---|----------------|-----------|
| R-5 | **Add per-work “Check verification” link** on Presence cards → `/field/verify/[registry_id]` | Connects tier 1 → tier 2 without waiting for PR2 Field Record |
| R-6 | **Reorder Presence hero block** — move aggregate verified count + participation strip **below** a one-line registry evidence summary, or lead footprint section earlier | Aligns scan order with hierarchy |
| R-7 | **Align primary/secondary actions on work cards** — equal or secondary emphasis on “Registry record”; consider verify tertiary link | Registry-derived evidence visibility |
| R-8 | **Mirror practice chips on Creative Presence** using same merge logic as Explorer | Consistency; registry-derived first |
| R-9 | **Inline micro-copy** on explorer filter “Verified on file” — e.g. “Creatives with verified Registry records or artist confirmation” | First-time comprehension |

#### P2 — Defer to PR2 Field Record or 2B polish

| # | Recommendation | When |
|---|----------------|------|
| R-10 | Field Record trust band (verification before metadata) | PR2 — AC-FV1 |
| R-11 | Provenance / continuity summary on record | PR2 |
| R-12 | Field-level “How trust works on The Field” static band (link from homepage) | 2B i18n pass |
| R-13 | Certificate status summary on explorer cards | Optional after verify path live |

#### P3 — Do not do in PR1D

| Anti-recommendation | Reason |
|---------------------|--------|
| Add star ratings, badges of honour, or “trust scores” | Forbidden §5.2 |
| Sort explorer by verified count | Forbidden paid/rank discovery |
| Auto-promote verified creatives in default sort | Recommendation engine adjacency |
| Heavy UI redesign | Out of scope for this audit |

---

## 5. PR1D acceptance alignment preview

| Criterion | Current state | PR1D expectation |
|-----------|---------------|------------------|
| AC-FV1 | Not testable (no Field Record) | PR2 |
| AC-FV2 | Stub | **Must pass** |
| AC-FV3 | Partial (“Registry footprint”, “Registry record” on presence; homepage OK) | **Verify move + copy grep** |
| AC-FV4 | Pass — no excluded reputation UI | Maintain |
| V-1 (plan §8) | Stub | **Must pass** |
| V-2 | Stub | **Must pass** |
| V-3 | Partial | Complete in PR1D |
| V-4 | Pass | Maintain |

---

## 6. Suggested PR1D implementation sequence

1. Move `app/verify/[registry_id]/page.tsx` → `app/field/verify/[registry_id]/page.tsx`; stub legacy redirect.  
2. Replace `/field/verify` stub with hub (static copy + ID input + link to record explorer when live).  
3. Copy review: “Registry record”, “Registry ID”, “verification status”, “certificate status” — no Field-as-authority language.  
4. Wire Presence card links to Field verify URLs (R-5).  
5. Smoke: homepage → verify hub → per-record; presence footer → verify; legacy `/verify/[id]` 301.  
6. Optional same-PR: R-6–R-9 if low-risk copy/order tweaks approved.

---

## 7. Appendix — code references audited

| Surface | Primary files |
|---------|---------------|
| Field homepage | `components/Field/FieldHomeContent.tsx`, `app/field/page.tsx` |
| Creative Presence | `lib/field-creative-presence.ts`, `components/Field/CreativePresenceView.tsx`, `components/Registry/ParticipationLayersStrip.tsx` |
| Creative Explorer | `lib/fetch-creative-explorer-list.ts`, `lib/practices.ts`, `components/Field/CreativePresenceCard.tsx`, `CreativeExplorerContent.tsx` |
| Verify (target of PR1D) | `app/field/verify/page.tsx` (stub), `app/verify/[registry_id]/page.tsx` (canonical logic today) |
| Trust language | `lib/representation-language.ts` |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | IMPLEMENTATION REVIEW | Post-PR1C trust audit ahead of PR1D |
