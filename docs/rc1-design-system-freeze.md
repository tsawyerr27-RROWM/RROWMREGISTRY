# RC1 Design System Freeze

**Sprint:** 6D — Design System Completion & RC1 UX Freeze  
**Date:** 2026-07-05  
**Status:** Design language frozen for RC1 beta  
**Constraints:** Presentation-only changes; no business logic, schema, API, or routing changes.

---

## Executive Summary

Sprint 6D completes the RC1 visual operating system: a single institutional archive language across Landing, Field, Registry, Studio, Deals, Rights, Ownership, and Certificates. Primary user flows now share filing-sheet surfaces, mono metadata rails, serif hierarchy, semantic colour, and session-persisted archive view modes.

**After this sprint:** The design language is considered **frozen for RC1**. Sprint 7A (Invites, Feedback, Analytics, Beta) begins from this baseline.

**Verification:** `npx tsc --noEmit` ✅ · `npm run build` ✅ · `npm test` ✅

---

## Design System Primitives (Source of Truth)

| Primitive | File | Purpose |
|-----------|------|---------|
| `studioV2` | `styles/studio-v2.ts` | Scope, surfaces, typography, motion tokens |
| `studioFilingForm` | `styles/studio-filing-form.ts` | Form fields, section titles, CTAs |
| `registryV2` | `styles/registry-v2.ts` | Registry/ledger typography |
| `field-v2` | `styles/field-v2.ts` | Field explorer surfaces |
| `StudioContentSlab` | `components/Studio/StudioContentSlab.tsx` | Section panels below heroes |
| `StudioMetricTile` | `components/Studio/StudioContentSlab.tsx` | Primary/secondary metric capsules |
| `StudioInsightTile` | `components/Studio/StudioContentSlab.tsx` | Interactive intelligence tiles (org charts) |
| `StudioHeroSlab` / role heroes | `components/Studio/*WorkspaceHero.tsx` | Studio overview heroes |
| `ArchiveViewSwitcher` | `components/Studio/ArchiveViewSwitcher.tsx` | **New** — universal session-persisted view modes |
| `StudioViewToggle` | `components/Studio/StudioViewToggle.tsx` | Ledger ↔ Gallery wrapper (backward compatible) |
| `ArchiveGalleryGrid` | `components/Studio/ArchiveGalleryGrid.tsx` | **New** — shared thumbnail grid |
| `CreativeArtworkSlab` | `components/Studio/CreativeArtworkSlab.tsx` | Creative works ledger row |
| `CollectorHoldingSlab` | `components/Studio/CollectorHoldingSlab.tsx` | Collector holdings ledger row |
| `ExperienceEmptyState` | `components/ui/ExperienceEmptyState.tsx` | Institutional empty states |
| `RouteErrorShell` / `RouteLoadingShell` | `components/ui/RouteErrorShell.tsx` | Error/loading boundaries |
| `ArchiveNotFoundShell` | `components/ui/ArchiveNotFoundShell.tsx` | Global 404 |
| Semantic signals | `lib/registry-semantic-signals.ts` | Event colour mapping |

---

## Route Audit Matrix

Classification: **Modern** = v2 filing language · **Transitional** = mixed · **Legacy** = pre-v2 patterns remain

### Marketing & Auth

| Route | Status | Notes |
|-------|--------|-------|
| `/` | Modern | v2 landing redesign |
| `/about` | Modern | Editorial + cryptographic why |
| `/get-started` | Modern | Landing shell |
| `/contact` | Transitional | Basic form; acceptable for RC1 |
| `/terms`, `/privacy`, `/disclaimer` | Transitional | Legal prose |
| `/login`, `/signup`, `/reset-password` | Transitional | `AuthPageShell` filing sheet; functional v2 |
| `/onboarding` | Transitional | Post-auth setup |

### Field & Registry

