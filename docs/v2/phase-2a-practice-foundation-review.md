# Phase 2A — Practice Foundation Review

**Document status:** IMPLEMENTATION REVIEW  
**Effective:** 31 May 2026  
**Branch context:** `pr/phase2a-field-pr1`  
**Authority:** [Phase 2A PR1 Plan](./phase-2a-pr1-field-foundation-plan.md) (IMPLEMENTATION SOURCE OF TRUTH), [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED)  
**Scope:** Audit and design recommendation only — **no implementation, no migrations, no code changes** in this review.

---

## Executive summary

**Practice does not exist today as structured data.** The platform stores Creative identity (name, bio, links), visibility toggles (`public_presence`), and Registry footprint (works, verification, representation) — but there is **no practice taxonomy, no multi-select discipline field, and no explorer filter surface** for how a Creative works.

The closest proxies are:

| Proxy | What it captures | Why it is not Practice |
|-------|------------------|------------------------|
| **`artists.bio`** | Unstructured practice narrative | Not searchable, not filterable, not normalized |
| **`artworks.medium`** | Per-record material/technique | Work metadata — not participant discipline |
| **`actor_profiles.role = 'artist'`** | Account type | One role per user — contradicts multi-practice model |
| **Derived trust tiers** (`ArtistTierBadge`) | Invite + visibility + disputes | Trust signal — not discipline |
| **Marketing “capabilities” copy** | Landing-page UX only | Not persisted; not on profiles |

**Recommendation:** Introduce Practice as a **normalized lookup + M:N link** on `artists` (Blueprint §2 direction), editable in **Studio account**, readable on **Field Creative Presence**, filterable in **Creative Explorer** — but **defer all implementation until after PR1C** (Creative Explorer foundation), aligning with Phase **2B Discovery enrichment** per frozen 2A exclusions.

---

## 1. Current state assessment

### 1.1 Existing fields — `public.artists`

The Creative row (`artists.id` = `auth.users.id`) is the Field presence source of truth. Columns observed in migrations and application code:

| Column | Type / shape | Used on Field today? | Relevance to Practice |
|--------|--------------|----------------------|------------------------|
| `id` | uuid (PK) | Internal | Identity anchor |
| `slug` | text | Yes — URL key | — |
| `display_name` | text | Yes — headline | Identity |
| `full_name` | text | Rarely on public surfaces | Legal / onboarding |
| `bio` | text | Yes — practice narrative | **Unstructured proxy only** |
| `website` | text | Yes | External link |
| `instagram` | text | Yes | External link |
| `verification_status` | enum/text | Yes — participation layer | Verification, not Practice |
| `public_presence` | jsonb | Yes — visibility gate | See §1.4 |
| `gallery_id` | uuid FK | Yes — org section | Organisation link |
| `represented_by_gallery` | boolean | RPC-derived context | Representation |
| `shown_on_institutional_public` | boolean | Org roster visibility | Not Practice |
| `studio_artworks_accent` | enum | Studio UI only | Not public |
| `is_test` / `is_admin` | boolean | Ops | Not public |

**No column** named `practice`, `practices`, `discipline`, `practice_types`, or similar exists on `artists`.

### 1.2 Existing fields — `public.actor_profiles`

| Column | Relevance |
|--------|-----------|
| `role` | Single value: `artist` \| `gallery` \| `collector` — **account type**, not practice |
| `display_name` | Fallback display; mirrored on participant tables |
| `onboarding_complete` | Flow gate |
| `public_presence` | jsonb on actor row; **artist/gallery/collector rows also carry their own `public_presence`** — account page writes to participant table |

Onboarding (`complete_onboarding_artist`) collects: full name, display name, bio. **No practice selection step.**

### 1.3 Existing profile metadata — Studio account

**Edit surface:** `/studio/account` → `AccountProfileSection` + `AccountVisibilitySection`.

| Creative-editable field | Storage | Public projection |
|-----------------------|---------|-------------------|
| Display name | `artists.display_name` | Field headline |
| Biography | `artists.bio` | Field body copy |
| Website / Instagram | `artists.website`, `artists.instagram` | Field links |
| Studio artworks accent | `artists.studio_artworks_accent` | Not on Field |
| Public visibility toggles | `artists.public_presence` | Gates Field sections |

