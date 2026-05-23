# Canonical record first · Institution catalogue

## Philosophy

The **canonical artwork record** is primary. Institutions may file unlimited works immediately for cataloguing, chronology, inventory continuity, and public registry pages.

**Participant attestations** (institution filing, artist authentication, authorship contributions) accumulate on the chronology around that record. They do not gate whether the work is “valid.”

Artist platform participation is **optional deepening**, not a prerequisite for registration.

## Unresolved artist identity

At institution registration:

| Field | Role |
|-------|------|
| `catalogue_artist_name` | Plain-text credit (required if no `artist_id`) |
| `artist_id` | Optional link to an existing roster account |
| `pending_artist_email` | Optional target for later authenticate & deepen |
| `filing_gallery_id` | Institution that filed the canonical record |

Later, when an artist joins, `artist_link_catalogue_work` and `artist_confirm_representation_on_file` link the same row **non-destructively** (registry id, institution events, and prior filings persist).

## Registration path (gallery)

RPC: `register_institution_artwork_atomic`

- Creates artwork + ownership event + representation relationship + `institution_filed` event in one transaction.
- Does **not** require represented roster membership.

UI: institutional dashboard **Register a work** — artist name (text), optional email, optional roster link.

## Archival authorship contribution

Framed as **contribution**, not editing.

RPC: `artist_contribute_authorship_on_file` → append-only `artist_authorship_contribution` event with statement / chronology text in `payload`.

UI: artist studio **Records** → **Contribute authorship** modal.

## Public participation layers

- Institution-linked continuity: **on file** from registration.
- Artist attestation: **neutral** “not yet on file” when unlinked — not warning / provisional UX.
- After authenticate or contribution: artist attestation layers deepen.

## Migration

Apply after representation governance migrations:

`supabase/migrations/20260513120000_institution_catalogue_unresolved_artists.sql`
