# Registry Voice

**Sprint 7A.2 editorial style guide**

RROWM speaks as **cultural infrastructure** — an accession system, archive, and trusted registry. Every sentence should reinforce permanence, trust, and stewardship.

This document governs all user-facing copy: locale strings, onboarding, empty states, status lines, confirmations, errors, and marketing surfaces.

**Status:** DRAFT — editorial definition only. No UI implementation in 7A.2.

---

## Mission of the voice

The Registry Voice exists to make consequential actions feel **filed, recorded, and permanent** — never casual, never celebratory, never transactional in the SaaS sense.

When a user registers a work, confirms custody, or receives a certificate, they should understand:

1. Something has been **appended to the chronology** (not “saved” or “completed”).
2. The Registry is the **system of record**; Studio and Field are surfaces on that record.
3. Their role is **stewardship** — authorship, custody, verification, or institutional filing.

The voice should feel like correspondence from a museum registrar or trust archive: precise, calm, authoritative, and sparing with words.

---

## Core characteristics

| Characteristic | Meaning |
|----------------|---------|
| **Institutional** | Language of accession, filing, ledger, chronology — not app features |
| **Calm** | No urgency theatre, no hype, no exclamation marks |
| **Permanent** | Past tense and passive constructions where events are recorded facts |
| **Precise** | Specific registry terms (Registry ID, attestation, custody) over generic UI words |
| **Stewardship-centred** | User is a participant filing on the Registry, not a “user” completing tasks |
| **Understated** | Significance through restraint, not celebration |

---

## Tone

- **Default:** Neutral registrar — factual, respectful, unhurried.
- **Guidance:** Instructive but not patronising. Prefer “File…” / “Record…” over “You should…”.
- **Acknowledgement:** Quiet confirmation of ledger events — not praise.
- **Empty states:** Explain what will appear here and one filing path — never “No data yet”.
- **Errors:** State what failed and what remains on file — no blame, no apology theatre.

**Never:** playful, motivational, salesy, gamified, or social-media casual.

---

## Vocabulary

### Preferred terms (use consistently)

| Domain | Preferred |
|--------|-----------|
| Platform layer (private) | **Studio** |
| Platform layer (public) | **Field**, **Registry** |
| Work entity | **Work**, **record**, **Registry record** |
| Identifier | **Registry ID** |
| History | **Chronology**, **ledger**, **provenance** |
| Authorship proof | **Attestation**, **verification** |
| Ownership | **Custody**, **stewardship**, **holder**, **transfer** |
| Institution | **Organisation** |
| Creator role | **Creative** (not Artist in user-facing copy) |
| Custodian role | **Collector** |
| Filing action | **Register**, **file**, **record**, **confirm receipt** |
| Proof document | **Certificate** (Registry certificate) |
| Public listing | **Presence**, **public record**, **on file** |
| Invitation | **Invitation** (formal), not “invite link” in primary copy |

### Avoided terms (see full table below)

Success, Complete, Done, Dashboard, Upload, Submit, Task, Project, Portfolio (as product noun), Feed, Follower, Like, Explore (as CTA verb where “Browse” or “Open” suffices).

---

## Grammar

- **Prefer active voice for CTAs:** “Register artwork”, “Confirm receipt”, “Attest authorship”.
- **Prefer passive or past for recorded events:** “Filing recorded”, “Certificate issued to the ledger”, “Custody confirmed on the Registry”.
- **Use present tense for persistent state:** “One work is awaiting attestation”, “Three records require verification”.
- **Avoid second-person praise:** not “You did it”, “Your work is live”.
- **Avoid contractions in institutional copy** (Studio slabs, outcomes, status). Contractions acceptable in short helper text if clarity improves.
- **Numbers:** spell out one–nine in prose; use numerals in metrics and counts in status lines.
- **Articles:** “the Registry”, “the chronology”, “the ledger” — definite article reinforces canonical system.