**Account sections today:** Profile · Public visibility · Studio preferences · Privacy & data.  
**No “Practice” or “Disciplines” section exists.**

### 1.4 Existing public presence fields

`public_presence` jsonb schema (shared across `artists`, `galleries`, `collector_profiles`, `actor_profiles`):

```json
{
  "profile": true,
  "ownership": true,
  "values": true,
  "location": true
}
```

Parsed in `lib/public-presence.ts` as `PublicPresence`:

| Key | Meaning on Field |
|-----|------------------|
| `profile` | Master gate — profile 404 when false |
| `ownership` | Show ownership / org representation context |
| `values` | Show declared values on collection surfaces |
| `location` | Show location (collector/org; limited on Creative today) |

**No `practices` visibility flag.** Founder freeze §1 notes a **future review trigger** for “discipline visibility, geo” when Phase 2B practice-aware discovery ships.

### 1.5 Existing tags / categories / taxonomies

| Mechanism | Scope | Practice overlap? |
|-----------|-------|-------------------|
| **`artworks.medium`** | Per Registry record | Material/technique on a **work** — e.g. “Oil on canvas”, “Archival pigment print”. Not participant discipline. |
| **`artworks.verification_status`** | Per record | Trust — not taxonomy |
| **`galleries.verified`** | Organisation | Trust badge |
| **`collector_vault_items.category`** | Collector private vault | Unrelated document categories |
| **`ArtistTierBadge` / `getArtistTier()`** | Derived invite + opt-in tier | Roster trust pill — not discipline |
| **Landing `PortfolioManagementSection.capabilities`** | Marketing UI | Hard-coded role cards — **not stored** |
| **Blueprint reserved tables** | Not in repo | `practice_types`, `creative_practices`, `cultural_sectors`, `creative_capabilities` — **documented only** |

**Conclusion:** There is **zero normalized Practice taxonomy** in the database or application layer.

### 1.6 Field Creative Presence today (post-PR1B)

`/field/creative/[slug]` renders:

1. Identity — display name  
2. Verification — `ParticipationLayersStrip` (representation, artist confirmation)  
3. Practice narrative — **bio only** (unstructured)  
4. External links — website, Instagram  
5. Organisation — when represented + `presence.ownership`  
6. Registry footprint — paginated works with verification badges  

**Practice as a discrete, multi-value, filterable concept is absent.**

### 1.7 Governance alignment

| Document | Practice stance |
|----------|-----------------|
| Phase 1 freeze | Practice object **explicitly out of scope** |
| Phase 2A spec §1.5 | Practice type / discipline tags → **2B** |
| Phase 2A PR1 plan §9.1 | Discipline filters on Creative Explorer → **2B** |
| Phase 2 Blueprint §Phase 2b | “Practice-aware profiles” + explorer discipline filters |
| Product Blueprint v1.1 §2 | Practice object definition + reserved schema |
| Founder freeze §1 | Richer metadata + optional `practices` presence flag → **2B review** |

---

## 2. Gap analysis

### 2.1 What is missing for Practice

| Gap | Detail |
|-----|--------|
| **Data model** | No lookup table, no M:N link table, no enum |
| **Studio edit UX** | No multi-select, no primary practice flag |
| **Public presence flag** | No `public_presence.practices` (or equivalent) |
| **Field display** | No practice chips/list on Creative Presence |
| **Explorer filter** | No `practice=` query param or facet UI |
| **API / RLS** | No CRUD path for practice assignments |
| **i18n labels** | No locale keys for practice names |
| **Matching hook** | No join path for brief `practices_needed[]` (2C) |
| **Search index** | No indexed column for explorer queries |

### 2.2 What is duplicated elsewhere

| Location | Duplication risk | Resolution |
|----------|------------------|------------|
| **`bio` text** | Creatives may describe practice in prose | Keep bio for narrative; Practice = structured discovery layer — **complementary, not replaced** |
| **`artworks.medium`** | Confusion with “Painting” vs medium “Oil on canvas” | Document boundary: **Practice = who/how you work; medium = record attribute** |
| **`actor_profiles.role`** | “artist” implies single discipline | Role stays account type; Practice is **many per Creative** |
| **Org roster tier badges** | Visual chips on gallery pages | Trust tier ≠ Practice — keep separate |
| **Blueprint Sector / Capability** | Overlapping discovery dimensions | Practice first; Sector (context) and Capability (skills tags) remain **separate layers** per Blueprint §2 |

