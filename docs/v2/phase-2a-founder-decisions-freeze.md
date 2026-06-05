# Phase 2A Founder Decisions Freeze

**Document status:** FROZEN  
**Frozen:** 31 May 2026  
**Authority:** [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED)  
**Purpose:** Capture **founder-level decisions settled before Phase 2A implementation begins**.  
**Scope:** Product philosophy only — **no implementation details, no database schema, no UI design.**

**Effect:** This document **freezes** ADR outcomes for Phase 2A (ADR-13, 15, 17, 27–32). Implementation must conform unless this document is explicitly unlocked.

---

## 1. Presence model

### Decision

Public Field surfaces are **opt-in per participant** via existing **`public_presence` flags** — Studio remains the edit source; Field is read-only projection.

| Participant | Field route | Visibility gate |
|-------------|-------------|-----------------|
| Creative | `/field/creative/[slug]` | `public_presence.profile` enabled |
| Organisation | `/field/organisation/[slug]` | `public_presence.profile` enabled |
| Collector | `/field/collector/[slug]` | `public_presence.profile` enabled; **limited** public scope (collection/custody — no commissioning) |

When profile presence is **disabled**, anonymous users receive **404** on Field URLs. Owners continue to preview and edit in **Studio account** only. Organisation sub-sections (roster, catalogue) respect existing granular presence flags — Field does not expand or relax them in 2A.

### Rationale

Preserves participant privacy control established pre–Phase 2. Avoids forcing public exposure as a condition of using RROWM. Aligns with Blueprint principle: Field = public projection, Studio = edit source. Collector presence stays **limited** — custody narrative, not production identity.

### Future review trigger

- Phase 2B practice-aware discovery requires richer public metadata → review whether new presence flags are needed (discipline visibility, geo).
- Phase 2C brief publishing → review org presence requirements for open-call publishers.
- Material change to anonymity model for collectors → unlock with product + founder sign-off.

---

## 2. Explorer model

### Decision

The Field exposes **three public explorers** under a shared hub — **Record**, **Creative**, and **Organisation** — plus participant **profile** pages as destinations.

| Explorer | Canonical route | Primary unit |
|----------|-----------------|--------------|
| **Record Explorer** | `/field/explorer` (default) / `/field/explorer/records` | Registry record (work) |
| **Creative Explorer** | `/field/explorer/creatives` | Public Creative profile |
| **Organisation Explorer** | `/field/explorer/organisations` | Public Organisation profile |

**Hub default:** `/field/explorer` lands on **Record Explorer** (works-first discovery, heritage from public Registry). Creative and Organisation explorers answer **“who”**; Record Explorer answers **“what work.”** All three link into a connected graph (profile ↔ record).

**Excluded from 2A explorers:** open calls, briefs, programmes, commissions, recommendations, marketplace listings.

### Rationale

Supports the 2A north star: discover a **Creative**, understand practice, trust credentials, navigate to **Records**. Works-first hub honours existing Registry traffic and trust positioning; participant explorers make Creatives and Organisations first-class discovery targets without waiting for Opportunity objects (2C).

### Future review trigger

- Phase 2B may add discipline/geo filters → explorer IA review.
- Phase 2C adds `/field/open-calls` → update hub navigation and default landing policy.
- Analytics show hub default misaligned with user intent → founder review of default tab (records vs creatives).

---

## 3. Verification hierarchy

### Decision

Trust signals on Field surfaces follow a **fixed priority order** (highest first):

1. **Record verification status** (verified / unverified / pending)
2. **Certificate public status** (via existing public verify path)
3. **Provenance / continuity summary** (Field Record)
4. **Participation chronology** (confirmed authorship / institution filing events only)
5. **Organisation verified badge** (`galleries.verified` on org profile and org-attributed context)

**Public verify:** `/field/verify/[registry_id]` is the public verification entry point. **Full certificate document** remains **authenticated** — verify status is public; cert body is not (ADR-32-A).

**Copy:** Dual label — surface branding **The Field**; trust descriptors retain **Registry record** and **Registry ID** (ADR-31-A).

### Rationale

Registry verification is the product’s core trust primitive. Hierarchy prevents secondary signals (org badge, participation) from overshadowing ledger-backed status. Dual label preserves three-surface language freeze (Studio / Field / Registry) without erasing Registry as trust system.

### Future review trigger

- Phase 2D commission-delivered records → where **Field production link** sits in hierarchy (below participation, above social — spec in 2D).
- Certificate public access policy change → unlock ADR-32.
- New verification tiers or anchor productisation → Blueprint version bump.

---

## 4. Trust model

### Decision

**Trust is ledger-backed and attestation-bound — never purchased as rank.**

| Trust source | On Field in 2A |
|--------------|----------------|
| Verification + certificate + continuity | **Primary** — Record pages |
| Participation / representation on file | **Secondary** — profiles and records |
| Organisation verified badge | **Secondary** — org profiles and attribution |
| Factual counts (e.g. N verified works) | **Allowed** — not scored rankings |
| Field team / production credits | **Excluded** — no commissions in 2A |
| Pay-to-verify without attestation | **Forbidden** |
| Subscription tier as sort rank | **Forbidden** |