| Route | Status | Notes |
|-------|--------|-------|
| `/field/*` | Modern | Field signature v2 |
| `/field/record/[id]` | Modern | Canonical record view |
| `/field/opportunities/*` | Modern | Explorer + detail v2 |
| `/registry/[id]/ledger` | Modern | Ledger with nested boundaries |
| `/certificate/[id]` | Transitional | Document view |

### Studio

| Route | Status | Notes |
|-------|--------|-------|
| `/studio/creative` overview | Modern | Hero + role band + metrics |
| `/studio/creative` Works | **Modern** | v2 slabs + **Ledger/Gallery toggle** (Sprint 6D) |
| `/studio/creative` Ownership | **Transitional→Modern** | v2 header + filing empty states (Sprint 6D) |
| `/studio/creative` Certificates | **Modern** | v2 + **Ledger/Gallery toggle** (Sprint 6D) |
| `/studio/collector` | Modern | Overview + holdings toggle (existing) |
| `/studio/organisation` | **Modern** | **Final audit** — v2 overview, verification-first hierarchy, filing ops slabs |
| `/studio/deals` | Modern | Command center filing sheets |
| `/studio/deals/new` | **Modern** | v2 proposal editor (Sprint 6D) |
| `/studio/rights` | **Modern** | v2 filing slab workspace (Sprint 6D) |
| `/studio/inbox` | Transitional | Semantic signals; panel polish deferred |
| `/studio/archive` | Transitional | Empty state v2; card list deferred |
| `/studio/account` | Transitional | Mixed; `PrivacyDataSection` legacy |

### Utility & Global

| Route | Status | Notes |
|-------|--------|-------|
| `app/not-found.tsx` | Modern | `ArchiveNotFoundShell` |
| `app/studio/error.tsx` | Modern | `RouteErrorShell` |
| `/admin`, `/internal/*` | Legacy | Dev/admin tools; out of RC1 user scope |

---

## Sprint 6D Components Upgraded

| Component | Change | Priority |
|-----------|--------|----------|
| `ArchiveViewSwitcher` | **New** shared view mode switcher | P3 |
| `ArchiveGalleryGrid` | **New** shared gallery grid | P3 |
| `StudioViewToggle` | Refactored to wrap `ArchiveViewSwitcher` | P3 |
| `ArtworksSection` | Ledger + Gallery modes; v2 header | P2, P3 |
| `CertificatesSection` | Full v2 rewrite; gradients removed; gallery mode | P2, P6 |
| `OwnershipSection` | v2 header; neutral transfer dots; filing empty states | P5 |
| `StudioRightsWorkspace` | `StudioContentSlab`; v2 tabs; institutional empty/error | P7 |
| `DealEditorWorkspace` | v2 filing sheet header; institutional error notice | P4 |
| `DealEditorSectionNav` | Filing steps outline; v2 tab styling | P4 |
| `lib/deal-editor.ts` | Section cards → `studioV2.surface.filingSheet` | P4 |
| `ExperienceEmptyState` | Filing sheet shell; v2 CTAs; no `liquid-glass` | P12 |
| `PersonalArchivePageContent` | Gradient empty removed | P12 |

---

## Archive View System

Session-persisted via `useArchiveViewMode` / `useStudioViewMode`.

| Surface | Modes | Storage key | Status |
|---------|-------|-------------|--------|
| Collector Holdings | Ledger, Gallery | `collector.worksView` | ✅ Modern |
| Creative Works | Ledger, Gallery | `creative.worksView` | ✅ Sprint 6D |
| Creative Certificates | Ledger, Gallery | `creative.certificatesView` | ✅ Sprint 6D |
| Creative Ownership | Ledger only | — | Data is list-only; no gallery without images |
| Organisation Works | Ledger only | — | Deferred — catalogue uses org-specific layout |
| Deals | Command center | — | Not applicable (deal records, not artwork archive) |
| Rights | Tabbed ledger | — | Active / Expiring / Historical tabs |

