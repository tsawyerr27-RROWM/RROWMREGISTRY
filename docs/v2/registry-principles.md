# Registry Principles

**Sprint 7A.3 — constitutional product reference**

This document defines the principles against which every future product decision should be evaluated. It is not branding, marketing, or investor messaging.

**Status:** DRAFT — editorial definition only.

---

## Document hierarchy

```
Registry Principles          ← this document (highest authority)
        ↓
Registry Voice               docs/v2/registry-voice.md
        ↓
Experience Blueprint         docs/v2/founding-registry-experience-blueprint.md
        ↓
Design System                docs/rc1-design-system-freeze.md
        ↓
Implementation               code, schema, routes
```

When documents conflict, **Registry Principles prevail**. Voice, experience, and visual language must align with these principles — not the reverse.

---

## How to use this document

- **Product:** Evaluate features before specification.
- **Design:** Evaluate layouts, motion, and colour before mockup.
- **Engineering:** Evaluate scope, schema, and UX side-effects before build.
- **Copy:** Evaluate strings against Voice *through* these principles.

Each principle includes a platform review (RC1 / Day Zero baseline). Reviews describe current state — not implementation tasks.

---

## 1. The Record Comes First

**Principle.** The canonical Registry record is the product. Studio, Field, deals, certificates, and presence pages are surfaces on that record.

**Why.** Cultural works need one persistent truth that outlives any interface, organisation, or custodian.

**Implications.**
- Features must create or strengthen ledger events — not parallel data silos.
- UI navigates to records; it does not replace them.
- Registry ID is the primary user-facing identifier.

**Examples.** Registration issues a Registry ID; chronology is append-only; public record reads from the same source as Studio.

**Anti-patterns.** Feature-specific databases; editable history; screens that never link to the public record; “workspace data” without ledger backing.

| | |
|---|---|
| **Strengths** | One artwork per Registry record; `/field/record/[id]` and ledger routes; registration outcome surfaces Registry ID; semantic signals map to registry events. |
| **Inconsistencies** | Some Studio lists feel like local inventories before record linkage; legacy `/collector-studio` paths alongside `/studio`; cache-derived ownership history (documented, remediated paths exist). |
| **Opportunities** | Deeper record-first navigation from every Studio action; chronology preview on all filing outcomes; unified “open record” affordance everywhere. |

---

## 2. Trust Is Earned Through Evidence

**Principle.** The Registry records verified events and attestations — not bare assertions presented as fact.

**Why.** Cultural markets, custody disputes, and institutional due diligence require evidentiary tiers, not profile claims.

**Implications.**
- Trust tiers (filed → self-attested → verified) must be visible and honest.
- Certificates follow verification; they are not purchasable badges.
- Language distinguishes *on file* from *verified*.

**Examples.** Self-attestation RPC; institutional verification queue; certificate trigger on tier change; trust tooltips on Creative slabs.

**Anti-patterns.** “Verified” badges without ledger events; certificates before attestation; marketing that implies all records are equally trusted.

| | |
|---|---|
| **Strengths** | `trust.tier.*` copy; verification events table; org verification slab; Field verify hub; mono seal for certification. |
| **Inconsistencies** | Org “Complete / Incomplete” readiness language implies checklist trust; some toasts say “Success”; welcome copy historically over-promised automatic certificates. |
| **Opportunities** | Clearer tier progression in Registry Status; certificate eligibility stated before issuance; evidence-linked verification narrative on record pages. |

---

## 3. Stewardship Is Continuous

**Principle.** Ownership, authorship, and institutional representation are moments in an ongoing chronology — not one-time setup.

**Why.** Works move across custodians; authorship persists beyond sale; institutions deepen records over years.

**Implications.**
- Authorship remains in the Creative catalogue after transfer.
- Holders change; the record does not reset.
- Deals, transfers, amendments, and valuations are sequential filings.

**Examples.** Sold works stay in authored catalogue; ownership filter semantics; provenance chronology; collector confirm-receipt loop.

**Anti-patterns.** Removing sold works from authorship view; treating ownership as a profile field; “reset collection” without ledger correction filings.

