# Phase 2B PR1C — Creative Discovery Enrichment — Acceptance Notes

**Branch:** `pr/phase2b-field-pr1`  
**Commit:** PR1C Creative Discovery Enrichment  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md`, `phase-2b-pr1-search-and-discovery-plan.md`

---

## Scope delivered

PR1C strengthens Creative discovery quality on Field without recommendations, social features, opportunities, schema changes, or migrations.

| Surface | Enhancement |
|---------|-------------|
| **Creative Presence** | Registry-evidence-first layout; declared vs registry practice sections; participation strip; discovery navigation; owner-only stewardship checklist |
| **Creative Explorer cards** | Verification summary band; practice chips (max 3); profile + verify hub links |
| **Creative Explorer filters** | Practice filter hint (declared OR registry-evidence) |
| **Practice model** | Primary declared first; registry-evidence deduped; `practices_visible` gate; `primary_practice` jsonb support |

---

## Product rules preserved

| Rule | Implementation |
|------|----------------|
| Registry evidence primary | Verified work counts and participation layers precede bio and secondary metadata |
| Declared vs registry practices | Separate headings + chip styling (neutral vs green); legend on profile |
| No public completeness score | Owner-only stewardship checklist — no percentage or rank to anonymous visitors |
| Owner practice guidance (AC-PC4) | Shown only when profile owner signed in and registry-evidence exists without declared practices |
| Deterministic discovery | Explorer sort unchanged (alpha / recent); no popularity or recommendation UI |
| Search contract | PR1A `q` on name, slug, bio unchanged |
| Verified-default Record Explorer | Unchanged from PR1A |

---

## Navigation edges (Creative graph)

| From | To |
|------|-----|
| Creative Presence | Record Explorer, Creative Explorer, Organisation (when public), practice-filtered explorer, Verify hub |
| Creative Presence footprint cards | Field Record (primary), Verify, Registry ledger (secondary) |
| Creative Explorer cards | Creative profile, Verify hub |

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| PR1A search contract | Preserved |
| PR1A verified-default records | Preserved |
| PR1B redirects / ledger policy | Unchanged |
| No schema / migrations | Application-layer jsonb reads only |

---

## Manual QA checklist

- [ ] Creative profile shows registry evidence block before bio
- [ ] Declared and registry practices render in separate sections when both present
- [ ] Primary declared practice appears first when `primary_practice` set in `public_presence`
- [ ] Owner signed in sees stewardship checklist; anonymous visitors do not
- [ ] Owner with registry-only practices sees practice declaration guidance
- [ ] Creative Explorer cards show verification summary before bio
- [ ] Practice filter hint explains declared + registry-evidence matching
- [ ] Discovery section links reach Record Explorer, Verify hub, Organisation when applicable
- [ ] `practice=` explorer link from profile pre-fills primary or first practice slug

---

## Out of scope (later PRs)

- Studio practice editor UI (PR2)
- Context panels (“More from…”) (PR3)
- Studio completeness meter UI (PR3)
- Organisation practice filter (2B.1)