### 2.3 What can be reused

| Asset | Reuse |
|-------|-------|
| **`artists` row + RLS** | M:N links via `artist_id` / `user_id` |
| **`public_presence` pattern** | Extend jsonb with `practices: boolean` for visibility gate |
| **`/studio/account` section model** | New `AccountPracticeSection` alongside Profile and Visibility |
| **`field-creative-presence.ts` loader** | Join practice labels in presence data fetch |
| **`ParticipationLayersStrip` chip styling** | Neutral read-only chips for practice labels on Field |
| **`RegistryListFilters` pattern** | Facet toggles / multi-select for explorer (2B) |
| **Blueprint seed list** | Initial `practice_types` rows (extend user examples) |
| **PR1B Creative Presence layout** | Insert practice row below identity, above bio |

---

## 3. Recommendation — Practice model

### 3.1 Definition (aligned with Blueprint v1.1 §2)

**Practice** = a declared **discipline through which a Creative works** — multi-valued, normalized, publicly projectable, and future-compatible with brief matching.

**Not:** account type, work medium, sector context, or capability skill tag.

### 3.2 Proposed schema (implementation phase — not in this review)

```
practice_types
  id            uuid PK
  slug          text UNIQUE     -- e.g. painting, film, scenography
  label         text            -- display: "Painting"
  sort_order    int             -- explorer facet order
  active        boolean         -- soft-deprecate without breaking links

creative_practices
  artist_id     uuid FK → artists(id) ON DELETE CASCADE
  practice_type_id uuid FK → practice_types(id)
  is_primary    boolean DEFAULT false
  created_at    timestamptz
  PRIMARY KEY (artist_id, practice_type_id)
```

**Constraints:**

- Max selections per Creative: **recommend 5** (product cap — prevents spam)
- At most **one** `is_primary = true` per artist
- Public read: anon SELECT on `practice_types` + join where `public_presence.practices !== false` and profile enabled

**Optional later (Phase 2B+ / 2C):**

- `cultural_sectors` + `creative_sectors` — brief context, not practice
- `creative_capabilities` — free-form tags; lower priority than Practice

### 3.3 Seed taxonomy (founder-approved starter set)

Map user examples to normalized slugs:

| Label | Slug | Notes |
|-------|------|-------|
| Painting | `painting` | Fine art |
| Sculpture | `sculpture` | |
| Photography | `photography` | |
| Film | `film` | Production pathway hook |
| Production | `production` | Distinct from Film for crew/production roles |
| Scenography | `scenography` | Spatial / stage |
| Public Art | `public-art` | |
| Architecture | `architecture` | |
| Research | `research` | |
| Writing | `writing` | |
| Performance | `performance` | |
| Curation | `curation` | |
| Creative Direction | `creative-direction` | |
| Placemaking | `placemaking` | |

Blueprint also seeds: filmmaker, production designer, set designer, fabricator, spatial designer — **merge into seed migration** to avoid duplicate near-synonyms (e.g. filmmaker ↔ film).

**Governance:** Taxonomy changes require lookup table migration or admin seed script — **not** user free-text (prevents explorer facet explosion and matching ambiguity).

### 3.4 Public presence extension

Add optional jsonb key on participant rows:

```json
{ "practices": true }
```

Default **`true`** when profile is public (practices visible if selected). When `false`, Field hides practice chips but Studio edit remains.

Aligns with founder freeze §1 future review trigger.

### 3.5 Anti-patterns (per frozen 2A anti-features)

- No follower counts, endorsements, or “top practice” ranking  
- No pay-to-boost practice visibility  
- No auto-inferred practice from artwork medium  
- No recommendation feed keyed on practice  

---

## A. Studio — where and how to edit

### A.1 Edit location

**Primary:** `/studio/account` — new subsection under **Profile** or dedicated **Practice** panel in account nav.

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Inside Profile section | Fewer nav items | Profile already dense | — |
| **Dedicated “Practice” account section** | Clear mental model; room for guidance copy | +1 nav item | **Preferred** |