**Not exposed (no meaningful data):** Timeline views where chronology data is not surfaced in subsection UI; Organisation pipeline table modes (separate opportunity editor).

---

## Components Deprecated / Superseded

| Component | Status | Replacement |
|-----------|--------|-------------|
| `rrowmEconomicSurface` in deal editor | Superseded | `studioV2.surface.filingSheet*` |
| `rrowmButton.primaryEconomic` in deal editor | Superseded | `v2-cta-primary` |
| `liquid-glass-inset` in `ExperienceSubtleHint` | Removed | v2 border surface |
| `workspace.panel.shell` in Rights | Removed | `StudioContentSlab` |
| Emerald gradient certificate cards | Removed | `CreativeArtworkSlab` + `ArchiveGalleryGrid` |
| Bare root 404 | Removed (Batch 2) | `ArchiveNotFoundShell` |

**Not deleted (dead code, documented):** `StudioStatusBar.tsx` — zero imports; remove in Sprint 7A cleanup.

---

## Consistency Checklist

### Typography ✅ RC1 frozen

- [x] Mono metadata rails (`v2-type-mono`, 9–10px, tracking 0.18–0.22em)
- [x] Serif display headings (`font-serif`, v2-type-display)
- [x] Body at 14–15px with `--v2-ink-muted`
- [x] Micro labels on metrics and stamps

### Colour ✅ RC1 frozen

- [x] Semantic signals only for registry events (cobalt/violet/ember/lime/seal/amber)
- [x] Gradients removed from Studio subsections (Works empty retains accent mark only)
- [x] Neutral paper/graphite for non-semantic UI chrome

### Motion ✅ RC1 frozen

- [x] `v2-motion-hover-subtle`, `studio-reveal`, `studio-reveal-stagger`
- [x] `motion-reduce:transition-none` on interactive toggles
- [x] No bounce or decorative animation in upgraded surfaces

### Empty States ✅ RC1 frozen (primary flows)

- [x] Institutional copy ("on file", "recorded in this archive")
- [x] Filing sheet containers
- [x] v2 CTAs (`v2-cta-primary`, `v2-cta-secondary`)

### Loading / Error ✅ RC1 frozen (primary flows)

- [x] Studio error boundary (`app/studio/error.tsx`)
- [x] Field error boundaries
- [x] Rights retry state
- [x] Deal editor institutional error notice

### Navigation ✅ RC1 frozen

- [x] Canonical href helpers (`studioCollectorArtworkHref`, `fieldRecordHref`, `fieldCollectorHref`)
- [x] Legacy routes redirect; Studio emitters use canonical paths

---

## Remaining Technical Debt (Post-RC1 / Sprint 7A+)

| Area | Priority | Notes |
|------|----------|-------|
| `PrivacyDataSection` | Medium | 10× legacy `liquid-glass` tiles in account |
| Admin / internal verify | Low | Dev tools; `liquid-glass-tile-dark` |
| `StudioArtworkClient` | Medium | Legacy collector artwork detail cards |
| Organisation catalogue view toggle | Low | Org works use bespoke catalogue layout |
| Activity feed unification | Low | Three implementations; functional |
| `PersonalArchivePageContent` list cards | Low | Empty v2; list still pre-v2 cards |
| Field verify nested `not-found.tsx` | Low | Pre-v2 CTAs |
| Auth/contact page polish | Low | Functional v2 auth shell |
| `StudioInbox` gradient accents | Low | Transitional panel |
| Opportunity editor (`rrowm-zone-economic`) | Medium | Studio org opportunities editor |

---

## Before / After Summary

