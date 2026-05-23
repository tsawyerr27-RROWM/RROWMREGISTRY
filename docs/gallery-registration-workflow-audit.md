# Gallery artwork registration + participation — workflow audit

**Date:** 2026-05-20  
**Scope:** Institutional register → institution filing → invite → artist confirm → public layers

## Executive summary

Phases B–E (representation governance) were implemented in SQL and partial UI, but the **gallery register path did not call `record_institution_artwork_filing`**, so participation layers, review queues, and summary metrics stayed empty after registration. This audit repaired that wiring and completed the institutional UX path.

## Audit findings (before repair)

| Capability | Status | Notes |
|------------|--------|-------|
| Register artwork UI | Partial | `RegisterModal` on overview only; catalogue had no CTA |
| `register_institution_artwork_atomic` | Wired | Institution catalogue; name-only artist OK |
| `register_artwork_atomic` | Legacy artist self-register | Not used for gallery path |
| `record_institution_artwork_filing` | **Orphaned** | API existed; never called from dashboard |
| Participation layers (public) | Wired | `getArtworkParticipationLayers` + `ParticipationLayersStrip` |
| Invite send/resend/accept | Wired | Token, email, duplicate handling |
| `complete-verification` after login | **Gap** | Only onboarding called it; existing artists stuck at `pending` visibility |
| Artist confirm queue | Wired | Depends on `institution_filed` events |
| Post-register next steps | **Missing** | Generic success string only |
| Participation nav (gallery) | Partial | Amendments only; no pending-confirmation list |

## Repairs applied

### Workflow integrity

1. **`recordInstitutionArtworkFiling`** (`lib/record-institution-filing-client.ts`) — called immediately after successful `register_artwork_atomic`.
2. **`GalleryRegistrationOutcome`** — post-register panel: registry id, participation state, links to public record, Works, Participation, Invitations.
3. **`GalleryParticipationPendingSection`** — Participation tab lists works filed by institution awaiting artist confirmation.
4. **Register CTA** on **Works** tab + hero label **Register a work**.
5. **No roster** → admin sent to **Invitations** with clear message; register limited to `represented_by_gallery` artists.
6. **`completeGalleryInviteVerificationIfReady`** — runs after invite accept (login/signup/onboarding paths).

### Language

- Register modal and workspace guide use **participation / continuity on file**, not verification marketing.
- Nav: **Continuity & certs** (was Trust & certs).

## Intended end-to-end flow (after repair)

```
Gallery dashboard
  → Register a work (artist name + image; roster link optional)
  → register_artwork_atomic
  → record_institution_artwork_filing
  → Public: Institution-linked continuity · Artist participation pending
  → Invite artist (if not yet on roster)
  → Artist accepts invite → visibility confirmed when onboarded
  → Artist studio → Participation → Confirm on file
  → Public layers deepen (confirmation, chronology)
```

## Continuity-safe governance philosophy

- **Institution filing** is observational: the gallery records what it placed on the chronology, not a legal warranty.
- **Artist confirmation** is a separate layer; public copy must not imply it before it exists.
- **Ending representation** preserves prior filings (`priorFilingsRemainVisible`).
- **Amendments** are documentary proposals, not automatic catalogue mutations.

## Verification checklist (manual)

- [ ] Gallery with represented artist: Register a work → outcome panel shows institution filing OK
- [ ] `get_gallery_representation_summary`: `institution_filed` increments
- [ ] Participation tab: work appears under “Awaiting artist confirmation”
- [ ] Public `/artwork/[registry_id]`: participation strip shows institution-linked + artist pending
- [ ] Artist studio → Participation → Confirm on file
- [ ] Public strip updates after confirm
- [ ] Invite: existing artist login → accept → complete-verification → gallery can “Make public” when rules allow
- [ ] Register with zero represented artists → Invitations + error message (admin)

## RPC / API reference

| Step | Endpoint / RPC |
|------|----------------|
| Register | `register_artwork_atomic` |
| Institution filing | `POST /api/representation/record-institution-filing` → `record_institution_artwork_filing` |
| Artist confirm | `POST /api/representation/artist-confirm` → `artist_confirm_representation_on_file` |
| Invite accept | `POST /api/invite/accept` |
| Visibility confirmed | `POST /api/invite/complete-verification` |
| Summary | `get_gallery_representation_summary` |