---

## Sentence structure

- **Headlines:** Short, noun-led or event-led. “Work filed on the Registry.” Not “Registration successful!”
- **Body:** One idea per sentence. Max two clauses in UI body copy.
- **Status lines:** Single sentence. Subject + state + optional count. See Registry Status (Part B).
- **CTAs:** Verb + object. One action per button. No “Continue”, “Next”, “Get started” unless navigation is genuinely ambiguous.
- **Lists:** Parallel structure; lead with registry noun where possible.

---

## Reading level

- Target **plain institutional English** — approximately Year 10–12 reading level.
- Technical terms (attestation, chronology, provenance) are **allowed and expected** when they carry registry meaning; define once in context if first exposure.
- Avoid jargon that belongs to SaaS (workflow, onboarding checklist, dashboard widget) or social platforms.

---

## Capitalisation

| Element | Rule | Example |
|---------|------|---------|
| **Registry** | Capitalise when referring to RROWM as institution/system | the Registry, Registry ID |
| **Studio / Field** | Capitalise as product layer names | Creative Studio, The Field |
| **Role names** | Capitalise | Creative, Collector, Organisation |
| **CTAs** | Sentence case | Register artwork |
| **Section titles** | Title case or display serif — match existing v2 type scale | Works on file |
| **Mono labels / rails** | ALL CAPS for rails only (`FILING RECORDED`) | Per existing `v2-type-mono` |
| **Trust tiers** | Sentence case in UI | Filed, Self-attested, Verified |

Do not capitalise generic words for emphasis (no “Official Certificate” unless formal document title).

---

## Verb choices

| Intent | Preferred verbs |
|--------|----------------|
| Create record | **register**, **file**, **record** |
| Add to chronology | **append**, **file**, **log** |
| Authorship | **attest**, **verify**, **authenticate** (institutional) |
| Ownership | **claim**, **confirm receipt**, **transfer**, **assign custody** |
| Publish | **publish** (opportunities, presence) — not “go live” |
| Dismiss UI | **Dismiss**, **Return to studio** — not “OK”, “Got it” |
| Navigation | **Open**, **View**, **Browse** — not “Explore” in Studio CTAs |
| Form actions | **Register artwork**, **Send invitation** — not **Submit** |
| Media | **Attach image**, **Add image** — not **Upload** |

---

## Status language

Status describes **registry state**, not UI state or user progress.

| Instead of | Use |
|------------|-----|
| Complete | **On file**, **Verified**, **Recorded**, **Issued** |
| Incomplete | **Awaiting attestation**, **Requires verification**, **Not yet on file** |
| Ready | **Eligible for verification**, **Ready to file** (sparingly) |
| Needs attention | **Requires attention**, **Awaiting response** |
| Pending | **Awaiting [specific event]** — always name the event |
| In progress | **Filing in progress**, **Transfer pending** |

Organisation integrity/readiness panels should migrate from “Complete / Incomplete” to registry-specific states (see Language Audit).

---

## Confirmation language

Confirmations acknowledge **ledger append** — visible, calm, dismissible.

**Pattern A — Event + identifier**
> Filing recorded. Registry ID: RROWM-…

**Pattern B — Record state**
> Work on file — chronology open.

**Pattern C — Next filing step (secondary line only)**
> Authorship attestation may be filed next.

**Avoid:** Success, Done, Completed, Great job, Congratulations, You're all set.

Existing strong example: `studio.register.outcome.*` (“Filing recorded”, “Work filed on the Registry”).

---

## Warning language

Warnings name **registry consequence** or **blocking condition**.

**Pattern:** [Condition]. [What remains true]. [Single corrective action if any].

Examples:
- “Image required for institution filing. The record cannot be registered without an artwork image.”
- “Verification incomplete. Certificate cannot be issued until authorship is attested or verified.”

**Avoid:** “Oops”, “Something went wrong”, “Please try again” without stating what failed.

