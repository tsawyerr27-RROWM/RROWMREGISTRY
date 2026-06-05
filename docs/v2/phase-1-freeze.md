# Phase 1 Studio Foundation — Scope Freeze

**Document status:** FROZEN  
**Frozen:** 31 May 2026  
**Authority:** [Phase 1 Implementation Specification](./phase-1-studio-foundation-spec.md) (LOCKED), [Phase 1 Production Signoff](./phase-1-production-signoff.md), [Product Blueprint v1.1](./product-blueprint-v1.1.md) (APPROVED)  
**Purpose:** Record the **exact scope delivered** in Phase 1 Studio Foundation. This is the post-certification scope snapshot — not a planning document. Changes require explicit unlock per [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md).

**Production checkpoint:** `checkpoint-phase1-production` @ `d5e6c4e`  
**Production URL:** https://rrowm-registry.vercel.app

---

## Executive summary

Phase 1 delivered a **unified Studio layer** for authenticated participants (Creative, Organisation, Collector) with canonical `/studio/*` routes, product terminology, namespace auth guard, and **zero changes** to registry ledger behaviour, RPC contracts, or RLS semantics.

**The Field is outside Phase 1 scope.** No Field Explorer, Field Record routes, Field Opportunities, Practice objects, Sector taxonomy, Projects, Briefs, or Programmes were delivered. Surface label *The Field* exists in terminology only for future chrome consistency.

---

## 1. Final architecture

### 1.1 Layer model

```
┌─────────────────────────────────────────────────────────────┐
│  Public surfaces (unchanged URLs)                           │
│  /registry, /artwork, /verify, public profiles, marketing   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Authenticated Studio namespace (/studio/*)                 │
│  app/studio/layout.tsx — session + role + onboarding guard  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  /studio/creative    /studio/collector    /studio/organisation
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                    StudioShell orchestrator
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  WorkspaceShell      lib/studio-nav/*       Unified activity feed
  (layout primitive)  (role nav builders)    (sidebar)
        │
  Role layouts: ArtistWorkspaceShellLayout,
                CollectorWorkspaceShellLayout,
                GalleryWorkspaceShellLayout
  (thin wrappers — also used on signed-in /registry, /account paths)
```

### 1.2 Component stack (delivered)

| Layer | Location | Role |
|-------|----------|------|
| **StudioShell** | `components/Studio/StudioShell.tsx` | Orchestrator: role, nav, activity, footer |
| **WorkspaceShell** | `components/Studio/WorkspaceShell.tsx` | Layout primitive (sidebar, mobile tabs, slots) |
| **Role shell layouts** | `*WorkspaceShellLayout.tsx` | Creative / Collector / Organisation wrappers |
| **Nav registry** | `lib/studio-nav/` | Central nav configs and builders per role |
| **Terminology** | `lib/studio-terminology.ts`, locale keys | Presentation labels only |
| **Personal Archive nav** | `lib/personal-archive-nav.ts` | Shared archive nav item |

### 1.3 Registry preservation rule (frozen)

Phase 1 **did not**:

- Alter `ownership_events`, `value_events`, `verification_events`, or certificate RPC logic
- Change RLS policies on ledger tables
- Rename database roles or profile tables (`artist`, `gallery`, `collector`)
- Remove or bypass RPCs for register, verify, issue certificate, provenance, or representation

UI refactors **call the same RPCs and APIs** as pre–Phase 1.

### 1.4 Checkpoints on ancestry

| Tag | Meaning |
|-----|---------|
| `checkpoint-phase1-terminology` | Product language freeze applied |
| `checkpoint-phase1-routes` | Canonical `/studio/*`; redirect matrix |
| `checkpoint-phase1-auth` | Namespace layout auth guard (AG-1–3) |
| `checkpoint-phase1-rc` | Code-complete RC; static acceptance |
| **`checkpoint-phase1-production`** | **Production-certified** @ `d5e6c4e` |

---

