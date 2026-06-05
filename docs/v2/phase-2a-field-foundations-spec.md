# Phase 2A Implementation Specification — The Field Foundations

**Document status:** LOCKED DRAFT  
**Effective:** 31 May 2026  
**Authority:** [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT), [Phase 1 Scope Freeze](./phase-1-freeze.md) (FROZEN), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED)  
**Predecessor release:** Phase 1 Studio Foundation — `checkpoint-phase1-production`  
**Document type:** Product specification only — **no database schema, no UI design, no implementation tasks**

---

## Purpose

Define the **first implementation release of The Field** (Phase 2A): public discovery surfaces that let anyone **find Creatives and Organisations**, understand **practice and credentials**, and **navigate into Registry records** with clear trust signals.

Phase 2A establishes The Field as a **third product surface** (with Studio and Registry) through canonical URLs, information architecture, and read-only public experiences. It **does not** introduce production orchestration, opportunities, or commerce.

**North-star outcome for 2A:**

> A user can discover a Creative, understand their practice, trust their credentials, and navigate into Registry records.

---

## LOCKED DRAFT — change control

| Rule | Detail |
|------|--------|
| **LOCKED DRAFT** | Scope and acceptance criteria in this document are **fixed for planning and review**. Engineering may not expand scope without unlock. |
| **Promotion** | Becomes **LOCKED** after founder resolves ADR 27–32 (and related 13, 15, 17) as **DECIDED** and signs 2A acceptance. |
| **Unlock** | Explicit product + engineering lead approval; documented delta; version bump (2A.1, etc.). |
| **Registry rule** | Zero ledger semantic change; Field reads Registry truth only. |
| **ADR defaults** | Where ADRs are PENDING, this spec adopts **ADR recommendations** as provisional requirements until founder decision overrides. |

---

## Scope summary

| In scope (2A) | Out of scope (2A) |
|---------------|-------------------|
| Public Creative, Organisation, Collector profiles (Field namespace) | Applications, briefs, programmes, commissions |
| Creative Explorer, Organisation Explorer, Record Explorer | Messaging, recommendations, matching engines |
| Verification visibility on profiles and records | Marketplace, payments, production workflows |
| Profile ↔ Record navigation | Practice-type taxonomy editor (2B) |
| Field IA, canonical URLs, redirects | Open calls, inbox, team/project objects |
| Filter-based search (no full-text requirement in 2A) | Field Opportunity network (2C+) |

---

## 1. Public Creative Profiles

### 1.1 Definition

A **Field Creative Profile** is the public read projection of an `artist` identity — discoverable without authentication when the Creative has enabled public presence.

### 1.2 Canonical URL

| Canonical | Legacy redirect |
|-----------|-----------------|
| `/field/creative/[slug]` | `/artist/[slug]` |

`[slug]` is the existing artist slug; no public identifier change in 2A.

### 1.3 Visibility rules

| Condition | Public access |
|-----------|---------------|
| `public_presence.profile` enabled | Profile visible at Field URL |
| Profile disabled | 404 for anonymous; owner may preview via Studio (Studio route unchanged) |
| Owner viewing own disabled profile | Studio account settings — not a Field requirement beyond existing behaviour |

### 1.4 Required content (product)

| Block | Source of truth | Field behaviour |
|-------|-----------------|-----------------|
| Display name | Studio / `artists` | Primary headline |
| Bio | Studio | Practice narrative — “understand their practice” |
| External links | Studio (website, social) | Optional; same visibility rules as today |
| Representation / participation layers | Registry RPCs (read) | Trust credentials — representation on file, institution participation |
| Linked Organisation | Registry / roster | When represented — link to Organisation profile |
| Registry footprint | `artwork_read_model` (read) | Paginated list of public works; link each to Field Record |
| Verification summary | Per-work and aggregate | Count or filter of verified works — not a vanity score |

### 1.5 Explicitly not on Creative profile (2A)

- Practice type / discipline tags (2B)
- Application CTAs, brief links, inbox
- Follower counts, likes, endorsements
- Direct messaging
- Editable fields (edit in Studio only)

### 1.6 Acceptance criteria (AC-FC*)