**Secondary entry (optional):** Creative dashboard hero — “Add your practices” nudge when empty (Studio only, not Field).

**Not on Field:** Edit remains Studio-only per 2A permissions model.

### A.2 Edit UX (behavioural spec)

- **Multi-select** from searchable list (checkbox or chip picker)  
- **Primary practice** — single radio/ star among selected (defaults to first if unset)  
- Helper copy: “Practices describe how you work. They appear on your public Field profile and help others find you. They are not account types.”  
- Save via existing account save bar (same commit as profile/presence)  
- Validation: 0 practices allowed (empty state OK); max 5 enforced  

### A.3 Public presence settings

In **Account → Public visibility → Profile signals**, add toggle:

| Toggle | Key | Default |
|--------|-----|---------|
| Show practices on public profile | `public_presence.practices` | `true` |

Place **below** “Show profile publicly” — practices only render when profile is public AND toggle on AND ≥1 practice selected.

---

## B. Field Presence — display on Creative profile

### B.1 Placement (priority order compliance)

Insert **after identity headline, before or alongside verification strip**:

```
Creative (label)
Display name
[ Practice chips — primary first, then alphabetical ]
ParticipationLayersStrip (verification / representation)
Bio (practice narrative — unstructured)
Links
Organisation block
Registry footprint
```

### B.2 Visual treatment

- Read-only **neutral chips** (not trust-green like verification)  
- Primary practice: optional subtle “Primary” label or first position  
- No click-through filter on presence page in 2B v1 (filter lives on Explorer)  
- Hidden when: profile disabled, `practices` flag false, or zero selections  

### B.3 Empty states

| State | Field behaviour |
|-------|-----------------|
| No practices selected | Omit block — do not show “No practices listed” on public page |
| Practices hidden by toggle | Omit block |
| Owner views Studio | Prompt to add practices; Field unchanged |

---

## C. Explorer — Practice-driven filtering

### C.1 Scope timing

**Not in PR1C.** Creative Explorer PR1C delivers: public index, name `q` filter, pagination, alphabetical sort.

**Phase 2B** adds practice facets per spec §10.3 deferral and Blueprint Phase 2b.

### C.2 Filter behaviour (2B target)

| Param | Example | Behaviour |
|-------|---------|-----------|
| `practice` | `?practice=painting` | Creatives with that practice (AND with `public_presence.profile`) |
| `practice` multi | `?practice=painting&practice=film` | **OR** within practice dimension (match any) — document in spec |
| `q` | existing name filter | **AND** with practice filters |
| Sort | unchanged | Alphabetical default — **never** sort by practice count |

### C.3 Explorer card minimum (2B)

Add to Creative Explorer card:

- Primary practice label (if set)  
- Optional “+N” when multiple  

### C.4 Index query strategy

- Join `creative_practices` → `practice_types`  
- Filter on `practice_types.slug`  
- Index: `(practice_type_id)` on `creative_practices`; `(slug)` on `practice_types`  
- Defer FTS across bio until 2B full-text ADR-18 option B  

---

## D. Migration — existing users and defaults

### D.1 Existing users with no Practice selected

| Cohort | Count expectation | Field impact |
|--------|-------------------|--------------|
| Creatives with public profile | Unknown — likely majority empty at launch | Presence unchanged until they opt in |
| Creatives with private profile | N/A | No Field surface |

**Default behaviour:** **Empty practices array** — not required field. Profile remains valid.

### D.2 Backfill strategy

| Strategy | Recommendation |
|----------|----------------|
| **A. No auto-backfill** | **Preferred for 2B launch** — avoids wrong labels from bio NLP |
| B. Admin-only bulk import | Future ops tool |
| C. Infer from `artworks.medium` | **Reject** — conflates record medium with discipline |
| D. Onboarding prompt | Add optional practice step in **2B** onboarding refresh — not retroactive |

### D.3 Rollout sequence (when implemented)

1. Migration: `practice_types` seed + `creative_practices` + RLS  
2. Extend `public_presence` default jsonb (add `practices: true`)  
3. Studio account UI — edit + visibility toggle  
4. Field presence read projection  
5. Creative Explorer facets  
6. Studio “view public page” QA + empty-state nudge  

