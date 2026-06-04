# Phase 1 Acceptance Gate — Studio Foundation Release Candidate

**Document status:** ACTIVE (PR6)  
**Authority:** [Phase 1 Implementation Specification](./phase-1-studio-foundation-spec.md) (LOCKED) §3–4, [Feasibility Review](./phase-1-feasibility-review.md) PR6  
**Scope:** Release-candidate validation only — no new product scope, routes, or migrations in PR6  

---

## 1. Release candidate definition

Phase 1 **Studio Foundation** is a release candidate when:

1. **Code checkpoints** on `main`:
   - `checkpoint-phase1-routes` — PR4 canonical `/studio/*` + legacy redirects
   - `checkpoint-phase1-auth` — PR5 `app/studio/layout.tsx` namespace guard (AG-1–3)
2. **Automated gates** in §2 pass on the RC branch / `main`.
3. **Staging manual gates** in §4 are signed off by QA.
4. **Migration prerequisites** (§5) are applied on the target environment before RP-9 / RP-13.

PR6 does **not** add Field routes, Practice objects, Opportunity Loop, or new migrations.

---

## 2. Automated gates (run on every RC build)

| Command | Purpose | Required for RC |
|---------|---------|-----------------|
| `npx tsc --noEmit` | Type safety | Yes |
| `npm run build` | Production compile + route table | Yes |
| `npx tsx scripts/phase-1-static-acceptance.ts` | Static AC-R/P-05/PR5/E-01 checks | Yes |
| `./scripts/phase-1-redirect-smoke.sh [base]` | HTTP redirect matrix (server running) | Yes (staging or local `next start`) |
| `npm run validate:system` | DB RPC/schema flows (RP backbone) | Yes on **staging** with `DATABASE_URL` |
| `npm run validate:replay` | Historical replay sample IDs | Yes on **staging** |

### 2.1 `validate:system` environment

```bash
DATABASE_URL="postgresql://..." \
VALIDATION_ARTIST_USER_ID="..." \
VALIDATION_GALLERY_USER_ID="..." \
VALIDATION_SECOND_OWNER_USER_ID="..." \
npm run validate:system | tee docs/v2/baselines/validate-system-$(date +%Y%m%d).json
```

Optional: `VALIDATION_ROLLBACK=1` for non-persistent flow steps.

### 2.2 Redirect smoke

```bash
npm run build && npx next start -p 3000 &
./scripts/phase-1-redirect-smoke.sh http://127.0.0.1:3000
```

---

## 3. Acceptance criteria matrix (spec §3)

Record **PASS / FAIL / WARN / STAGING** per row on the RC sign-off sheet.

### 3.1 StudioShell (AC-S1–S7)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-S1 | `StudioShell` on all three dashboards + role layout wrappers | Code review + staging visual |
| AC-S2 | Nav from `lib/studio-nav`, not duplicate `useMemo` in pages | `phase-1-static-acceptance` + grep |
| AC-S3 | Personal Archive in sidebar (all roles) | Staging nav |
| AC-S4 | Unified activity feed on account/archive/registry signed-in shells | Staging |
| AC-S5 | Collector sidebar feed | Staging |
| AC-S6 | Silver atmosphere (certificates/ownership) | Staging visual |
| AC-S7 | Mobile tab bar parity | Staging device |

### 3.2 Terminology (AC-T1–T4)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-T1 | No “Artist account” / “Gallery dashboard” in updated chrome | Grep / staging |
| AC-T2 | Creative / Organisation / Collector in header, get-started, account | Staging |
| AC-T3 | API payloads still `artist` / `gallery` / `collector` | Network tab |
| AC-T4 | DE/FR/JA keys for role chrome | `locale-messages.ts` |