| ID | Criterion |
|----|-----------|
| AC-FC1 | Public Creative profile renders at `/field/creative/[slug]` when presence enabled |
| AC-FC2 | Legacy `/artist/[slug]` 301 redirects to canonical Field URL |
| AC-FC3 | Participation and representation signals visible when data exists (read-only) |
| AC-FC4 | Each listed work links to `/field/record/[registry_id]` |
| AC-FC5 | No Studio workspace sidebar on public profile |

---

## 2. Public Organisation Profiles

### 2.1 Definition

A **Field Organisation Profile** is the public read projection of a `gallery` (Organisation) — programmes, roster, and catalogue footprint for discovery.

### 2.2 Canonical URL

| Canonical | Legacy redirect |
|-----------|-----------------|
| `/field/organisation/[slug]` | `/institutional-studio/[slug]`, `/gallery/[slug]` |

### 2.3 Visibility rules

| Condition | Public access |
|-----------|---------------|
| `public_presence.profile` enabled | Profile visible |
| Profile disabled | 404 for anonymous |

### 2.4 Required content (product)

| Block | Source | Field behaviour |
|-------|--------|-----------------|
| Organisation name | `galleries` | Headline — public label **Organisation** |
| Location, description, website | Studio-sourced | When presence flags allow |
| **Verified badge** | `galleries.verified` | Prominent trust signal (ADR-15) |
| Subscription tier | Internal | **Not** displayed as reputation rank in 2A |
| Roster | `artists` linked to gallery | Links to Field Creative profiles when public |
| Catalogue / works | `artwork_read_model` | Verified works emphasis; links to Field Record |
| Stats | Derived counts | Artists, works, verified works — factual, not scored |

### 2.5 Presence flags (preserve existing model)

Organisation controls visibility of roster and ownership-related sections via existing `public_presence` flags — Field respects the same gates as legacy public gallery page.

### 2.6 Acceptance criteria (AC-FO*)

| ID | Criterion |
|----|-----------|
| AC-FO1 | Organisation profile at `/field/organisation/[slug]` when presence enabled |
| AC-FO2 | Legacy institutional/gallery public URLs 301 to canonical |
| AC-FO3 | Verified badge displayed when `verified=true` |
| AC-FO4 | Roster entries link to Field Creative profiles when those Creatives are public |
| AC-FO5 | Works link to Field Record |

---

## 3. Public Collector Profiles (limited)

### 3.1 Definition

A **Field Collector Profile** is a **limited** public projection — custody and collection narrative, not production or commissioning.

### 3.2 Canonical URL

| Canonical | Legacy redirect |
|-----------|-----------------|
| `/field/collector/[slug]` | `/collector-studio/[slug]` |

**Note:** `/collector-studio` (exact) remains Studio dashboard redirect to `/studio/collector` (Phase 1). Only **`/collector-studio/[slug]`** public catalogue migrates to Field.

### 3.3 Limited scope (2A)

| Included | Excluded |
|----------|----------|
| Public collection name / bio when enabled | Patron briefs, commissioning |
| Public works the collector chooses to show | Full vault |
| Links to Field Record for owned/archived works | Production reputation |
| Claim ownership / provenance CTAs (link to existing flows) | Marketplace listings |

### 3.4 Anonymity

When collector has chosen anonymous public presence (existing Studio setting), Field profile respects anonymity — no identifying narrative beyond collection structure where policy allows.

### 3.5 Acceptance criteria (AC-FK*)

| ID | Criterion |
|----|-----------|
| AC-FK1 | Collector public profile at `/field/collector/[slug]` when enabled |
| AC-FK2 | Legacy `/collector-studio/[slug]` 301 to canonical |
| AC-FK3 | No commissioning, patron, or marketplace surfaces |
| AC-FK4 | Custody CTAs route to existing claim/provenance flows (URLs may remain legacy until future PR) |

---

## 4. Creative Explorer

### 4.1 Definition

**Creative Explorer** is a public index for **discovering Creatives** — browse and filter profiles, not individual records as primary unit.

### 4.2 Canonical URL

| Route | Purpose |
|-------|---------|
| `/field/explorer/creatives` | Creative Explorer index |

*(Alternative single-hub IA: Creative Explorer as tab/mode on `/field/explorer` — see §8.)*

### 4.3 Index content