| | |
|---|---|
| **Strengths** | Append-only chronology rules in product context; acquisition loop; deals command center; representation amendments. |
| **Inconsistencies** | Value chronology phase rules are complex — easy to misread in UI; some empty states still imply one-time registration only. |
| **Opportunities** | Stewardship-oriented Registry Status lines; clearer post-sale Creative vs Collector responsibilities; long-horizon language in moments framework. |

---

## 4. Documentation Creates Value

**Principle.** Filing, attestation, and verification are cultural infrastructure — not administrative overhead.

**Why.** The act of documenting is what produces trust, resale confidence, and institutional memory.

**Implications.**
- Filing flows should feel consequential (weight, language, motion).
- Metadata fields serve the record, not form completion metrics.
- Empty states invite first filing — not “get started” gamification.

**Examples.** Filing sheets, registration modals, institutional empty states (`ExperienceEmptyState`), `studio.register.outcome.*` language.

**Anti-patterns.** Treating registration as a quick upload step; minimising required fields without explanation; admin busywork framing.

| | |
|---|---|
| **Strengths** | v2 filing-sheet surfaces; ledger-append motion tokens; Sprint 7A.1 empty-state CTAs toward first filing. |
| **Inconsistencies** | Org registration requires image while Creative does not — correct rule, under-explained; some forms still use “Submit”. |
| **Opportunities** | Registry Moments for every major filing; inline explanation of why institution filing is stricter; documentation-as-value copy on Field. |

---

## 5. Publication Is Optional

**Principle.** Private documentation must be possible without public exposure. Visibility is a deliberate filing choice.

**Why.** Collectors, estates, and working artists need custody records without market exposure.

**Implications.**
- Default to private presence where appropriate.
- Public Field layers read only what visibility rules permit.
- Never require public profile to use Studio.

**Examples.** Collector anonymous/public toggles; artwork visibility levels; private declared values; Field reads public layer only.

**Anti-patterns.** Gating core filing behind public profile; dark patterns toward publicity; “complete your public page” as blocking onboarding.

| | |
|---|---|
| **Strengths** | Visibility levels on registration; collector privacy settings; private-by-default intro copy. |
| **Inconsistencies** | Profile completeness framing in places; “Explore” marketing vs private stewardship; org public presence pressure on hero. |
| **Opportunities** | Explicit “record may remain private” in onboarding; publication as optional second success, not prerequisite. |

---

## 6. Individuals and Institutions Share One Registry

**Principle.** Creatives, Collectors, and Organisations operate on the same ledger model — different capabilities, same chronology semantics.

**Why.** Provenance crosses actors; splitting models would fracture the record.

**Implications.**
- Events use shared vocabulary (transfer, attestation, verification).
- Organisation filings attribute to institution without inventing a parallel record type.
- Role is capability routing — not a separate product.

**Examples.** Shared ownership_events; org register-institution-artwork; invitations deepen attestations; Field shows all participant types.

**Anti-patterns.** Institution-only record types; collector “lightweight” records without chronology; separate certificate systems per role.

| | |
|---|---|
| **Strengths** | Unified registry schema; shared semantic signals; Field explorers for all participant types. |
| **Inconsistencies** | Single-role-per-account (RC1) forces multi-hat operators to multiple accounts; `gallery.*` namespace vs Organisation UI label. |
| **Opportunities** | Cross-role chronology visibility on public records; institution–creative linking language consistency; future multi-capability architecture aligned to one ledger. |

---

## 7. Calm Builds Trust

**Principle.** The Registry communicates with clarity and restraint. Significance is conveyed through permanence, not excitement.

**Why.** Financial and cultural stewardship interfaces that shout erode institutional credibility.

**Implications.**
- No celebration UI, confetti, badges, or exclamation marks.
- Slow, deliberate motion; respect `prefers-reduced-motion`.
- Colour maps to registry meaning — not decoration.

**Examples.** `ledger-append` motion; semantic signal tokens; registration outcome slab (no modal); registrar tone in Voice doc.

**Anti-patterns.** Success toasts with praise; gamified progress; amber/green “health scores” without registry meaning; social-style reactions.