---

## Ownership language

| Concept | Language |
|---------|----------|
| Creator holding | **Authored works**, **in your custody** (when accurate) |
| Collector holding | **Holdings**, **custody**, **stewardship** |
| Transfer in flight | **Transfer pending**, **awaiting receipt confirmation** |
| Claim | **Ownership claim**, **claim ownership** (formal) |
| Sale | **Sale recorded**, **transfer to resolve** |
| Canonical holder | **Holder on record**, **custody on the ledger** |

Never imply ownership is editable arbitrarily — **corrections file forward**.

---

## Verification language

| Tier / event | Language |
|--------------|----------|
| Registered, un attested | **Filed** — chronology begun |
| Self-attest | **Attest authorship**, **authorship attestation on file** |
| Institutional | **Verify**, **verification recorded**, **institutional filing** |
| Certificate gate | **Certificate eligible**, **certificate issued to the ledger** |

Do not promise “automatic certificate” without “after attestation or verification” qualifier.

---

## Invitation language

- **Representation invitation** — roster relationship
- **Artwork authentication request** — per-work institutional attestation
- **Invitation sent** / **Invitation on file** — not “Invite delivered!”
- **Accept invitation** — not “Join now”

Tone: formal correspondence, not referral marketing.

---

## Institution language

- **Organisation** (user-facing), not Gallery except where historical route requires
- **Institution filing**, **organisation record**, **represented Creatives**
- **Roster**, **catalogue**, **programme** (Field opportunities)
- **Free registry infrastructure** — accurate for Foundation tier; no purchase language

---

## Certificate language

- **Registry certificate**, **certificate on file**, **certificate issued**
- Certificates are **issued to the ledger** — not “generated”, “minted”, or “unlocked”
- **Revoked** — factual, mono label
- Never web3 or NFT framing

---

## Error language

**Pattern:** [Action] could not be [recorded/completed]. [Detail if safe]. [Retry or alternative].

Examples:
- “Could not file authorship attestation.”
- “Connection interrupted. Your session ended; nothing was filed.”

**Avoid:** “Error 500”, “Failed successfully”, blame (“You entered invalid data” → “Title is required to register the work.”).

---

## Loading language

Loading copy names **what is being retrieved** — not generic spinners.

| Instead of | Use |
|------------|-----|
| Loading… | **Opening studio…**, **Retrieving series on file…**, **Verifying invitation…** |
| Processing… | **Filing…**, **Recording transfer…** (match action) |

Generic “Loading…” acceptable only for secondary/async panels where the surface name is visible in chrome.

---

## Success language

**Do not use “Success” as a label or headline.**

Map outcomes to registry events:

| Event | Preferred acknowledgement |
|-------|---------------------------|
| Registration | Filing recorded |
| Attestation | Authorship attestation filed |
| Verification | Verification recorded |
| Certificate | Certificate issued to the ledger |
| Transfer confirm | Custody confirmed on the Registry |
| Invitation | Invitation on file |

Toasts may use short form; slabs use full pattern (see Registry Moments).

---

## Empty-state language

Every empty state answers:

1. **What will appear here** (future state, institutional framing)
2. **One primary filing action** (verb + registry object)
3. **Optional secondary** (browse, account, dismiss)

**Pattern:**
> **Headline:** No [holdings/certificates/works] on file yet.  
> **Body:** [What triggers appearance].  
> **Primary CTA:** [Register artwork | Claim ownership | Attest authorship]

**Avoid:** “No data yet”, “Get started by…”, “Nothing here”.

---

## Avoided language

Never use in user-facing copy (except quoted external content):