| Element | Rule |
|---------|------|
| Listing unit | Public Creative profile card |
| Inclusion | Only Creatives with `public_presence.profile` enabled |
| Card fields | Name, slug link, optional bio excerpt, verified work count, representation hint |
| Sort default | Alphabetical or recently active (product pick at design — **not** popularity score) |
| Pagination | Required |

### 4.4 Relationship to Record Explorer

Creative Explorer answers **“who”**; Record Explorer answers **“what work”**. Cross-links: Creative card → profile; profile → records.

### 4.5 Acceptance criteria (AC-XC*)

| ID | Criterion |
|----|-----------|
| AC-XC1 | Anonymous user can browse public Creatives without auth |
| AC-XC2 | Each entry links to `/field/creative/[slug]` |
| AC-XC3 | No recommendation feed or “suggested for you” |

---

## 5. Organisation Explorer

### 5.1 Definition

**Organisation Explorer** is a public index for **discovering Organisations** — browse verified and public org profiles.

### 5.2 Canonical URL

| Route | Purpose |
|-------|---------|
| `/field/explorer/organisations` | Organisation Explorer index |

### 5.3 Index content

| Element | Rule |
|---------|------|
| Listing unit | Public Organisation profile card |
| Inclusion | `public_presence.profile` enabled |
| Card fields | Name, location (if public), verified badge, roster/work counts |
| Filter (2A) | Verified-only toggle (optional default off) |
| Sort default | Alphabetical — **not** paid rank |

### 5.4 Acceptance criteria (AC-XO*)

| ID | Criterion |
|----|-----------|
| AC-XO1 | Anonymous browse of public Organisations |
| AC-XO2 | Each entry links to `/field/organisation/[slug]` |
| AC-XO3 | Verified filter works without implying unverified orgs are hidden by default |

---

## 6. Verification visibility

### 6.1 Trust hierarchy (ADR-13, ADR-17 — locked for 2A)

On Field surfaces, trust signals appear in this **priority order**:

1. **Record verification status** (verified / unverified / pending)
2. **Certificate public status** (when available via existing RPC)
3. **Provenance / continuity summary** (on Field Record)
4. **Participation chronology** (authorship, institution filing — confirmed events only)
5. **Organisation verified badge** (on org profile and org-attributed records)

### 6.2 Field Record page

| Signal | Visibility |
|--------|------------|
| Verification status band | Public |
| Registry ID (mono) | Public |
| Certificate status | Public via verify path |
| Full certificate document | Authenticated only (ADR-32-A) |
| Dispute flags | Public when policy marks visible |

### 6.3 Profile-level verification

| Surface | Signal |
|---------|--------|
| Creative profile | Per-work verification; optional “N verified works” factual count |
| Organisation profile | Org verified badge; verified work count in catalogue |
| Collector profile | Ownership claim status on works — not org-style verification |

### 6.4 Excluded signals (2A)

- Star ratings, likes, follower counts
- Field production completion badges (no commissions in 2A)
- Pay-to-boost placement
- NFT/token badges

### 6.4 Acceptance criteria (AC-FV*)

| ID | Criterion |
|----|-----------|
| AC-FV1 | Field Record displays verification status before secondary metadata |
| AC-FV2 | `/field/verify/[registry_id]` public verify path available |
| AC-FV3 | Copy uses “Registry record” / “Registry ID” alongside Field surface branding (ADR-31-A) |
| AC-FV4 | No excluded reputation signals present |

---

## 7. Registry → Field profile connections

### 7.1 Navigation graph (required links)

```
Field Record ──→ Creative profile (artist link)
              ──→ Organisation profile (institution / verifier link when public)
              ──→ Collector profile (current public owner when collector public catalogue)

Field Creative profile ──→ Field Records (works list)
Field Organisation profile ──→ Creatives (roster) ──→ Records
Field Collector profile ──→ Field Records (collection)

Creative Explorer ──→ Creative profile ──→ Records
Organisation Explorer ──→ Organisation profile ──→ Records
Record Explorer ──→ Record ──→ profiles
```

### 7.2 Record Explorer (works index)

| Canonical | Legacy |
|-----------|--------|
| `/field/explorer/records` | `/registry` |

Record Explorer preserves existing registry list behaviour (filters, pagination, verified emphasis) under Field namespace and chrome rules.

