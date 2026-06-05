# Phase 2B PR1D — Organisation Discovery Enrichment — Acceptance Notes

**Branch:** `pr/phase2b-field-pr1`  
**Commit:** PR1D Organisation Discovery Enrichment  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md`, `phase-2b-pr1-search-and-discovery-plan.md`

---

## Scope delivered

PR1D strengthens Organisation discovery quality on Field without recommendations, popularity ranking, opportunities, programmes, commissioning, schema changes, or migrations.

| Surface | Enhancement |
|---------|-------------|
| **Organisation Presence** | Registry-evidence-first layout; participation strip; discovery navigation; owner-only stewardship checklist; represented-Creative work counts; footprint cards with Field Record, Verify, and Registry ledger links |
| **Organisation Explorer cards** | Registry-evidence summary band before location/description; profile + verify hub links |
| **Organisation Explorer hero** | Verify hub link |
| **Organisation Explorer filters** | Verification and representation filter hints |
| **Loader** | Per-Creative verified/total work counts; owner detection via `gallery_users`; stewardship items |

---

## Product rules preserved

| Rule | Implementation |
|------|----------------|
| Registry evidence primary | Verification badge, footprint stats, and participation layers precede location, website, and About copy |
| Verification distinct from description | Organisation verification badge lives in Registry evidence block; About section is separate descriptive copy |
| No public completeness score | Owner-only stewardship checklist — no percentage or rank to anonymous visitors |
| Deterministic discovery | Explorer sort unchanged (alpha / recent); no popularity or recommendation UI |
| Search contract | PR1A `q` on name, location, description unchanged |
| Verified-default Record Explorer | Unchanged from PR1A |
| URL / redirect policy | PR1B redirects and ledger secondary links unchanged |

---

## Navigation edges (Organisation graph)

| From | To |
|------|-----|
| Organisation Presence | Record Explorer, Organisation Explorer, Creative Explorer, Verify hub |
| Organisation Presence roster | Creative Presence (when public); neutral omission when private |
| Organisation Presence footprint cards | Field Record (primary), Verify, Registry ledger (secondary), Creative (when public) |
| Organisation Explorer cards | Organisation profile, Verify hub |

---

## Acceptance criteria mapping

### AC-DO* (Organisation discovery)

| Criterion | PR1D evidence |
|-----------|---------------|
| **AC-DO1** Organisation Explorer text search | Unchanged — PR1A `q` contract preserved; no loader changes to search |
| **AC-DO2** Verified filter behaviour unchanged | Verified filter + hint only; default remains all Organisations |
| **AC-DO3** Org profile roster and catalogue link into Creative and Field Record graph | Roster cards link to Creative Presence; footprint cards link to Field Record, Verify, ledger, and Creative |
| **AC-DO4** No paid placement or subscriber-tier sort | Sort options unchanged; no ranking UI added |

### AC-VT* (Verification visibility)

| Criterion | PR1D evidence |
|-----------|---------------|
| **AC-VT1** Trust hierarchy order preserved | Registry evidence block precedes descriptive copy on profile and explorer cards |
| **AC-VT2** Practice chips distinct from verification badges | N/A for Organisation surfaces; org verification badge separate from record verification on footprint cards |
| **AC-VT3** Record Explorer default verified emphasis | Unchanged — no Record Explorer changes in PR1D |
| **AC-VT4** No excluded reputation signals | No scores, rankings, or popularity metrics introduced |

### AC-GN* (Graph navigation)

| Criterion | PR1D evidence |
|-----------|---------------|
| **AC-GN1** Edge matrix navigable | Discovery section + footprint/roster links cover Org → Creative → Record → Verify |
| **AC-GN2** Context panels deterministic only | Out of scope — no context panels in PR1D |
| **AC-GN3** Legacy record detail URLs 301 to Field Record | Unchanged from PR1B |
| **AC-GN4** No broken links when target profile private | Creative links omitted when profile not public; names still shown |

### AC-PC* (Profile completeness — owner only)

| Criterion | PR1D evidence |
|-----------|---------------|
| Owner stewardship visible only when signed-in gallery member | `gallery_users` membership check |
| No public completeness meter | Checklist hidden from anonymous visitors; incomplete items only |

### PR1 acceptance criteria (partial, preserved)

| Area | Status |
|------|--------|
| PR1A search contract | Preserved |
| PR1A verified-default records | Preserved |
| PR1B redirects / ledger policy | Unchanged |
| PR1C Creative patterns reused | Registry evidence, discovery section, owner stewardship, explorer card band |

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| PR1A search contract | Preserved |
| PR1A verified-default records | Preserved |
| PR1B redirects / ledger policy | Unchanged |
| No schema / migrations | Application-layer reads only |

---

## Manual QA checklist

- [ ] Organisation profile shows registry evidence block before location and About
- [ ] Organisation verification badge is separate from About/description
- [ ] Owner signed in as gallery member sees stewardship checklist; anonymous visitors do not
- [ ] Represented Creative cards show verified/total work counts when works exist
- [ ] Footprint cards link to Field Record, Verify, Registry ledger, and Creative when public
- [ ] Discovery section links reach Record, Organisation, Creative explorers and Verify hub
- [ ] Organisation Explorer cards show registry evidence before description excerpt
- [ ] Explorer hero includes Verify hub link
- [ ] Verification and representation filter hints display under respective controls

---

## Out of scope (later PRs)

- Context panels (“More from…”) (PR3)
- Studio completeness meter UI (PR3)
- Organisation → Creative explorer deep-link filter (no param contract yet)
- Full AC-GN1–2 context panel work (PR3–PR4)