- Success, Done, Completed, Awesome, Great job, Congratulations
- Dashboard (use **Studio**)
- Upload (use **Attach** / **Add image**)
- Submit (use specific filing verb)
- Get started, Continue, Next (as primary CTAs)
- Task, Project, Workflow, Pipeline
- Portfolio (as product name — **holdings**, **catalogue**, **authored works**)
- Feed, Timeline (social), Follower, Following, Like, Share (except **Share record** / **Copy link** for provenance)
- Explore (prefer **Browse**, **Open**, **View** in Studio; **Explore** acceptable on Field/marketing only)
- Gamification: level, badge, streak, points, unlock, achievement
- Exclamation marks in product UI
- Emojis anywhere in product UI

---

## Preferred vocabulary — product term audit

Recommendations for major product terms. **Stay** = keep with current or minor copy polish. **Change** = migrate in locale pass. **Context** = keep in specific surface only.

| Term | Verdict | Preferred / notes |
|------|---------|-------------------|
| **Dashboard** | **Change** | **Studio** — no user-facing “dashboard” |
| **Workspace** | **Context** | Acceptable in compound (“Collector Archive” preferred over “workspace”); avoid “About this workspace” → **About this studio** |
| **Studio** | **Stay** | Private filing environment — well established |
| **Field** | **Stay** | Public discovery layer |
| **Registry** | **Stay** | Always capitalised as system |
| **Profile** | **Context** | **Public presence** or **account** where possible; “profile” OK in account settings |
| **Upload** | **Change** | **Attach image**, **Add artwork image** |
| **Submit** | **Change** | Specific verb: **Register artwork**, **Send invitation**, **File claim** |
| **Success** | **Change** | Event-led acknowledgement (see Success language) |
| **Complete** | **Change** | **On file**, **Verified**, **Recorded** — context-specific |
| **Incomplete** | **Change** | **Awaiting [event]**, **Requires [action]** |
| **Task** | **Avoid** | **Filing**, **attention item**, **requires response** |
| **Project** | **Avoid** | Not a registry concept |
| **Portfolio** | **Change** (Studio) | **Holdings** (Collector), **Catalogue** (Creative), **Registered works** (Org) |
| **Feed** | **Avoid** | **Activity**, **chronology**, **recent filings** |
| **Follower** | **Avoid** | Not applicable |
| **Like** | **Avoid** | Not applicable |
| **Explore** | **Context** | Field/marketing OK; Studio CTAs use **Browse registry**, **View record** |
| **Artist** | **Change** | **Creative** (user-facing); “artist” only in credited-name fields |
| **Gallery** | **Change** | **Organisation** (user-facing) |
| **User** | **Context** | Prefer role name or “you”; “user” in technical/error logs only |
| **Account** | **Stay** | Account & presence |
| **Deal** | **Stay** | Structured transfer terms — institutional, not “transaction” |
| **Opportunity** | **Stay** | Field programmes / briefs |
| **Certificate** | **Stay** | Always **Registry certificate** in formal copy |
| **Verify** | **Stay** | Institutional verification |
| **Attest** | **Stay** | Self-attestation — distinct from verify |
| **Claim** | **Stay** | Ownership claim — formal |
| **Dismiss** | **Context** | Acceptable for closing slabs; prefer **Return to studio** where space allows |
| **Processing** | **Change** | Name the filing action in progress |
| **Loading** | **Change** | Name the surface or record being opened |
| **Get started** | **Change** | Role-specific first filing action |
| **Take part** | **Stay** | Field / entry — institutional, not SaaS |
| **On file** | **Stay** | Core registry state phrase |
| **Chronology** | **Stay** | Core metaphor |
| **Ledger** | **Stay** | Ownership/value ledger |
| **Attention** | **Context** | **Requires attention** (Collector) — acceptable if tied to registry events |
| **Insight** | **Context** | **Record health**, **series on file** — demote analytics SaaS tone |
| **Integrity / Readiness** (Org) | **Change** | Reframe as **verification queue**, **records requiring filing** |

---

## PART B — Registry Status (concept)

**Not a recommendation engine.** A single contextual sentence on each Studio home communicating the most consequential **registry state** for that role right now.