Organisation **verified** status affects **eligibility and badge display**, not paid placement in explorer sort order.

### Rationale

Blueprint §5.3: “Never sell trust.” Phase 1 production validation established Registry UX as authority. Field 2A introduces discovery without introducing new trust primitives that could dilute verification.

### Future review trigger

- Monetisation of org subscription productised → confirm subscription still does not reorder discovery (ADR-22).
- Phase 2C brief publishing → trust gates for publishers (ADR-08 tiered visibility).
- Founder proposes verification monetisation → Blueprint v1.2 required.

---

## 5. Registry relationship

### Decision

**The Registry remains the system of record.** Phase 2A Field surfaces are **read-only** with respect to ledger truth.

| Rule | 2A stance |
|------|-----------|
| Ledger mutations | **Studio / Registry APIs and RPCs only** — never Field routes |
| Field Record URL | `/field/record/[registry_id]` — **`registry_id` unchanged** |
| Legacy record URLs | **301** to Field Record |
| Record visibility rules | **Unchanged** — same as pre-2A Registry |
| API namespace | **No `/api/registry/*` migration in 2A** |
| Schema / RLS | **Zero semantic change** in 2A |

Field may **invoke** existing read paths (views, public RPCs). Personal archive **save** remains Studio/API CTA — not Field mutation.

### Rationale

Phase 1 registry preservation rule and production certification depend on ledger stability. Field 2A is a **namespace and chrome migration** plus participant discovery — not a registry rewrite.

### Future review trigger

- Phase 2D deliverable → register bridge → review nullable commission link on Record (Blueprint bridge column — schema phase, not 2A).
- API namespace migration (`/api/registry/*`) → separate programme decision post-2A.
- Any proposal for Field to write ledger tables → **rejected** unless Blueprint amended.

---

## 6. Studio relationship

### Decision

**Studio owns identity, edit, and stewardship; Field owns public read and discovery.**

| Concern | Owner |
|---------|--------|
| Profile edit, bio, links, presence toggles | **Studio** (`/studio/account`) |
| Register, verify, represent, claim, provenance | **Studio** workflows (CTAs from Field) |
| Authenticated home / workspace | **Studio** (`/studio/*` — Phase 1 canonical) |
| Public browse chrome | **Field** — **no Studio workspace sidebar** (ADR-28-C) |
| Signed-in user on Field | Lightweight **header** + sign-in/account entry to Studio — **not** role nav shell |

Phase 1 Studio routes and auth guard **unchanged**. Field adds **parallel public routes** — does not subsume Studio.

### Rationale

Three-layer architecture (Blueprint): conflating Studio chrome on Field broke layer semantics (Phase 1 `SignedInCatalogueShellLayout` on `/registry`). Separating chrome makes Field anonymous-first and prevents duplicate nav truth.

### Future review trigger

- Phase 2C Studio inbox and programmes → review cross-links from Field apply CTAs.
- User research shows header-only auth insufficient → **do not** restore full sidebar without unlock; consider Field-specific account menu only.

---

## 7. URL philosophy

### Decision

**One public Field namespace for 2A** — single canonical URL per resource; **permanent 301 redirects** from legacy paths; **`registry_id` and slugs stable.**

| Resource | Canonical |
|----------|-----------|
| Explorer hub | `/field/explorer` |
| Record Explorer | `/field/explorer/records` |
| Creative Explorer | `/field/explorer/creatives` |
| Organisation Explorer | `/field/explorer/organisations` |
| Field Record | `/field/record/[registry_id]` |
| Field Verify | `/field/verify/[registry_id]` |
| Creative profile | `/field/creative/[slug]` |
| Organisation profile | `/field/organisation/[slug]` |
| Collector profile | `/field/collector/[slug]` |

**Redirect policy:** Minimum **301 for two release cycles**; **prefer permanent 301** for `registry_id`-stable record paths (ADR-29). **Dual canonical URLs rejected** — `/registry` is not co-canonical with `/field/explorer` (ADR-27-A).

**Unchanged in 2A:** `/studio/*`, exact `/collector-studio` → dashboard, collector artwork/claim/provenance flows, `/api/*`, auth routes.

### Rationale

Clean three-surface story for users and SEO. Stable identifiers protect shared links and press coverage. Big-bang redirect acceptable because `registry_id` preserves record identity.

### Future review trigger

- `/certificate/[id]` traffic analysis → optional 2A.1 redirect (ADR-32).
- Phase 2C new routes (`/field/open-calls`, etc.) → extend redirect matrix document.
- External embed/oEmbed programme (Blueprint §6.3) → URL policy for iframe targets.

---

## 8. Search philosophy

### Decision

**Phase 2A search is filter- and facet-based only — not algorithmic discovery.**