## 2. Studio routes

### 2.1 Canonical authenticated routes (delivered)

| Role / surface | Canonical URL | Legacy redirect source |
|----------------|---------------|------------------------|
| Creative dashboard | `/studio/creative` | `/studio`, `/dashboard` |
| Collector dashboard | `/studio/collector` | `/collector-studio` (exact path) |
| Organisation dashboard | `/studio/organisation` | `/institutional-studio-dashboard`, `/gallery-dashboard` |
| Account (all roles) | `/studio/account` | `/account` |
| Personal Archive (all roles) | `/studio/archive` | `/personal-archive` |
| Account restore | `/studio/account/restore` | `/account/restore` |

**App structure:** `app/studio/{creative,collector,organisation,account,archive}/`; root `app/studio/page.tsx` redirects to `/studio/creative`.

### 2.2 Auth guard scope (`app/studio/layout.tsx`)

| Rule | Behaviour |
|------|-----------|
| **AG-1** | No session → redirect to `/login?next=<current>` |
| **AG-2** | Role mismatch → redirect to role home (e.g. collector on `/studio/creative` → `/studio/collector`) |
| **AG-3** | Onboarding incomplete → `/onboarding` via `getOnboardingRedirectPath` |
| **AG-4** | Public routes **excluded** — no guard on `/registry`, `/artwork`, marketing |

### 2.3 Explicitly unchanged paths (Phase 1)

| Path | Reason |
|------|--------|
| `/registry`, `/registry/[registry_id]`, `/artwork/[registry_id]`, `/verify/[id]` | Public Registry; signed-in shell preserved |
| `/collector-studio/[slug]`, `/collector-studio/artwork/[registry_id]`, claim/provenance flows | Public collector catalogue and flows |
| `/institutional-studio/[slug]`, `/artist/[artist_id]` | Public profiles |
| `/onboarding`, `/login`, `/signup`, `/admin`, `/internal/*` | Pre-Studio / ops |
| `/api/account/*`, `/api/personal-archive/*` | API paths unchanged (no `/api/studio/*` migration) |

**Authoritative inventory:** [phase-1-route-migration-matrix.md](./phase-1-route-migration-matrix.md) (FROZEN).

---

## 3. Registry scope

### 3.1 What Phase 1 includes for Registry

| Capability | Status | Notes |
|------------|--------|-------|
| Public explorer | **Delivered** | `/registry` — list, filters, pagination |
| Public record pages | **Delivered** | `/registry/[registry_id]`, `/artwork/[registry_id]` |
| Certificate verification | **Delivered** | `/verify/[id]` |
| Signed-in Registry chrome | **Delivered** | Role shell on authenticated registry views (Phase 2 may refactor layout) |
| Ledger RPCs | **Unchanged** | Register, verify, issue certificate, provenance, representation |
| Registry preservation smoke | **Validated** | RP-1 manual **PASS** on production; RP-3–RP-13 RPC touchpoints **PASS** |

### 3.2 What Phase 1 excludes for Registry

- `/api/registry/*` namespace migration (optional follow-up)
- Removing `SignedInCatalogueShellLayout` from `/registry` (Phase 2)
- Field Record / Field Explorer routes
- Schema or RLS changes to ledger tables

### 3.3 P0 migrations applied (production)

| Migration | Purpose |
|-----------|---------|
| `20260531120000_account_lifecycle.sql` | Account status, export, deletion |
| `20260531140000_registry_integrity_hardening.sql` | Ledger hardening |
| `20260531150000_registry_audit_followup.sql` | Cert RLS, dispute stake, invite RPC |
| `20260531160000_personal_archive.sql` | Personal archive tables |
| `20260531160100_personal_archive_postgrest_reload.sql` | PostgREST schema reload |

---

## 4. Terminology layer

Per [product-language-freeze.md](./product-language-freeze.md) (FROZEN):

### 4.1 Product surfaces (public labels)