| | |
|---|---|
| **Strengths** | RC1 design freeze institutional palette; semantic-signals rule; consequence-feedback patterns; 7A.1 removed celebratory patterns. |
| **Inconsistencies** | `gallery.status.complete`, `verifySuccess`, landing “portfolio management” phrasing; insight charts can feel analytics-SaaS. |
| **Opportunities** | Full voice pass; Registry Moments replacing success language; insight reframed as “record health on file”. |

---

## 8. Reduce Cognitive Load

**Principle.** Every screen should present one primary purpose and, where possible, one primary action.

**Why.** Registry work is consequential; competing CTAs create ambiguity and filing errors.

**Implications.**
- Studio home: one hero primary; Registry Status (future) replaces scattered secondaries.
- Section nav switches context — don’t duplicate competing primaries in-body.
- Progressive disclosure for advanced filings.

**Examples.** Sprint 7A.1 single CTA empty states; role-specific welcome modal final actions; deal command center hierarchy.

**Anti-patterns.** Hero with three equal primaries; empty states with no action; dashboard grids of equal-weight cards.

| | |
|---|---|
| **Strengths** | Studio section switcher; 7A.1 collector empty routing; organisation verification-first hierarchy (6D). |
| **Inconsistencies** | Creative overview still dense (metrics + representation + ownership blocks); multiple pending queues without single status line; intro modal multi-step before first filing. |
| **Opportunities** | Registry Status as single contextual line; collapse hero secondaries until first success; section-specific primary enforcement in reviews. |

---

## 9. History Over Activity

**Principle.** The platform values enduring records and chronology over engagement metrics and ephemeral feeds.

**Why.** The Registry is an archive, not a social timeline. What matters is what was filed and when — not what happened lately in the app.

**Implications.**
- Chronology and ledger views precede activity feeds.
- Notifications reference filings, not vanity metrics.
- Sort defaults: recency of *events*, not “trending”.

**Examples.** Provenance chronology; ownership ledger modal; verification events; append-only activity tied to artwork_id.

**Anti-patterns.** Social feed; follower counts as trust proxy; “recent activity” without record linkage; streaks or usage gamification.

| | |
|---|---|
| **Strengths** | Chronology components; ledger routes; collector activity preview is typographic, not feed chrome; no likes/follows. |
| **Inconsistencies** | Sidebar activity previews can feel feed-like without chronology depth; insight charts emphasise aggregates over filings; “latest activity” toasts. |
| **Opportunities** | Terminology shift from activity → filings; chronology-first defaults in Studio sidebars; public record highlights milestones not pings. |

---

## 10. Capability Over Complexity

**Principle.** Introduce functionality only when it meaningfully strengthens stewardship of the record.

**Why.** Feature surface area is trust surface area — every path must be maintainable and semantically correct for decades.

**Implications.**
- Prefer wiring existing primitives over new subsystems.
- Defer recommendation engines, gamification, and multi-role until architecture supports them honestly.
- Schema changes require registry-semantics review.

**Examples.** 7A.1 reused `ExperienceEmptyState`; certificate issuance via DB trigger; deals as structured transfer filings.

**Anti-patterns.** Feature flags for half-built registry semantics; CRM modules; marketplace discovery replacing Field; AI summaries without source citations.

| | |
|---|---|
| **Strengths** | RC1 scope discipline; blueprint explicitly defers multi-role and recommendation carousel; modular studio sections. |
| **Inconsistencies** | Deals + rights + opportunities + org ops — high capability surface for early cohort; some transitional routes duplicate flows. |
| **Opportunities** | Capability gating by registry maturity; principled deferral list in evaluation framework; simplify before expand per role. |

---

## 11. Consistency Creates Confidence

**Principle.** Visual language, interaction patterns, and editorial voice must reinforce the same registry meaning everywhere.

**Why.** Inconsistent terms or signals train users to distrust the ledger.

**Implications.**
- Semantic colour = registry event (see design system + signals rule).
- Voice terms locked in `registry-voice.md`.
- Same filing pattern: rail label → title → body → mono ID → CTA.