**Hub option:** `/field/explorer` defaults to Record Explorer with navigation to Creative and Organisation explorers (see §8).

### 7.3 Field Record (single work)

| Canonical | Legacy |
|-----------|--------|
| `/field/record/[registry_id]` | `/registry/[registry_id]`, `/artwork/[registry_id]` |

### 7.4 Broken / private link behaviour

| Case | Behaviour |
|------|-----------|
| Linked profile not public | Omit link or show neutral “Profile private” — do not leak existence beyond policy today |
| Record unlisted | Existing registry visibility rules unchanged |
| Missing slug | No orphan URLs in sitemap |

### 7.5 Acceptance criteria (AC-FL*)

| ID | Criterion |
|----|-----------|
| AC-FL1 | Field Record links to public Creative when artist has public profile |
| AC-FL2 | Field Record links to public Organisation when verifier/filed-by org is public |
| AC-FL3 | Record Explorer, profiles, and explorers form a connected browse graph |
| AC-FL4 | All record links use `/field/record/[registry_id]` |

---

## 8. The Field information architecture

### 8.1 Surface model

```
The Field (public)
├── Explorer hub          /field/explorer          → records (default)
│   ├── Record Explorer   /field/explorer/records   (alias: hub default)
│   ├── Creative Explorer /field/explorer/creatives
│   └── Organisation Explorer /field/explorer/organisations
├── Field Record          /field/record/[registry_id]
├── Field Verify          /field/verify/[registry_id]
├── Creative profile      /field/creative/[slug]
├── Organisation profile  /field/organisation/[slug]
└── Collector profile     /field/collector/[slug]   (limited)
```

### 8.2 Global chrome (ADR-28-C)

| Element | Rule |
|---------|------|
| Header | Lightweight marketing/workspace header — **no Studio sidebar** |
| Auth session | Header shows sign-in / account entry → Studio |
| Surface label | “The Field” in nav where surface name shown |
| Studio link | Clear path to `/studio/*` for authenticated stewards |
| Footer | Marketing/legal consistent with landing |

### 8.3 Layer boundaries on Field routes

| Allowed | Forbidden on Field public routes |
|---------|----------------------------------|
| Read Registry data | Studio workspace shell |
| CTAs to Studio/Registry actions | Personal archive mutation UI |
| Personal archive “save” CTA (auth) | Account settings |
| i18n public copy | Opportunity/brief UI |

### 8.4 Marketing integration

Landing and header “Registry” / “The Field” links target Field Explorer canonical URLs post-2A.

---

## 9. Canonical URL structure

### 9.1 Complete 2A canonical map

| Purpose | Canonical URL |
|---------|---------------|
| Explorer hub (records default) | `/field/explorer` |
| Record Explorer | `/field/explorer/records` |
| Creative Explorer | `/field/explorer/creatives` |
| Organisation Explorer | `/field/explorer/organisations` |
| Field Record | `/field/record/[registry_id]` |
| Field Verify | `/field/verify/[registry_id]` |
| Creative profile | `/field/creative/[slug]` |
| Organisation profile | `/field/organisation/[slug]` |
| Collector profile | `/field/collector/[slug]` |

### 9.2 Redirects (301, ADR-29)

| From | To |
|------|-----|
| `/registry` | `/field/explorer` or `/field/explorer/records` |
| `/registry/[id]` | `/field/record/[id]` |
| `/artwork/[id]` | `/field/record/[id]` |
| `/verify/[id]` | `/field/verify/[id]` |
| `/artist/[slug]` | `/field/creative/[slug]` |
| `/institutional-studio/[slug]` | `/field/organisation/[slug]` |
| `/gallery/[slug]` | `/field/organisation/[slug]` |
| `/collector-studio/[slug]` | `/field/collector/[slug]` |

### 9.3 Explicitly unchanged URLs (2A)

| Path | Reason |
|------|--------|
| `/studio/*` | Studio namespace (Phase 1) |
| `/collector-studio` (exact) | Dashboard → `/studio/collector` |
| `/collector-studio/artwork/*`, claim, provenance flows | Transitional collector workflows |
| `/login`, `/signup`, `/onboarding` | Auth |
| `/api/*` | No API namespace migration in 2A |
| `/certificate/[id]` | Optional redirect in 2A.1 if analytics warrant (ADR-32) |

