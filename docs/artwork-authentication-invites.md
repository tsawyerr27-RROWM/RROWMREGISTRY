# Artwork authentication invitations

## Philosophy

The **canonical artwork record** is primary. Institutions file works independently of artist accounts.

**Artwork authentication invitations** are separate from **representation invitations** (`gallery_artist_invites`):

| System | Table | Purpose |
|--------|--------|---------|
| Representation | `gallery_artist_invites` | Join under institutional representation generally |
| Artwork authentication | `artwork_authentication_invites` | Authenticate and deepen one specific record |

Invitations are continuity participation requests — not approval workflows, onboarding funnels, or upload validation.

## Flow

1. Gallery registers work (name-only artist allowed).
2. From **Works**, **Invite artist to authenticate** opens `ArtworkAuthenticationInviteModal`.
3. `POST /api/artwork-authentication/send-invite` records invite + sends email.
4. Artist opens `/authenticate-record?token=…` — artwork visible immediately.
5. Sign-in or sign-up preserves the link via `?next=` and session storage, then returns after onboarding when needed.
6. Signed-in artist: `accept_artwork_authentication_invite` links account + layers attestations.
6. Optional: **Contribute authorship** via existing chronology contribution API.

## Public participation layers

- Before: institution-linked continuity on file; artist attestation not yet on file (neutral).
- After: artist attestation on file; participant-confirmed chronology may deepen.

The record is never provisional or awaiting approval.

## Migration

`supabase/migrations/20260514120000_artwork_authentication_invites.sql`

Apply after institution catalogue migrations (`20260513120000`+).

See also [invitation-types.md](./invitation-types.md) for when to use representation vs artwork authentication invites.

## API

- `POST /api/artwork-authentication/send-invite`
- `POST /api/artwork-authentication/resend-invite`
- `GET /api/artwork-authentication/preview?token=`
- `POST /api/artwork-authentication/accept`