| Surface | 2A search capability |
|---------|---------------------|
| Record Explorer | Preserve existing list query behaviour (verification filter, sort, pagination, title/`registry_id` query if already supported) |
| Creative Explorer | Pagination; optional name filter — **no discipline filter** |
| Organisation Explorer | Pagination; **verified-only toggle**; optional location text |

**Full-text search** across bios and rich metadata → **Phase 2B** (ADR-18). **Recommendations, similarity, match scores** → **excluded** (ADR-19, ADR-20).

### Rationale

2A delivers migration and connected browse without investing in search infrastructure. Explainable filters align with anti–black-box matching stance. Existing registry list query avoids regression while deferring FTS.

### Future review trigger

- Record volume or support burden → Phase 2B FTS decision (managed index vs Postgres).
- Phase 2C open calls volume → brief-specific filters (separate from 2A explorer).
- Founder requests “suggested Creatives” → ADR-20 unlock required.

---

## 9. Reputation philosophy

### Decision

**Reputation on Field is derived from Registry truth and factual attribution — not social performance.**

| Allowed in 2A | Forbidden in 2A |
|---------------|-----------------|
| Verification status, cert status, continuity | Follower / following counts |
| Participation layers (confirmed events) | Likes, hearts, star ratings |
| Org verified badge | Influence or engagement scores |
| Factual work counts on profiles | Pay-to-boost placement |
| Representation on file indicators | Field team role shown as registry authorship |
| Collector custody / claim context | NFT / token reputation badges |

**Org commission history** on public profile: **opt-in factual listing** in later phase (ADR-15-B) — **not required in 2A**. **Sort orders:** alphabetical or neutral recency — **not** popularity or payment tier.

### Rationale

Blueprint guardrails against social network and engagement monetisation. 2A establishes discovery without creating alternate reputation economy. Dual credit layer (Field team vs Registry authorship) reserved for 2D — ADR-14-B philosophy adopted early to prevent 2A shortcuts.

### Future review trigger

- Phase 2D production credits on project pages → implement ADR-14 dual-layer display rules.
- Org requests public “commission portfolio” → ADR-15 opt-in spec.
- Any feature introducing numeric “score” for participants → founder unlock + ADR-17 review.

---

## 10. Explicit anti-features

### Decision

The following are **frozen exclusions for Phase 2A** — implementation must **not** ship them, including “placeholder” or “coming soon” production UI:

| Anti-feature | Status |
|--------------|--------|
| Applications to briefs | **Excluded** → 2C |
| Briefs, programmes, open calls | **Excluded** → 2C |
| Commissions, projects, teams, milestones | **Excluded** → 2C–2D |
| Messaging / DMs | **Excluded** |
| Recommendation feeds / “for you” | **Excluded** |
| Marketplace listings / sale UX | **Excluded** → 2E / ADR-25 |
| Production workflows | **Excluded** → 2D |
| Payments / checkout on Field | **Excluded** |
| Practice-type taxonomy editor | **Excluded** → 2B |
| Full-text search engine | **Excluded** → 2B |
| Social follow graph | **Excluded** — permanent guardrail unless Blueprint amended |
| Pay-to-rank discovery | **Excluded** — permanent guardrail |
| Field ledger writes | **Excluded** — permanent guardrail |
| Studio sidebar on Field public routes | **Excluded** — 2A chrome rule |

**Placeholder rule:** No navigation items, CTAs, or empty states that imply the above features are available in 2A.

### Rationale

Scope containment for first Field release. Prevents engineering and design drift into Opportunity network before ADRs 01–12 are decided for 2C. Anti-features encode Blueprint non-expansion list (§1.3, §6.4).

### Future review trigger

- Each excluded capability unlocks only via **Phase 2 sub-spec** (2B, 2C, 2D, 2E) + governance unlock — not piecemeal in 2A patches.
- Marketplace ADR-25 founder decision → may add Field: Commerce or sunset listing — not before 2E planning.
- If product pressure adds “Apply” CTA without briefs → **reject** or defer to 2C spec lock.

---

## Freeze attestation

| Field | Value |
|-------|--------|
| **Frozen decisions** | §1–§10 above |
| **Supersedes** | PENDING status on ADR-13, 15, 17, 27–32 for Phase 2A scope |
| **Implementation authority** | [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) AC-* criteria |
| **Unlock** | Founder + product + engineering lead; documented delta; version bump (e.g. 2A founder freeze v1.1) |

**Statement:**

> Phase 2A founder decisions are **frozen** as of 31 May 2026. Implementation of The Field Foundations may proceed against the 2A spec without re-litigating §1–§10 unless this document is unlocked.

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) | Acceptance criteria |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | Full ADR catalogue |
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Phase 2 architecture |
| [phase-1-freeze.md](./phase-1-freeze.md) | Phase 1 boundary |
| [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) | Document registry |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | FROZEN | Initial Phase 2A founder decisions freeze |