### Purpose

Answer: *“What does the Registry need from me?”* in one calm line — without cards, progress bars, or multiple competing CTAs.

### When it appears

| Condition | Show Registry Status |
|-----------|---------------------|
| Studio home (workspace section) loads | Yes — if a ranked state exists |
| User has zero registry events | Yes — empty-cohort / first-filing state |
| User has pending filings requiring response | Yes — name the highest-priority event |
| All clear — no pending filings | Optional brief “All filings current” OR hide entirely |
| User navigates to sub-section (Works, Certificates) | No — status stays on home only |
| Registration outcome slab visible | Hide Registry Status (avoid duplicate acknowledgement) |

### When it disappears

- Dismissed for session (optional — prefer auto-hide when condition clears)
- Condition resolved (event filed, transfer confirmed, attestation recorded)
- Superseded by a higher-priority registry event
- User has no Studio home (edge: redirect to onboarding)

### What it may contain

| Allowed | Not allowed |
|---------|-------------|
| Count of items awaiting action (1–3 words) | Multiple CTAs |
| Named registry event (attestation, verification, transfer) | Progress percentage |
| Role-specific object (work, record, holding) | Gamified copy |
| Optional single primary action label | Exclamation marks, badges |
| Registry ID (mono, secondary) | Marketing or founding cohort banners |

### Maximum length

- **One sentence, ≤ 120 characters** (English reference)
- Optional mono secondary line: Registry ID or timestamp, ≤ 40 characters
- Primary action: one button, verb + object, ≤ 24 characters

### Primary action rules

1. **One action only** — the filing that resolves the stated status
2. Action must complete: *“This button files ___ on the Registry.”*
3. If no filing is possible (informational only), no button — link to Field or section subordinate
4. Never duplicate hero primary CTA — Registry Status replaces hero secondary when present

### Tone

Present tense, institutional, neutral:

- “One work is awaiting attestation.”
- “Three records require verification.”
- “No holdings have yet been recorded.”
- “One transfer awaits receipt confirmation.”

Not: “You're almost there!”, “Complete your setup”, “1 step left”.

### Interaction principles

- **Static text** — no carousel of recommendations (that is Phase 2+ system, not Registry Status)
- **Semantic colour** only when tied to registry event (amber exception, lime transfer, cobalt registration)
- **No modal** — action opens existing filing flow or navigates to section
- **Append-only awareness** — status describes current ledger edge, not editable summary
- **Priority order** (example): inbound transfer > ownership claim response > attestation > verification > empty first filing

### Examples by role

**Creative**

| State | Registry Status | Primary action |
|-------|-----------------|----------------|
| Filed, not attested | One work is awaiting attestation. | Attest authorship |
| Representation review | One representation request requires response. | Review request |
| All current | All authored works are current on the Registry. | (none or View catalogue) |
| Empty | No works registered yet. | Register artwork |

**Organisation**

| State | Registry Status | Primary action |
|-------|-----------------|----------------|
| Verification queue | Three records require verification. | Review queue |
| Pending invitation | Two invitations await acceptance. | Open invitations |
| Empty catalogue | No works filed under this Organisation. | Register a work |

**Collector**

| State | Registry Status | Primary action |
|-------|-----------------|----------------|
| No holdings | No holdings have yet been recorded. | Claim ownership |
| Pending transfer | One transfer awaits receipt confirmation. | Confirm receipt |
| Unverified custody | One holding requires verification. | Open holding |
| All current | All holdings are current on the Registry. | (none) |

---

## PART C — Registry Moments

Language framework for consequential ledger events. Each moment: **calm**, **significant**, never celebratory.

### Design principles

- No exclamation marks
- No emojis
- No “Success” headline
- Prefer **mono rail label** + **serif title** + **one-line body** + **Registry ID** + **one primary / one secondary action**
- Toast = short form; Slab = full form
- Motion: slow reveal (`ledger-append`), not bounce/confetti