| Dimension | Before RC1 audits | After Sprint 6D |
|-----------|-------------------|-----------------|
| Studio error boundary | Missing | `RouteErrorShell` |
| Root 404 | Bare `<h1>` | `ArchiveNotFoundShell` |
| Creative Works | Ledger only, mixed cards | v2 slabs + Gallery |
| Certificates | Emerald gradients, legacy cards | v2 filing + Gallery |
| Rights ledger | `workspace.panel.shell` | `StudioContentSlab` + v2 tabs |
| Deal proposal editor | `rrowm-zone-economic` | v2 filing sheets |
| Empty states | SaaS buttons, liquid-glass | Institutional filing sheets |
| View toggles | Collector only | Collector + Creative Works + Certificates |
| Collector links | `/collector-studio/artwork/*` | `/studio/artwork/*` canonical |

---

## Screenshots List (Recommended for Beta QA)

Capture these for RC1 sign-off:

1. Landing hero + OS section + archive footer
2. Field record page + ledger tab
3. Creative Studio — Overview, Works (Ledger + Gallery), Ownership, Certificates (Gallery)
4. Collector Studio — Holdings (Ledger + Gallery)
5. Organisation Studio — Overview + Opportunities
6. Deals command center + new proposal editor filing steps
7. Rights ledger — Active tab + empty state
8. Global 404 (`ArchiveNotFoundShell`)
9. Mobile header logo (`rrowm-mobile.png` at 88px)
10. Auth login filing sheet

---

## Files Changed (Sprint 6D)

**New:**
- `components/Studio/ArchiveViewSwitcher.tsx`
- `components/Studio/ArchiveGalleryGrid.tsx`
- `docs/rc1-design-system-freeze.md`

**Upgraded:**
- `components/Studio/StudioViewToggle.tsx`
- `components/Dashboard/ArtworksSection.tsx`
- `components/Dashboard/CertificatesSection.tsx`
- `components/Dashboard/OwnershipSection.tsx`
- `components/Studio/Rights/StudioRightsWorkspace.tsx`
- `components/Studio/Deals/DealEditorWorkspace.tsx`
- `components/Studio/Deals/DealEditorSectionNav.tsx`
- `components/ui/ExperienceEmptyState.tsx`
- `components/archive/PersonalArchivePageContent.tsx`
- `lib/deal-editor.ts`
- `lib/locale-messages.ts` (`studio.archive.view*`, `studio.activity.loading`, `notFound.*`)

**Prior batches (RC1 audit):**
- `app/studio/error.tsx`, `app/not-found.tsx`, `components/ui/ArchiveNotFoundShell.tsx`
- Collector link canonicalization across Studio components

---

## Creative Studio Final Audit

**Date:** 2026-07-05  
**Scope:** Final RC1 verification — `/studio/creative` and all in-page subsections (Works, Artwork Detail, Ownership, Certificates), plus framework hygiene.  
**Constraints:** Presentation-only; no features, business logic, schema, API, telemetry, or routing changes (except proxy migration).

### Audit result: **RC1 compliant** (primary Creative flows)

| Surface | Status | Notes |
|---------|--------|-------|
| Dashboard (Overview) | ✅ Modern | Hero, role band, `StudioContentSlab`, metrics — v2 frozen |
| Works | ✅ Modern | `ArtworksSection` — ledger/gallery via `ArchiveViewSwitcher`; v2 header |
| Artwork Detail modal | ✅ Modern | **Final audit upgrade** — filing sheet, mono rails, violet valuation dots; gradients/`liquid-glass` removed |
| Ownership ledger modal | ✅ Modern | **Final audit upgrade** — filing sheets, amber exception banner, v2 CTAs |
| Ownership subsection | ✅ Modern | v2 header, `WorkspaceRecordCard`, filing empty states |
| Certificates | ✅ Modern | Ledger/gallery toggle; v2 slabs |
| Rights (`/studio/rights`) | ✅ Modern | Sprint 6D `StudioContentSlab` workspace |
| Deals (`/studio/deals*`) | ✅ Modern | Command center + proposal editor filing steps |
| Archive (`/studio/archive`) | Transitional | Empty state v2; list cards deferred (post-RC1) |
| Inbox | Transitional | Functional; panel polish deferred |
| Account | Transitional | Mixed; `PrivacyDataSection` legacy |
| Loading | ✅ Modern | Creative page uses `RouteLoadingShell` |
| Error | ✅ Modern | `app/studio/error.tsx` → `RouteErrorShell` |
| Global 404 | ✅ Modern | `ArchiveNotFoundShell` (instrumentation removed) |