| Surface | Public label | Phase 1 delivery |
|---------|--------------|------------------|
| Studio | **Studio** | Full routes and chrome |
| Registry | **Registry** | Full public explorer and records |
| **The Field** | **The Field** | **Label only — no routes or functionality** |

### 4.2 Participant labels (public)

| DB role | Public label | Legacy UI term |
|---------|--------------|----------------|
| `artist` | **Creative** | Artist |
| `gallery` | **Organisation** | Gallery, institutional studio |
| `collector` | **Collector** | Collector |

### 4.3 Implementation rules (frozen)

- **Presentation only** — `lib/studio-terminology.ts` and locale keys; no DB column, enum, or route segment renames
- **Internal identifiers unchanged** — `artist`, `gallery`, `collector`, table names, RPC names
- **Chrome scope** — header, signup, get-started, account role displays, workspace nav, welcome modals

---

## 5. Authentication model

| Aspect | Phase 1 behaviour |
|--------|-------------------|
| **Provider** | Supabase Auth (session JWT) |
| **Studio protection** | `app/studio/layout.tsx` — all `/studio/*` require authenticated session |
| **Login redirect** | Unauthenticated → `/login?next=<encoded path>` |
| **Post-auth routing** | `homePathForRole`, `resolvePostAuthRedirectPath` → canonical `/studio/{creative\|collector\|organisation}` |
| **Role enforcement** | Layout-level role mismatch redirect to correct studio home |
| **Onboarding gate** | Incomplete onboarding → `/onboarding` before studio access |
| **Public access** | Registry, artwork pages, marketing — no studio guard |
| **RPC authorization** | Unchanged — `auth.uid()` and existing RLS on production paths |

---

## 6. Account model

| Aspect | Phase 1 behaviour |
|--------|-------------------|
| **Account page** | `/studio/account` (redirect from `/account`) |
| **Roles** | Single `actor_profiles.role`: `artist` \| `gallery` \| `collector` — displayed as Creative / Organisation / Collector |
| **Personal Archive** | `/studio/archive` — add/remove/list via `/api/personal-archive` |
| **Account lifecycle** | Status, export, deletion request via `/api/account/*` (migration `20260531120000`) |
| **Account restore** | `/studio/account/restore` — deletion email CTA path |
| **Activity feed** | Unified sidebar feed on account, archive, and signed-in registry layouts |
| **Footer links** | Account + Browse Registry from studio shell |

**No Phase 1 changes to:** auth.users schema, role enum, permission model, or multi-role accounts.

---

## 7. Production certification reference

| Document | Role |
|----------|------|
| [phase-1-production-signoff.md](./phase-1-production-signoff.md) | Formal production certification record |
| [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) | Waivers for `validate:system` and `validate:replay` |
| [phase-1-rc-signoff.md](./phase-1-rc-signoff.md) | RC + production gate execution |
| [post-certification-remediation.md](./post-certification-remediation.md) | Post-cert engineering backlog |

### Operator validation (production — PASS)

| Item | Result |
|------|--------|
| Production Studio | **PASS** |
| Production Registry | **PASS** |
| Creative Registration | **PASS** |
| Supabase Connectivity | **PASS** |
| RP-1 Manual Validation | **PASS** |
| Browser-extension noise | **Excluded** from failure analysis |
| Validation waiver | **Accepted** |

**Sign-off:** Engineering, QA, Product — 31 May 2026 ([phase-1-production-signoff.md](./phase-1-production-signoff.md) §5).

---

## 8. Production tag reference

| Field | Value |
|-------|-------|
| **Tag** | `checkpoint-phase1-production` |
| **Commit** | `d5e6c4e` — *Add Phase 1 validation waiver package* |
| **Date** | 31 May 2026 |
| **Remote** | Pushed to `origin` |
| **Message** | Phase 1 Studio Foundation: production-certified with validation waivers (see docs/v2/phase-1-validation-waiver.md) |