**Examples.** `v2-signal-bar--*` tokens; trust tier tooltips; Creative/Organisation/Collector studio heroes share slab vocabulary.

**Anti-patterns.** Blue for generic “info”; “Artist” in one surface and “Creative” in another; legacy list layouts beside v2 slabs without migration plan.

| | |
|---|---|
| **Strengths** | RC1 design freeze; semantic-signals workspace rule; studio-v2 primitives shared across roles. |
| **Inconsistencies** | Artist/Gallery strings in locale; Complete/Incomplete vs on-file language; transitional certificate route styling. |
| **Opportunities** | Voice pass + design audit linked to this principle; Registry Moments unify outcome presentation; single CTA verb list. |

---

## 12. Longevity Before Novelty

**Principle.** Prefer systems that remain valuable for decades over features driven by trends.

**Why.** Cultural records must survive platform fashions, vendor churn, and technology cycles.

**Implications.**
- Append-only history; corrections file forward.
- Exportable, citeable Registry IDs.
- Avoid web3 framing, NFT language, and hype-driven integrations.
- Document decisions in `docs/v2/` for succession.

**Examples.** Correction/amendment flows; certificate as durable document; SQL ledger as source of truth; Day Zero reset preserves auth/storage separation.

**Anti-patterns.** Rewritable history; platform-locked assets; trend-led UI redesigns without semantic gain; features that expire with a campaign.

| | |
|---|---|
| **Strengths** | Chronology immutability rules; amendment representation; institutional visual language resistant to startup tropes; ops docs for Day Zero. |
| **Inconsistencies** | Some marketing copy still trend-adjacent (“operating system” framing); mobile-app idioms in places. |
| **Opportunities** | Long-horizon export/citation story; formal archival partnerships language; principled integration bar in evaluation framework. |

---

## Registry Evaluation Framework

Before accepting a new feature, change, or integration, answer **yes** to all that apply. Any **no** requires explicit principle exception documentation.

### Record & trust

| Question | Pass criterion |
|----------|----------------|
| **Does it strengthen the record?** | Creates, links, or clarifies a canonical ledger event or Registry ID |
| **Does it reduce ambiguity?** | Makes authorship, custody, verification, or chronology clearer — not murkier |
| **Does it improve trust?** | Increases evidentiary quality or honest tier disclosure |
| **Does it respect stewardship?** | Treats participants as long-term custodians, not engagement targets |

### Experience & tone

| Question | Pass criterion |
|----------|----------------|
| **Does it preserve institutional tone?** | Calm, registrar voice — no celebration, gamification, or SaaS idioms |
| **Does it fit the Registry Voice?** | Uses preferred vocabulary; avoids avoided terms (`registry-voice.md`) |
| **Does it reduce cognitive load?** | One clear purpose; at most one primary action per surface |
| **Does it privilege history over activity?** | Chronology/filing-centred — not feed or vanity metrics |

### System fit

| Question | Pass criterion |
|----------|----------------|
| **Does it fit the Design System?** | Uses v2 primitives, semantic signals, filing sheets — no template SaaS patterns |
| **Does it avoid unnecessary complexity?** | Capability justified by stewardship; reuses existing flows where possible |
| **Does it preserve longevity?** | Append-only semantics maintained; no trend-locked or rewrite-history behaviour |
| **Is publication optional?** | Does not force public exposure for private stewardship |
| **Is it one Registry?** | Same ledger model for all roles; no parallel record types |

### Exception process

1. Name the principle in tension.
2. Document why the exception is necessary and time-bounded (if temporary).
3. Record in sprint notes or `docs/v2/DOCUMENT_GOVERNANCE.md`.
4. Revisit at next principle review.

---

## Governance

| Property | Value |
|----------|-------|
| Authority | **Highest** product reference |
| Amended by | Explicit principle review — not ad-hoc sprint copy |
| Cascades to | Voice → Blueprint → Design System → Implementation |
| Review cadence | After major architecture sprints; annually at minimum |
| RC1 baseline | Day Zero complete; Founding Registry cohort |

---

*If a feature cannot be described as something filed on the Registry, it does not belong in the Registry.*