### Archive view consistency (Creative)

| Surface | Switcher | Storage key | Ledger | Gallery | a11y | reduced-motion |
|---------|----------|-------------|--------|---------|------|----------------|
| Works | `StudioViewToggle` → `ArchiveViewSwitcher` | `creative.worksView` | ✅ | ✅ | tablist/roles | ✅ |
| Certificates | same | `creative.certificatesView` | ✅ | ✅ | tablist/roles | ✅ |
| Ownership | — | — | list-only | n/a | — | — |
| Collector (reference) | same pattern | `collector.worksView` | ✅ | ✅ | ✅ | ✅ |

No bespoke toggle implementations in Creative Studio.

### Inconsistencies found & resolved (this audit)

| Issue | Location | Resolution |
|-------|----------|------------|
| Debug `[NOT_FOUND]` logging | `app/not-found.tsx` | Removed — restored clean shell export |
| Deprecated `middleware.ts` | project root | Migrated to `proxy.ts` (Next.js 16 convention) |
| Emerald gradients + `liquid-glass` in artwork detail | `ArtworkDetailModal.tsx` | v2 filing sheet + semantic valuation dots |
| Legacy ledger modal chrome | `app/studio/creative/page.tsx` | Filing sheets, mono rails, amber exception banner |
| Custom loading spinner | `app/studio/creative/page.tsx` | `RouteLoadingShell` |
| `liquid-glass-tile` no-match banner | `studioListPrimitives.tsx` | `studioV2.surface.filingSheet` |

### Primitives reused (Final Audit)

- `ArchiveNotFoundShell` — global 404
- `RouteLoadingShell` — Creative page boot loading
- `studioV2.surface.filingSheet` — artwork detail, ledger modals, no-match banner
- `semanticDotClass("valuation")` — value chronology markers
- `v2-cta-secondary` — pending transfer CTA in ledger modal
- `ArchiveViewSwitcher` / `StudioViewToggle` — Works + Certificates (unchanged, verified)
- `ArchiveGalleryGrid`, `CreativeArtworkSlab`, `ExperienceEmptyState` — Works/Certificates (unchanged, verified)

### Files changed (Final Audit)

- `app/not-found.tsx` — investigation cleanup
- `middleware.ts` → `proxy.ts` — framework migration
- `components/Dashboard/ArtworkDetailModal.tsx` — v2 presentation
- `components/Dashboard/studioListPrimitives.tsx` — filing sheet no-match banner
- `app/studio/creative/page.tsx` — ledger modal + loading shell
- `docs/rc1-design-system-freeze.md` — this section

### Remaining Creative-adjacent debt (post-RC1)

| Area | Priority | Notes |
|------|----------|-------|
| `AddValueEventModal` tooltip | Low | `liquid-glass` tooltip chrome — modal body is v2 |
| `PersonalArchivePageContent` list cards | Low | Empty v2; list pre-v2 |
| `StudioInbox` gradient accents | Low | Transitional |
| Organisation catalogue toggle | Low | Out of Creative scope |

**Manual verification checklist:** register artwork · self-attest · view certificate · ownership filters · Works ledger/gallery toggle · Certificates ledger/gallery toggle · desktop + mobile · no blank `return null` on deals/collector/org (Batch 1 fixes in working tree).

---

## Collector Studio Final Audit

**Date:** 2026-07-05  
**Scope:** Final RC1 verification — `/studio/collector` and collector holding detail (`StudioArtworkClient`). Creative Studio untouched.  
**Constraints:** Presentation-only; no features, business logic, schema, API, telemetry, or routing changes.