### 3.3 Routes (AC-R1–R7)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-R1 | Canonical studio routes render when authenticated | Staging + static P-05 |
| AC-R2 | Legacy URLs → canonical (one hop) | `phase-1-redirect-smoke.sh` |
| AC-R3 | `homePathForRole` canonical | Static script |
| AC-R4 | Post-login → correct `/studio/{role}` | Staging login flows |
| AC-R5 | Unauthenticated `/studio/*` → login + `next` | Staging (layout guard) |
| AC-R6 | Wrong role → own home | Staging |
| AC-R7 | Incomplete onboarding → `/onboarding` | Staging |

### 3.4 Navigation (AC-N1–N4)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-N1 | Section nav from account/archive → dashboard section | Staging sessionStorage |
| AC-N2 | Archive nav highlights on `/studio/archive` | Staging |
| AC-N3 | Account footer active on `/studio/account` | Staging |
| AC-N4 | Sign-in/out return path | Staging per role |

### 3.5 Registry preservation (AC-P1–P4)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-P1 | RP-1–RP-14 on staging | Manual checklist §4.5 |
| AC-P2 | `validate:system` pass | JSON baseline archived |
| AC-P3 | No new RPC console errors during smoke | Staging browser |
| AC-P4 | Public `/registry`, `/artwork` unchanged | Staging URLs |

### 3.6 Migrations (AC-M1–M3)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-M1 | Five required migrations on prod before prod deploy | Migration log |
| AC-M2 | Personal archive API not PGRST205 | `/api/personal-archive/list` |
| AC-M3 | Account lifecycle APIs | `/api/account/status`, export |

**Required migrations:** `20260531120000`, `20260531140000`, `20260531150000`, `20260531160000`, `20260531160100` (see spec §2.6.1).

---

## 4. Staging manual checklist (spec §4)

Copy to PR / ticket and check off on staging deploy.

### 4.1 Studio chrome (§4.2)

- [ ] Creative: 5 sections, representation/ownership dots
- [ ] Collector: workspace, works, attention
- [ ] Organisation: 6 sections, invite/verification dots
- [ ] Account save in shell
- [ ] Archive list/archive/remove (migration applied)
- [ ] Signed-in `/registry` role shell unchanged
- [ ] Activity feed i18n after ownership/certificate action
- [ ] Mobile nav scroll / reachability

### 4.2 Redirects (§4.4)

| From | To |
|------|-----|
| `/studio` | `/studio/creative` |
| `/collector-studio` | `/studio/collector` |
| `/institutional-studio-dashboard` | `/studio/organisation` |
| `/account` | `/studio/account` |
| `/personal-archive` | `/studio/archive` |

- [ ] One hop, permanent
- [ ] `?next=/collector-studio` → canonical after auth
- [ ] Sign-out `next` per role (StudioShell)

### 4.3 Registry smoke RP-1–RP-14 (§4.5)

- [ ] RP-1 … RP-14 (see spec §2.5.2 table)

### 4.4 Production deploy gate (§4.7)

- [ ] AC-M1 migrations on prod
- [ ] PostgREST schema reload
- [ ] Prod smoke: RP-1, RP-2, RP-4, RP-9, RP-10
- [ ] Prod redirect spot-check
- [ ] Rollback plan (app revert only)

---

## 5. PR6 deliverables (this branch)

| Artifact | Path |
|----------|------|
| Acceptance gate doc | `docs/v2/phase-1-acceptance-gate.md` |
| Static acceptance runner | `scripts/phase-1-static-acceptance.ts` |
| Redirect smoke script | `scripts/phase-1-redirect-smoke.sh` |
| Baseline archive dir | `docs/v2/baselines/README.md` |
| RC sign-off report | `docs/v2/phase-1-rc-signoff.md` (filled per run) |

---

## 6. RC sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Engineering | | | |
| QA | | | |
| Product | | | |

**RC approved for production deploy:** ☐ Yes ☐ No (blockers: _______________)

---

## 7. Git tags (Phase 1 sequence)

| Tag | Contents |
|-----|----------|
| `checkpoint-phase1-routes` | PR4 |
| `checkpoint-phase1-auth` | PR5 |
| `checkpoint-phase1-rc` | Optional — tag when §2–4 pass on staging (recommended after PR6 merge) |