### 9.4 Redirect retention

Minimum **two release cycles**; **prefer permanent 301** for `registry_id`-stable paths.

---

## 10. Search and filter requirements

### 10.1 Phase 2A approach (ADR-18-A)

**Filter and facet search only** — no full-text search engine requirement in 2A.

### 10.2 Record Explorer filters (preserve + Field copy)

| Filter | Required in 2A |
|--------|----------------|
| Verification status | Yes |
| Text query on title / registry_id (existing list query) | Yes — if already on `/registry` |
| Sort (existing registry sort) | Yes |
| Pagination | Yes |

*Note: If current registry supports query param search, carry forward; do not require new Algolia/FTS in 2A.*

### 10.3 Creative Explorer filters (minimal 2A)

| Filter | Required |
|--------|----------|
| Text filter on name | Optional |
| Pagination | Yes |

Discipline/practice filters → **2B**.

### 10.4 Organisation Explorer filters

| Filter | Required |
|--------|----------|
| Verified-only toggle | Yes |
| Location text (if present in data) | Optional |
| Pagination | Yes |

### 10.5 Excluded (2A)

- Recommendation engine
- “Similar Creatives”
- Geo map search
- Full-text across bio fields (2B candidate)

### 10.6 Acceptance criteria (AC-FS*)

| ID | Criterion |
|----|-----------|
| AC-FS1 | Record Explorer supports verification filter |
| AC-FS2 | All explorers paginate |
| AC-FS3 | No recommendation or match-score UI |

---

## 11. Permissions model

### 11.1 Anonymous public

| Action | Allowed |
|--------|---------|
| Browse explorers and public profiles | Yes |
| View Field Record and public verify | Yes |
| View verification/trust bands | Yes |
| Save to archive | No — requires auth CTA to Studio |
| Mutate any data | No |

### 11.2 Authenticated participant

| Action | Where |
|--------|-------|
| View same public surfaces | Field — **without Studio sidebar** (ADR-28-C) |
| Save record to archive | CTA → Studio/API (existing) |
| Register, claim, verify workflows | CTA → Studio or existing flow URLs |
| Edit profile | Studio account only — not on Field |

### 11.3 Profile owner preview

Owner may view disabled profile through Studio; Field URL remains 404 for anonymous.

### 11.4 Organisation staff

No new Field permissions in 2A — publishing, verify, register remain Studio/Registry capabilities.

### 11.5 Ops / admin

`/admin`, `/internal/*` unchanged — not part of Field product surface.

### 11.6 Data access principle

Field surfaces use **read-only** access to existing views/RPCs/public RLS — no new ledger write paths.

### 11.7 Acceptance criteria (AC-FP*)

| ID | Criterion |
|----|-----------|
| AC-FP1 | Anonymous can complete discover → profile → record journey |
| AC-FP2 | Authenticated user on Field does not see Studio workspace sidebar |
| AC-FP3 | No Field route grants ledger mutation without existing Studio/Registry flow |

---

## 12. Migration impacts

### 12.1 Product migration (user-visible)

| Impact | Mitigation |
|--------|------------|
| Bookmarked `/registry` URLs | 301 to Field explorer |
| Shared record links | 301; `registry_id` unchanged |
| SEO / external press links | 301 map documented |
| Signed-in browse UX change | No sidebar — comms in release notes |
| Email templates with old URLs | Audit and update (product ops checklist) |

### 12.2 Participant impact

| Cohort | Impact |
|--------|--------|
| Creatives with public profiles | Public URL changes; Studio “view public page” links update |
| Organisations | Same |
| Collectors with public catalogues | Same |
| Anonymous users | Stronger Field branding |

### 12.3 Phase 1 assets preserved

| Asset | Impact |
|-------|--------|
| Studio routes | Unchanged |
| Registry RPCs / APIs | Unchanged |
| Phase 1 terminology (Creative/Organisation/Collector) | Extended to Field public copy |
| Personal archive | Unchanged; CTAs from Field |

### 12.4 Documentation migration

| Document | Action post-2A |
|----------|----------------|
| `phase-1-freeze.md` | Still valid; Field was out of scope |
| Marketing / about copy | Update links to `/field/*` |
| `phase-1-route-migration-matrix.md` | Supplement with Field redirect matrix (future frozen doc) |