### Audit result: **RC1 compliant** (primary Collector flows)

| Surface | Status | Notes |
|---------|--------|-------|
| Dashboard (Overview) | ✅ Modern | Hero, role band, `StudioContentSlab`, `StudioMetricTile` |
| Holdings — Ledger | ✅ Modern | `CollectorHoldingSlab` filing sheets, semantic rails |
| Holdings — Gallery | ✅ Modern | **Final audit** — `CollectorHoldingsGallery` → `ArchiveGalleryGrid` |
| Holding Detail | ✅ Modern | **Final audit** — `StudioArtworkClient` v2 filing language |
| Attention | ✅ Modern | Mono rail + serif header aligned with Works |
| Ownership (per holding) | ✅ Modern | Transfer chronology with lime semantic border |
| Certificates (on holding) | ✅ Modern | Mono stamp; certificate link via v2 CTA |
| Deals / Rights / Archive / Inbox / Account | Shared | Role uses shared Studio surfaces (Sprint 6D); not collector-specific |
| Loading | ✅ Modern | `RouteLoadingShell` on collector page + holding detail |
| Error / not found (holding) | ✅ Modern | Filing sheet shell with return CTA |
| Activity preview | ✅ Modern | Semantic dots, typographic list (unchanged, verified) |

### Archive view consistency (Collector)

| Surface | Switcher | Storage key | Ledger | Gallery | a11y | reduced-motion |
|---------|----------|-------------|--------|---------|------|----------------|
| Holdings | `StudioViewToggle` → `ArchiveViewSwitcher` | `collector.worksView` | ✅ `CollectorHoldingSlab` | ✅ `ArchiveGalleryGrid` | tablist | ✅ |

Session persistence via `useStudioViewMode` / `useArchiveViewMode` — verified.

### Inconsistencies found & resolved

| Issue | Location | Resolution |
|-------|----------|------------|
| Duplicated gallery grid | `CollectorHoldingsGallery.tsx` | Thin adapter over `ArchiveGalleryGrid` |
| Legacy economic CTAs | `CollectorWorkspaceHero.tsx` | `v2-cta-primary` / `v2-cta-secondary` |
| Custom loading text | `app/studio/collector/page.tsx` | `RouteLoadingShell` |
| Decorative gradient rails | collector page loading | Removed |
| Legacy filter select | collector works filter | `studioFilterSelectClass("light")` |
| Legacy pending-acquisition cards | collector page | Filing sheet + amber exception rail + v2 CTAs |
| Inline metric tiles | collector overview health | `StudioMetricTile` |
| Attention header | collector attention section | Mono rail + v2 display heading |
| Legacy holding detail page | `StudioArtworkClient.tsx` | Full v2 filing presentation |
| Neutral-600 notes | `CollectorWorkspaceOverview.tsx` | `--v2-ink-muted` tokens |

### Primitives reused

- `ArchiveGalleryGrid` / `ArchiveViewSwitcher` (via `StudioViewToggle`)
- `CollectorHoldingSlab`
- `StudioContentSlab`, `StudioMetricTile`
- `StudioRoleBand`, `CollectorWorkspaceHero`, `CollectorWorkspaceOverview`
- `RouteLoadingShell`
- `studioV2.surface.filingSheet*`
- `semanticAccentBorderClass("transfer")`, `semanticDotClass("valuation")`
- `ArtworkTrustBadge`, `v2-cta-primary`, `v2-cta-secondary`

### Files changed (Final Audit)

- `components/Studio/CollectorHoldingsGallery.tsx`
- `components/Studio/CollectorWorkspaceHero.tsx`
- `components/Studio/CollectorWorkspaceOverview.tsx`
- `components/Studio/StudioArtworkClient.tsx`
- `app/studio/collector/page.tsx`
- `docs/rc1-design-system-freeze.md`

