# Sprint 6C — Surface audit

**Date:** 2026-07-03  
**Status key:** **Modern** (v2 filing-sheet / archive language) · **Transitional** (mixed v2 + legacy patterns) · **Legacy** (pre-v2 SaaS patterns)

## Public & marketing

| Route | Status | Notes |
|-------|--------|-------|
| `/` | Modern | Landing pillars + OS section (6B.7C) |
| `/about` | Modern | Ecosystem grid refresh |
| `/get-started` | Modern | Institutional onboarding entry |
| `/contact` | Transitional | Functional; not primary focus |
| `/terms`, `/privacy`, `/disclaimer` | Transitional | Legal text surfaces |

## Auth

| Route | Status | Notes |
|-------|--------|-------|
| `/login` | Modern | 2-column AuthPageShell (6B.7C) |
| `/signup` | Modern | Shared auth shell; invite flows |
| `/signup/complete` | Transitional | Minimal loading state |
| `/reset-password` | Modern | Auth shell |
| `/onboarding` | Transitional | Role selection; functional |

## Field

| Route | Status | Notes |
|-------|--------|-------|
| `/field` | Modern | Field signature surface |
| `/field/explorer` | Modern | Hub + sub-nav |
| `/field/explorer/records` | Transitional | Filters modern; table density varies |
| `/field/explorer/creatives` | Transitional | Explorer list patterns |
| `/field/explorer/organisations` | Transitional | Explorer list patterns |
| `/field/record/[id]` | Modern | FieldRecordView + trust badge |
| `/field/opportunities` | Transitional | Opportunity explorer |
| `/field/verify` | Transitional | Verification entry |

## Registry & certificate

| Route | Status | Notes |
|-------|--------|-------|
| `/registry` | Transitional | Catalogue list |
| `/registry/[id]/ledger` | Modern | Trust tier strip, chronology v2 |
| `/certificate/[id]` | Modern | Document frame v2 |
| `/verify/[id]` | Transitional | Public verify flow |

## Studio

| Route | Status | Notes |
|-------|--------|-------|
| `/studio/creative` | Modern | Filing-sheet slabs (6B.7B) |
| `/studio/collector` | Modern | Ledger/gallery toggle (6B.7B) |
| `/studio/organisation` | Modern | Verification command (6B.6) |
| `/studio/deals` | Modern | Deal workspace v2 |
| `/studio/deals/new` | Transitional | Form-heavy |
| `/studio/inbox` | Transitional | Notifications panel |
| `/studio/account` | Legacy | Likely pre-v2 account chrome |
| `/studio/archive` | Transitional | Personal archive |
| `/studio/rights` | Transitional | Rights ledger |

## Internal & admin

| Route | Status | Notes |
|-------|--------|-------|
| `/admin` | Legacy | Admin login gate |
| `/internal/verify` | Transitional | Functional queue; not v2 polished |
| `/internal/analytics` | Modern | 6C.5 ops dashboard |
| `/internal/replay-debugger` | Legacy | Debug tooling |

## Legacy redirects / duplicates (cleanup candidates)

| Route | Status | Notes |
|-------|--------|-------|
| `/collector-studio/*` | Legacy | Redirect targets exist; deprecate |
| `/institutional-studio-dashboard` | Legacy | Superseded by `/studio/organisation` |
| `/account` | Legacy | Duplicate of `/studio/account` patterns |
| `/personal-archive` | Transitional | Standalone archive |

## Legacy pattern checklist

When auditing a route, flag:

- [ ] Generic feature cards with gradient backgrounds
- [ ] Default Tailwind button styles (no `v2-cta-*`)
- [ ] Shallow grid empty states (“No data yet”)
- [ ] Old modal chrome (no `ModalShell` v2)
- [ ] Tables without filing-sheet row treatment
- [ ] Decorative color not mapped to registry semantics

## Recommended sweep order

1. `/studio/account` + `/account` — high visibility for signed-in users
2. `/field/explorer/records` — public discovery
3. `/studio/inbox` — notification density
4. Legacy redirect surfaces — reduce maintenance surface
