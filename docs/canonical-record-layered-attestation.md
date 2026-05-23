# Canonical artwork record + layered participant attestation

## Philosophy

The **artwork record** is the primary object in RROWM. It:

- Exists from the moment a registry identifier is issued
- Persists historically on the chronology
- Accumulates **participant attestations** over time
- Never reads as provisional, invalid, or “awaiting approval”

Galleries and artists are **participants**, not authorities over one another’s filings.

```
                    ┌─────────────────────────┐
                    │ Canonical artwork record │
                    │ (registry ID, public)    │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   Institution            Artist              Chronology
   attestation on file    authorship on file   events deepen
```

## What changed (conceptual refactor)

| Old framing | New framing |
|-------------|-------------|
| Gallery upload pending approval | Canonical record on file |
| Artist review queue | Authenticate & deepen |
| Confirm on file | Authenticate authorship |
| Artist participation pending | Artist attestation may deepen |
| Verification pass/fail | Layers on file |
| Invite to verify | Invite to authenticate |

## Registration parity

**Gallery** and **artist** registration both call `register_artwork_atomic` and issue the same canonical object:

- Title, media, year, medium, dimensions, opening chronology
- Public artwork page
- Registry ID

Gallery registration additionally calls `record_institution_artwork_filing` to layer **institution-linked continuity** — one attestation among many, not ownership of the work.

## Public trust surface

`ParticipationLayersStrip` is the primary public trust UI:

- States what is **on file** today
- Uses **neutral** styling for “may deepen” (not amber/warning incomplete states)
- Footnote: layered attestations only — not adjudication

## Artist flow (studio → Records)

1. **Review** the canonical record (public page)
2. **Authenticate authorship** (`artist_confirm_representation_on_file`)
3. **Deepen** detail via artworks, amendments, chronology
4. Optionally acknowledge institutional relationship
5. Public layers update accumulatively

## Gallery flow (institutional studio)

1. **Register a work** — same documentary issuance as artists
2. **Institution attestation** recorded automatically when roster allows
3. **Invite to authenticate** — artist deepens; not “join gallery workflow”
4. **Record depth** tab — attestations that may still deepen + amendments

## Edit governance

- Amendments propose catalogue changes; acceptance merges on file
- Ending representation ends the **relationship layer**, not the artwork
- Prior contributions remain visible (`priorContributionsRemainVisible`)

## Code map

| Concern | Location |
|---------|----------|
| Language | `lib/representation-language.ts` (`CANONICAL_RECORD_PHRASES`) |
| Public layers | `lib/get-artwork-participation-layers.ts`, `ParticipationLayersStrip` |
| Artist deepen UI | `ArtistRecordDeepeningSection` (`ArtistRepresentationReviewSection` alias) |
| Gallery depth UI | `GalleryRecordDepthSection` |
| Post-register | `GalleryRegistrationOutcome` |
| Invite email | `lib/emails/artist-gallery-invitation.ts` |
| Institution filing | `POST /api/representation/record-institution-filing` |

## Emotional goal

> The artwork exists first. Participants progressively deepen the documentary continuity surrounding it.