### Remaining RC2 debt (Collector-adjacent)

| Area | Priority | Notes |
|------|----------|-------|
| Collector certificates subsection in Studio | Low | Certificates live on holding detail + Field; no separate collector cert gallery |
| `PersonalArchivePageContent` list cards | Low | Shared archive route |
| Pending acquisition copy i18n keys | Low | Some hardcoded EN strings in overview slab |
| Hero metric tiles in `CollectorWorkspaceHero` | Low | Inline tiles match v2; could migrate to `StudioMetricTile` for parity |

---

## Organisation Studio Final Audit

**Date:** 2026-07-05  
**Scope:** Final RC1 verification — `/studio/organisation` and Organisation-specific gallery components. Creative and Collector Studio untouched.  
**Constraints:** Presentation-only; no features, business logic, schema, API, telemetry, analytics, or routing changes.

### Audit result: **RC1 compliant** (primary Organisation flows)

| Surface | Status | Notes |
|---------|--------|-------|
| Dashboard (Overview) | ✅ Modern | `StudioRoleBand`, `GalleryInstitutionalHero`, verification command on overview |
| Verification Queue | ✅ Modern | `OrganisationVerificationCommand` + mono rail; dominates catalogue hierarchy |
| Verification Detail | ✅ Modern | `GalleryVerifyAttestationModal`, `OrganisationVerificationSlab` filing sheets |
| Amendment Requests | ✅ Modern | **Final audit** — `RepresentationAmendmentsSection` v2 slabs + CTAs |
| Works / Catalogue | ✅ Modern | Priority queue first; `RecordIntegritySection`, `RecordReadinessSection` → `StudioContentSlab` |
| Catalogue list | ✅ Modern | **Final audit** — registered works in `StudioContentSlab`; semantic cert status |
| Roster | ✅ Modern | Filing sheet + mono rail header; semantic representation badges |
| Record Depth / Participation | ✅ Modern | `GalleryRecordDepthSection` filing rows + v2 CTAs |
| Opportunities | ✅ Modern | **Final audit** — `OpportunityListPanel` v2 CTA + `ExperienceEmptyState` |
| Applications / Publishing | ✅ Modern | `OpportunityEditorWorkspace` (unchanged, verified) |
| Invitations | ✅ Modern | `GalleryInvitationsHub`; auth invite success strips v2 |
| Intelligence | ✅ Modern | `StudioContentSlab` + `StudioInsightTile` + `StudioCatalogueMetricsPanels` |
| Loading | ✅ Modern | **Final audit** — `RouteLoadingShell` |
| Empty / error | ✅ Modern | Institutional empty states; no blank `return null` |
| Deals / Rights / Archive / Inbox / Account | Shared | Shared Studio routes (Sprint 6D) |

### Workflow hierarchy (governance-first)

| Priority | Surface | Signal |
|----------|---------|--------|
| 1 — Attention | Verification command (overview + section) | Cobalt rail on slabs; queue stamp |
| 2 — Processing | Priority queue, amendments, participation pending | Amber exception rails; primary verify CTAs |
| 3 — Reference | Catalogue list, intelligence tiles, roster | Muted ink; secondary metrics |

Verification surfaces precede catalogue browsing on overview and in catalogue section (`PriorityQueueSection` with verification overline).

### Inconsistencies found & resolved

