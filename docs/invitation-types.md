# Invitation types (operator guide)

RROWM maintains **two invitation channels**. They are not interchangeable.

## Representation invitations

- **Table:** `gallery_artist_invites`
- **Purpose:** Invite an artist to join under your institution generally (roster, studio relationship).
- **Landing:** `/signup?invite_token=…`
- **When to use:** You represent the artist’s practice and want them on your roster before or apart from specific works.
- **Does not require:** A registered artwork.

## Artwork authentication invitations

- **Table:** `artwork_authentication_invites`
- **Purpose:** Invite an artist to **one canonical record** — authenticate authorship and deepen chronology.
- **Landing:** `/authenticate-record?token=…`
- **When to use:** After your institution registers a work (name-only artist is fine). The record is already on file; the invite is continuity participation, not upload approval.
- **Stored in:** Invitations → **Artwork authentication** tab.

## Copy principles

- Say **authenticate authorship** / **deepen the record**, not “verify upload” or “approve”.
- The public record is live before the artist accepts.
- Prior institution layers remain visible when the artist contributes.

## Typical flow

1. **Works** → Register a canonical record (artist name + image; optional email).
2. **Send authentication invitation** (Works row or post-register panel) → email + row in Artwork authentication tab.
3. Artist opens link → reviews artwork → signs in → accepts → account links to the work.
4. Optionally: artist **contributes authorship** from studio (archival contribution, not editing the institution filing).

## Environment (Vercel / local)

- `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL` — invite links
- `RESEND_API_KEY`, `RESEND_FROM_*` — email delivery
- Supabase migrations through `20260514120000_artwork_authentication_invites.sql` (after institution catalogue migrations)

## Migrations (order)

1. `20260513120000_institution_catalogue_unresolved_artists.sql`
2. `20260513140000_fix_register_institution_artwork_atomic.sql`
3. `20260513150000_fix_artworks_default_owner_trigger.sql`
4. `20260514120000_artwork_authentication_invites.sql`