### 12.5 Checkpoint recommendation

Tag **`checkpoint-phase2a-field-foundations`** after acceptance criteria pass — not part of Phase 1 checkpoint ancestry.

### 12.6 Acceptance criteria (AC-FM*)

| ID | Criterion |
|----|-----------|
| AC-FM1 | All §9.2 redirects active in production |
| AC-FM2 | No broken links in header/footer to old `/registry` as primary |
| AC-FM3 | Registry ledger behaviour unchanged (RP smoke subset on prod) |

---

## 13. Success metrics

### 13.1 Primary (2A launch)

| Metric | Target (directional) |
|--------|----------------------|
| **Discovery completion rate** | Anonymous sessions reaching a Field Record from a Creative or Organisation profile |
| **Redirect success** | <0.1% 404 on legacy registry/profile URLs post-301 |
| **Trust comprehension** | Qualitative QA: users identify verification status on Field Record (moderated test) |

### 13.2 Secondary

| Metric | Notes |
|--------|-------|
| Explorer → profile click-through | Creative and Organisation explorers |
| Profile → record click-through | Footprint engagement |
| Auth CTA conversion | Sign-in from Field — informational only in 2A |
| Bounce on Field vs legacy | Compare `/field/explorer` vs historical baseline |

### 13.3 Guardrail metrics

| Metric | Threshold |
|--------|-------------|
| Registry registration success rate | No regression vs pre-2A |
| Verify RPC errors | No increase |
| Studio session entry | No drop indicating navigation confusion |

### 13.4 Not measured in 2A

- Brief applications (excluded)
- Commission conversion (excluded)
- Recommendation engagement (excluded)

---

## 14. Explicit exclusions

The following are **out of scope for Phase 2A** and must not appear in 2A implementation:

| Exclusion | Deferred to |
|-----------|-------------|
| **Applications** | 2C |
| **Briefs** | 2C |
| **Programmes** | 2C |
| **Commissions** | 2C–2D |
| **Messaging** | Not planned as social DMs; inbox transactional in 2C |
| **Recommendations** | 2C+ at earliest; ADR-20 default none |
| **Marketplace** | 2E / ADR-25 decision |
| **Production workflows** | 2D |
| **Payments** | Subscription productisation parallel; no Field payments in 2A |
| **Open calls routes** | 2C (`/field/open-calls`) |
| **Creative inbox / org programmes Studio** | 2C |
| **Practice type taxonomy UI** | 2B |
| **Full-text search** | 2B |
| **Field team / credits** | 2D |
| **Patron commissions** | 2E |
| **Database schema changes for Field objects** | 2C+ |
| **`/api/field/*` namespace** | Optional BFF — not required for 2A read migration |
| **Removing `/api/*` legacy paths** | Future |

---

## Acceptance gate summary

Phase 2A is **complete** when:

1. All acceptance criteria **AC-FC, AC-FO, AC-FK, AC-XC, AC-XO, AC-FV, AC-FL, AC-FS, AC-FP, AC-FM** pass on production or staging sign-off environment.
2. ADR 27–32 marked **DECIDED** or accepted as specified in this document.
3. Redirect matrix §9.2 verified.
4. Phase 1 Registry preservation: RP-10, RP-11, RP-12 manual/automated pass; no ledger regression.
5. Founder/product sign-off on LOCKED DRAFT → **LOCKED** promotion.

---

## Dependencies

| Dependency | Status |
|------------|--------|
| Phase 1 production certification | Complete |
| P0 migrations on production | Applied |
| ADR founder decisions (27–32) | Required before LOCKED promotion |
| Post-certification harness remediation | Parallel — not blocking 2A read migration |

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2-the-field-blueprint.md](./phase-2-the-field-blueprint.md) | Parent phase architecture |
| [phase-2-architecture-decisions.md](./phase-2-architecture-decisions.md) | ADR source |
| [phase-1-freeze.md](./phase-1-freeze.md) | Phase 1 boundary |
| [product-language-freeze.md](./product-language-freeze.md) | Surface labels |
| [phase-1-route-migration-matrix.md](./phase-1-route-migration-matrix.md) | Prior redirect patterns |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1 | 31 May 2026 | LOCKED DRAFT | Initial 2A Field Foundations specification |
