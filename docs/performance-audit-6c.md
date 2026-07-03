# Sprint 6C — Performance audit

**Date:** 2026-07-03  
**Scope:** Critical public, auth, studio, and registry routes  
**Targets:** LCP &lt; 2.5s · CLS &lt; 0.1 · INP &lt; 200ms · TBT &lt; 200ms

## Method

Static analysis from `next build` output, route architecture review, and known rendering patterns. **Lighthouse scores below are estimates** — run production Lighthouse against staging after deploy for authoritative numbers.

```bash
npm run build
# Then against deployed preview:
# npx lighthouse https://<preview>/field --preset=desktop --only-categories=performance
```

## Route scores (estimated)

| Route | LCP | CLS | INP | TBT | Notes |
|-------|-----|-----|-----|-----|-------|
| `/` | Good | Good | Good | Moderate | Landing OS section + hero; mostly static |
| `/field` | Moderate | Good | Moderate | Moderate | Server fetches + client constellation canvas |
| `/field/explorer/records` | Moderate | Good | Good | Low | List-heavy; pagination helps |
| `/registry/[id]/ledger` | Moderate | Good | Moderate | Moderate | Chronology + trust panels; dynamic |
| `/login` | Good | Good | Good | Low | Auth shell; minimal JS |
| `/signup` | Good | Good | Good | Low | Invite preview fetch on token flows |
| `/studio/creative` | Poor–Moderate | Good | Moderate | High | Large page bundle (~monolith) |
| `/studio/collector` | Poor–Moderate | Good | Moderate | High | Portfolio fetches + gallery toggle |
| `/studio/organisation` | Moderate | Good | Moderate | Moderate | Verification command + lists |
| `/studio/deals` | Moderate | Good | Moderate | Moderate | Deal workspace panels |

**Legend:** Good = likely within target · Moderate = watch · Poor = likely exceeds TBT/LCP target

## Bundle size (from build analysis)

| Surface | First-load JS (approx.) | Risk |
|---------|-------------------------|------|
| Shared app shell | ~150–200 kB | Baseline Next + Supabase client |
| Field signature | +framer-motion, canvas components | Medium — animation + intel hooks |
| Studio creative | Largest studio route | **High** — single large client page |
| Studio collector | Large + holdings gallery | **High** |
| Registry ledger | Provenance chronology + recharts adjacency | Medium |
| Certificate | Document frame + QR | Low–medium |

Run `npm run build` and inspect `.next/analyze` or build route table for exact numbers after each release.

## Likely bottlenecks

### Field (`/field`)

- **Parallel server fetches** on home: `fetchFieldSignatureStats`, `fetchFieldCulturalSignals`
- **Client canvas / constellation** (`FieldConstellationNetwork`, `FieldSignalCanvas`) — paint + idle animation
- **Intel hooks** (`useFieldIntelligence`, `useFieldConstellationBoot`) — multiple listeners

**Fixes (prioritized):**

1. Defer non-critical rails below fold with `dynamic(..., { ssr: false })` for canvas
2. Respect `prefers-reduced-motion` (partially in place) — disable constellation on reduced motion
3. Cache field stats at edge (short TTL) once telemetry confirms traffic

### Studio

- **Oversized route bundles** — `app/studio/creative/page.tsx` is a monolith
- **Multiple parallel Supabase queries** on mount per role dashboard
- **Recharts** imported in insight modals

**Fixes (prioritized):**

1. Split creative/collector pages into section components with `dynamic()` imports
2. Consolidate mount fetches into single API route per studio role
3. Lazy-load `DataInsightModal` and chart dependencies

### Registry / certificate

- **Chronology rendering** — long provenance lists without virtualization
- **Certificate OG** — server-side image generation (not on critical path for page LCP)

**Fixes (prioritized):**

1. Virtualize ownership chronology when &gt; 20 entries
2. Split trust panel vs chronology into streaming boundaries

## Recommended measurement cadence

1. **Every release:** `npm run build` — watch First Load JS for studio routes
2. **Weekly (staging):** Lighthouse on `/`, `/field`, `/studio/creative`, `/registry/[sample]/ledger`
3. **After Field changes:** Chrome Performance trace on mobile viewport

## Telemetry linkage (6C.1)

Use `telemetry_events` to correlate slow surfaces with drop-off:

```sql
select surface, event_name, count(*)
from telemetry_events
where created_at > now() - interval '7 days'
group by 1, 2
order by 3 desc;
```

Pair with `runtime_errors` for error-induced abandonment on the same routes.