**Re-tag policy:** Do not move or force-update this tag without a new sign-off artifact. Documentation commits after `d5e6c4e` (sign-off, remediation roadmap, this freeze) do not invalidate certification.

**Recreate command (reference only — tag exists):**

```bash
git tag -a checkpoint-phase1-production d5e6c4e -m "Phase 1 Studio Foundation: production-certified with validation waivers (see docs/v2/phase-1-validation-waiver.md)"
git push origin checkpoint-phase1-production
```

---

## 9. Deferred items

Deferred work is **not** Phase 1 scope. Tracked in [post-certification-remediation.md](./post-certification-remediation.md).

### 9.1 Validation harness (waiver lift — R-1–R-4)

| Item | Blocks production? |
|------|-------------------|
| JWT transaction persistence in `validate:system` | No |
| SAVEPOINT handling for rollback validation | No |
| Replay validator `issued_at` / `created_at` alignment | No |
| Green `validate:system` / `validate:replay` baselines | No (waiver lift only) |

### 9.2 Registry data integrity (Workstream C)

| Item | Blocks production? |
|------|-------------------|
| Ownership mismatch on legacy seed artworks (`RROWM-001000`–`001004`) | No |
| Verification status mismatches on legacy rows | No |
| Historical data reconciliation | No |

### 9.3 Database reproducibility (Workstream D)

| Item | Blocks production? |
|------|-------------------|
| `register_artwork_atomic` in repo migrations (R-6) | No |
| `add_value_event` migration provenance | No |
| Baseline DDL reconciliation for greenfield Supabase | No |

### 9.4 QA and ops (optional / Phase 1.1)

| Item | Blocks production? |
|------|-------------------|
| RP-2, RP-5, RP-8, RP-14 manual production sessions | No |
| Production redirect smoke archive | No |
| Cron 401 / transactional email evidence | No |
| Automated RP-1 smoke script signature fix | No |

### 9.5 Phase 2+ product scope (explicitly not Phase 1)

- **The Field** — Explorer, Field Record, Field Opportunities
- Practice object, Sector taxonomy, capabilities
- Projects, Briefs, Programmes
- `/api/registry/*` and `/api/studio/*` namespace migration
- Removing signed-in catalogue shell from `/registry`
- Teams, collaborations, patron, API product
- Database schema changes for V3

---

## 10. The Field — outside Phase 1 scope

**Explicit statement:**

> **The Field is outside Phase 1 scope.**

Phase 1 may display the surface label *The Field* in terminology and locale strings for future chrome consistency ([product-language-freeze.md](./product-language-freeze.md)). Phase 1 **does not deliver**:

- Field Explorer or Field Record routes
- Field Opportunity objects or workflows
- Practice, Sector, Project, Brief, or Programme features
- Any user-facing Field functionality or navigation

Field work requires Phase 2+ planning, Blueprint alignment, and explicit Spec unlock — not amendment of this freeze document alone.

---

## Unlock procedure

| Action | Required approval |
|--------|-------------------|
| Amend delivered scope recorded here | Phase 1 Spec unlock + engineering lead + product sign-off |
| Expand Studio routes or Registry behaviour | Phase 1 Spec unlock (or Phase 2 spec) |
| Introduce Field functionality | Blueprint amendment + new phase specification |
| Move `checkpoint-phase1-production` tag | New production sign-off artifact |

---

## Related documents

| Document | Status | Role |
|----------|--------|------|
| [phase-1-studio-foundation-spec.md](./phase-1-studio-foundation-spec.md) | LOCKED | Original deliverable specification |
| [phase-1-route-migration-matrix.md](./phase-1-route-migration-matrix.md) | FROZEN | Route inventory |
| [product-language-freeze.md](./product-language-freeze.md) | FROZEN | Terminology |
| [phase-1-production-signoff.md](./phase-1-production-signoff.md) | ACTIVE | Certification |
| [post-certification-remediation.md](./post-certification-remediation.md) | ACTIVE | Deferred engineering |