| Issue | Location | Resolution |
|-------|----------|------------|
| Custom loading text | `app/studio/organisation/page.tsx` | `RouteLoadingShell` |
| Legacy economic CTAs | `GalleryInstitutionalHero.tsx` | `v2-cta-primary` / `v2-cta-secondary` |
| Inline hero metric tiles | `GalleryInstitutionalHero.tsx` | `StudioMetricTile` primary/secondary |
| Glass/blur ops cards | `RecordIntegritySection`, `RecordReadinessSection`, `PriorityQueueSection` | `StudioContentSlab` filing sheets |
| Emerald status colours | integrity/readiness/catalogue/roster | Semantic certification/correction tokens |
| Legacy catalogue list card | organisation page catalogue | `StudioContentSlab` wrapper |
| Legacy amendment cards + buttons | `RepresentationAmendmentsSection.tsx` | Filing sheets, amber rail, v2 CTAs, `studioFilingForm` |
| Legacy participation rows | `GalleryParticipationPendingSection.tsx` | Filing sheet rows + v2 CTAs |
| Missing mono rails | verification command, catalogue, roster headers | `studioV2.type.railLabel` overlines |
| Emerald success strips | auth invite sections/modal | v2 filing status strips |
| `rrowmButton` on opportunities | `OpportunityListPanel.tsx` | `v2-cta-primary` + `ExperienceEmptyState` |

### Primitives reused

- `RouteLoadingShell`
- `StudioContentSlab`, `StudioMetricTile`, `StudioInsightTile`
- `GovernanceSectionShell`
- `GalleryInstitutionalHero`, `OrganisationVerificationCommand`, `OrganisationVerificationSlab`
- `ExperienceEmptyState`
- `studioV2.surface.filingSheet*`, `studioFilingForm`
- `semanticTextClass("certification")`, `semanticTextClass("correction")`
- `v2-cta-primary`, `v2-cta-secondary`, `studio-execution-stamp`

### Files changed (Final Audit)

- `app/studio/organisation/page.tsx`
- `components/gallery/GalleryInstitutionalHero.tsx`
- `components/gallery/OrganisationVerificationCommand.tsx`
- `components/gallery/RecordIntegritySection.tsx`
- `components/gallery/RecordReadinessSection.tsx`
- `components/gallery/PriorityQueueSection.tsx`
- `components/gallery/GalleryParticipationPendingSection.tsx`
- `components/gallery/GalleryArtworkAuthenticationInvitesSection.tsx`
- `components/gallery/ArtworkAuthenticationInviteModal.tsx`
- `components/Studio/RepresentationAmendmentsSection.tsx`
- `components/Studio/Opportunities/OpportunityListPanel.tsx`
- `docs/rc1-design-system-freeze.md`

### Remaining RC2 debt (Organisation-adjacent)

| Area | Priority | Notes |
|------|----------|-------|
| `GalleryPublicSections` / `GalleryPublicHero` | Low | Public Field org profile — not Studio |
| `OrganisationOpportunitiesSection` error banner | Low | Functional red alert; acceptable for RC1 |
| Catalogue ledger/gallery toggle | Low | Organisation catalogue is list-first; no gallery grid needed |
| `AuthenticateArtworkRecordClient` | Low | Standalone auth flow; glass card remains |
| Hardcoded EN in roster ("End on file", work counts) | Low | i18n keys deferred |

### RC1 account-type freeze status

| Account type | Status |
|--------------|--------|
| Creative | ✅ RC1 compliant |
| Collector | ✅ RC1 compliant |
| Organisation | ✅ RC1 compliant |

**Individual account-type audits complete.** Sprint 7A may proceed from this baseline.

---

## RC1 UX Freeze Declaration

As of Sprint 6D completion:

1. **Frozen:** Typography scale, filing-sheet surfaces, semantic colour mappings, archive view switcher pattern, empty/error/loading language on primary flows.
2. **Allowed in Sprint 7A:** New features using existing primitives only; no new visual paradigms without explicit design review.
3. **Not frozen (explicit debt):** Admin tools, account privacy section, legacy artwork detail page, opportunity economic editor zone.

The platform should read as **one cultural operating system** — museum archive × financial terminal × registry infrastructure — across Studio, Field, Registry, Deals, Rights, Certificates, and Ownership.

---

## Related Documents

- `docs/rc1-platform-audit.md` — Route inventory, Batch 1 + 2 remediation, production parity