### D.4 Legacy URL / API compatibility

- No change to `/artist/*` redirect chain  
- No change to Registry record schema  
- New optional API: `PATCH` practices via account save path or dedicated RPC  

---

## 4. Future compatibility

| Future capability | Practice model support |
|-------------------|------------------------|
| **Opportunities / briefs (2C)** | Brief `practices_needed[]` joins `practice_types.id` |
| **Matching (ADR-19)** | Manual filter: brief practices ∩ creative practices |
| **Film / production (2D)** | Production, Film, Scenography practices map to project roles |
| **Recommendations (ADR-20)** | Opt-in digest on saved practice slugs — not auto-rank |
| **Sector taxonomy** | Orthogonal — Creative holds both Practice + Sector |
| **Capabilities tags** | Finer-grained; optional later |

---

## 5. Implementation timing recommendation

### Options evaluated

| Option | Assessment |
|--------|------------|
| **Before PR1C** | **Reject.** Blocks Creative Explorer delivery; contradicts frozen PR1 §9.1 exclusions; no explorer filter consumer yet. |
| **During PR1C** | **Reject.** PR1C scope is explorer index + name search + pagination (plan step 4, spec §10.3). Mixing 2B schema into PR1C expands review surface and couples unrelated AC gates. |
| **After PR1C** | **Accept.** Ship PR1C first (Creative Explorer foundation). Implement Practice in **Phase 2B Discovery enrichment** as a dedicated workstream: schema → Studio → Field presence → Explorer filters. |

### Recommended sequencing

```
PR1B Creative Presence     ← shipped
PR1C Creative Explorer     ← next (no Practice)
PR1 remainder (org, records, verify, link grep)
PR1 merge
─────────────────────────
2B-PR1 Practice schema + Studio edit   ← data collection can start
2B-PR2 Field presence display
2B-PR3 Explorer practice filters
2B-PR4 i18n + presence flag + QA
```

**Optional intermediate:** If product wants early data collection, **2B-PR1 alone** (migration + Studio edit, no Field display) may land immediately after PR1C without blocking explorer — but **do not** delay PR1C for it.

---

## 6. Decision

| Question | Answer |
|----------|--------|
| Does Practice exist as structured data today? | **No** |
| Can bio or medium substitute? | **Partially for display only** — not for search, filters, or matching |
| When to implement? | **After PR1C**, as Phase 2B Discovery enrichment |
| Before PR1C? | **No** |
| During PR1C? | **No** |
| After PR1C? | **Yes — recommended** |

---

## 7. Open questions for founder unlock (pre-implementation)

1. **Max practices per Creative** — recommend 5; confirm cap.  
2. **Primary practice required?** — recommend optional when ≥2 selected.  
3. **Taxonomy governance** — who adds new `practice_types` (founder seed only vs admin UI)?  
4. **`public_presence.practices` default** — default visible vs opt-in hidden.  
5. **Explorer multi-practice filter semantics** — OR vs AND (recommend OR).  
6. **Relationship to Sector** — defer Sector to 2C brief work or include in 2B? (Recommend **defer Sector**; ship Practice alone in 2B.)

---

## Appendix — code references audited

| Area | Path / table | Finding |
|------|--------------|---------|
| Creative public page | `lib/field-creative-presence.ts`, `components/Field/CreativePresenceView.tsx` | Bio + verification; no practice |
| Legacy artist route | `app/artist/[artist_id]/page.tsx` | Redirect stub only |
| Account edit | `app/studio/account/page.tsx`, `AccountProfileSection.tsx` | Bio, links, presence |
| Presence schema | `lib/public-presence.ts`, migration `20260403145000` | Four boolean keys |
| Onboarding | `app/onboarding/OnboardingClient.tsx` | No practice step |
| Work medium | `artworks.medium` | Record-level |
| Blueprint model | `docs/v2/product-blueprint-v1.1.md` §2–3 | Reserved schema |
| 2A exclusions | `docs/v2/phase-2a-pr1-field-foundation-plan.md` §9.1 | Practice → 2B |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | IMPLEMENTATION REVIEW | Initial audit and recommendation |