### Pattern library

**Pattern 1 — Rail + title + ID**
```
FILING RECORDED
Work filed on the Registry
Registry ID · RROWM-2026-…
[View public record]  [Return to studio]
```

**Pattern 2 — State transition**
```
AUTHORSHIP ATTESTATION FILED
Self-attestation recorded on the chronology
Certificate may be issued after verification tier is met.
```

**Pattern 3 — Custody**
```
CUSTODY CONFIRMED
Receipt recorded — provenance extended
The work remains in your holdings on the Registry ledger.
```

**Pattern 4 — Institution**
```
ORGANISATION ON FILE
Your institution record is established
Roster invitations and catalogue filings may proceed.
```

**Pattern 5 — Certificate**
```
CERTIFICATE ISSUED
Registry certificate appended to the record
Open the certificate to review the verification layer.
```

**Pattern 6 — Programme**
```
PROGRAMME PUBLISHED
Opportunity filed on the Field
Applications will reference your Organisation presence.
```

**Pattern 7 — Invitation closed loop**
```
INVITATION ACCEPTED
Representation recorded on the Registry
The Creative may now deepen attestations on represented works.
```

**Pattern 8 — Minimal toast (ephemeral)**
```
Authorship attestation filed.
```
(No headline, no exclamation — auto-dismiss)

### Moment catalogue

| Moment | Rail label | Title (example) | Body (example) | Primary CTA |
|--------|------------|-----------------|----------------|-------------|
| Artwork registered | FILING RECORDED | Work filed on the Registry | Chronology open. Attestation or verification may follow. | View public record |
| Certificate issued | CERTIFICATE ISSUED | Certificate on file | Permanently linked to the Registry record. | Open certificate |
| Ownership confirmed | CUSTODY CONFIRMED | Receipt recorded on the ledger | Provenance extended to your holdings. | View holding |
| Organisation established | ORGANISATION ON FILE | Institution record established | Catalogue and roster filings may proceed. | Register a work |
| Collector record created | STEWARD RECORD ON FILE | Collector studio opened | Claim ownership or confirm transfers to record custody. | Claim ownership |
| Opportunity published | PROGRAMME PUBLISHED | Opportunity on the Field | Open for applications under your Organisation. | View on Field |
| Verification completed | VERIFICATION RECORDED | Record verified | Certificate eligible for issuance. | View record |
| Invitation accepted | INVITATION ACCEPTED | Representation on file | Per-work authentication may now be requested. | Open roster |

### Anti-patterns (never)

- “Success! Your artwork has been registered!”
- “🎉 Certificate unlocked”
- “Great job — you're all set”
- “Registration complete”
- “Done”

---

## PART D — Language audit

Audit of `lib/locale-messages.ts` and hardcoded strings (e.g. `OnboardingClient.tsx`, `intro-content.tsx`). **No code changes in 7A.2.**

### Priority 1 — SaaS-conflicting (fix first)

| Key / location | Current | Issue | Recommended direction |
|----------------|---------|-------|----------------------|
| `gallery.status.complete` | “Complete” | Progress/checklist SaaS | **On file** or **All filings current** |
| `gallery.status.incomplete` | “Incomplete” | Generic progress | **Requires verification** / **Awaiting filing** |
| `gallery.integrity.complete` | “Complete” | Gamified readiness | **Verification current** |
| `gallery.readiness.incomplete` | “Incomplete” | Setup wizard tone | Name missing filing |
| `gallery.toast.verifySuccess` | “Success” implied in key | Toast celebration | **Verification recorded** |
| `verification.share.successTitle` | “success” in key | Social share framing | **Record verified** |
| `landing.portfolio.title` | “Portfolio management across every role” | PM software | **Stewardship across every role** or remove |
| `studio.roleBand.collector.subtitle` | “Portfolio, stewardship…” | Portfolio as product | **Holdings, stewardship, and transfer** |
| `auth.getStarted` | “Get started” | Vague SaaS entry | **Take part** or **Create account** |
| `common.processing` | “Processing…” | Generic | Name action: **Filing…** |
| `registry.record.claim.submit` | “Submit claim” | Submit | **File claim** |
| `field.opportunities.detail.applicationSubmitted` | “Application submitted” | OK but passive | **Application on file** |
| `studio.opportunities.empty` | “Create a draft to get started” | SaaS draft/onboarding | **File a programme** |
| `IntroModal` final step (historical) | “Get started” | Fixed in 7A.1 | Monitor remaining instances |

