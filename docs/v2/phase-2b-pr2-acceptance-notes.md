# Phase 2B PR2 — Practice System and Profile Completeness — Acceptance Notes

**Branch:** `pr/phase2b-pr2-practices`  
**Commit:** PR2 Practice System and Profile Completeness  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md`, `phase-2b-discovery-expansion-plan.md`

---

## Scope delivered

PR2 completes Studio-side practice declaration and profile-completeness foundations deferred from PR1. Field read-side practice display and explorer filtering from PR1C remain unchanged.

| Surface | Enhancement |
|---------|-------------|
| **Studio Practice section** | Canonical taxonomy multi-select (max 5); primary practice radio; `practices_visible` toggle |
| **Registry-evidence preview** | Read-only chips in Studio from verified record mediums |
| **Persistence** | `public_presence.practices`, `primary_practice`, `practices_visible` via jsonb (no migration) |
| **Creative completeness** | Studio-only discoverability checklist + meter in account hero |
| **Organisation completeness** | Studio-only checklist aligned to spec §7.2 |
| **Practice libs** | `studio-practice-settings.ts`, `studio-profile-completeness.ts` |

---

## Product rules preserved

| Rule | Implementation |
|------|----------------|
| Declared vs registry-evidence | Studio edit for declared only; registry section read-only |
| Max 5 declared practices | Enforced in UI + `normalizeCreativePracticeSettings` |
| Primary declared first on Field | Existing `mergeCreativePracticeChips` (PR1C) |
| `practices_visible` gate | Toggle in Practice section; `parsePracticeVisibility` on Field |
| No public completeness score | Meter/checklist Studio account hero only — not on Field |
| No ranking effect | Explorer sort/filter unchanged |
| PR1 discovery preserved | No changes to search contract, redirects, verified-default records |

---

## Acceptance criteria mapping

### AC-PR*

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **AC-PR1** Declared practices in Studio; max 5 | **Pass** | `AccountPracticeSection` + `MAX_DECLARED_PRACTICES` |
| **AC-PR2** Primary declared ordered first | **Pass** | Save `primary_practice`; PR1C Field merge |
| **AC-PR3** Registry-evidence distinct semantics | **Pass** | Unchanged PR1C Field chips; Studio read-only band |
| **AC-PR4** `practices_visible` gates public chips | **Pass** | Toggle persists to jsonb; Field loader respects flag |
| **AC-PR5** Explorer `practice=` matches declared + registry | **Pass** | Unchanged PR1C `creativeMatchesPracticeFilter` |
| **AC-PR6** No auto-declare without Studio save | **Pass** | Declared slugs only written from account save |

### AC-PC*

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **AC-PC1** Studio completeness for Creative and Organisation | **Pass** | `buildCreativeProfileCompleteness` / `buildOrganisationProfileCompleteness` in account hero |
| **AC-PC2** No public completeness percentage on Field | **Pass** | No Field UI changes |
| **AC-PC3** Explorer inclusion not gated by practice | **Pass** | Unchanged explorer loaders |
| **AC-PC4** Owner-only practice guidance | **Pass** | Unchanged PR1C `showOwnerPracticeGuidance` on Field profile |

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| PR1 search contract | Unchanged |
| PR1 redirects | Unchanged |
| Verified-default Record Explorer | Unchanged |
| Schema / migrations | None — jsonb keys on existing `public_presence` |

---

## Manual QA checklist

- [ ] Artist account: Practice section appears in nav
- [ ] Select up to 5 practices; sixth disabled
- [ ] Set primary when multiple declared; single declared auto-primary on save
- [ ] Toggle practices visibility; Field profile hides/shows chips accordingly
- [ ] Registry-evidence section read-only with green chips when verified works exist
- [ ] Save persists; reload restores declared + primary + visibility
- [ ] Account hero shows discoverability checklist (Creative + Organisation)
- [ ] Field anonymous view shows no completeness meter or percentage
- [ ] Creative Explorer `practice=` filter still matches declared + registry-evidence
- [ ] Owner signed in on Field sees practice guidance when registry-only (PR1C)

---

## Out of scope (later trains)

- Organisation practice filter (2B.1 optional)
- Context panels (PR3)
- Full i18n pass for Studio practice strings (PR4)