### Priority 2 — Terminology inconsistency

| Area | Issue | Standardise to |
|------|-------|----------------|
| Artist vs Creative | ~40+ keys still use `artist` | **Creative** user-facing; keep `artist` in credited-name / RPC labels only |
| Gallery vs Organisation | `gallery.*` namespace vs Organisation UI | **Organisation** in EN strings; namespace rename deferred |
| Profile vs presence | `viewProfile`, `createProfile` | **View presence**, **Establish account** where public |
| Workspace vs Studio | `gallery.hero.aboutWorkspace`, collector “workspace” | **Studio** |
| Explorer vs Browse | Mixed “Explore registry” / “Browse” | Field: Explore acceptable; Studio: **Browse registry** |
| Dashboard (legacy docs/components) | Internal component names | No user-facing exposure |

### Priority 3 — Institutional tone drift

| Key | Current | Notes |
|-----|---------|-------|
| `studio.toast.selfAttested` | “Authorship attestation filed on the record.” | **Good** — model for toasts |
| `studio.register.outcome.*` | Filing recorded / Work filed | **Good** — model for slabs |
| `gallery.toast.certificateFiled` | “Certificate filed” | **Good** |
| `studio.loading.opening` | “Opening studio…” | **Good** — named loading |
| `collector.activity.loading` | “Loading…” | Generic — **Retrieving activity on file…** |
| `collector.shell.loading` | “Loading…” | **Opening collector studio…** |
| Hardcoded onboarding | English-only role cards | Move to locale; apply Creative label everywhere |
| `intro-content.tsx` | “Your studio”, “Dashboard” in gallery step | Align to Registry Voice; qualify certificate timing ✅ (7A.1) |

### Priority 4 — Lower urgency (marketing / Field)

| Key | Notes |
|-----|-------|
| `landing.v2.hero.explore` | Acceptable on marketing |
| `nav.drawer.explore` | Consider **Field** as noun |
| `field.explorer.hub.title` | **Explorer** established brand for Field — stay |
| Insight / completeness dimensions | Analytics language — soften in Studio-facing copy |

### Locale pass scope (implementation backlog)

1. Replace Complete/Incomplete/Success cluster (Org status + toasts)
2. Artist → Creative sweep in EN `locale-messages.ts` display strings
3. Submit/Upload/Get started in CTAs
4. Portfolio → holdings/catalogue in Studio subtitles
5. Generic Loading/Processing → named surfaces
6. Move hardcoded onboarding + intro strings into locale
7. Apply Registry Moments patterns to remaining toasts
8. DE/FR/JA parity after EN voice lock

**Estimated keys touched:** ~80–120 EN strings (not including namespace renames).

---

## Governance

| Property | Value |
|----------|-------|
| Owner | Product + editorial |
| Applies to | All user-facing copy, emails (future), Field, Studio, onboarding |
| Supersedes | Ad-hoc copy in sprint notes for voice questions |
| Implementation | Locale pass in Sprint 7A.3+; Registry Status UI in 7A.3 after voice lock |
| Related | `founding-registry-experience-blueprint.md`, `rrowm-ui-philosophy.mdc`, semantic signals rule |

---

*The Registry speaks in filings, not features. Every word should sound like it belongs in an accession ledger.*
