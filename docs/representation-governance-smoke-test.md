# Representation governance — smoke test

Apply migrations in order (Supabase SQL editor or `supabase db push`):

1. `20260509120000_artwork_representation_governance.sql`
2. `20260510120000_artist_representation_confirm.sql`
3. `20260511120000_representation_amendment_requests.sql`
4. `20260512120000_representation_end.sql`

## Gallery (institution)

- [ ] Sign in as gallery staff → **Institutional studio**
- [ ] Register a work for a represented artist → filing succeeds; work shows institution-linked participation
- [ ] **Roster**: artist with ended relationships shows **Historical** (not every unrepresented artist)
- [ ] Request representation amendment on a work → appears in amendments section
- [ ] **End representation** (admin or staff) → artist `represented_by_gallery` false; prior works remain on chronology

## Artist

- [ ] **Studio** → **Representation review** queue → confirm work on file
- [ ] **Amendments** → request / resolve / withdraw as applicable
- [ ] **End institution representation** when active → state becomes historical
- [ ] **My account** → historical notice when representation ended (link to studio)
- [ ] Public **artist page** → historical copy when representation ended

## APIs (optional curl with session cookie)

- `POST /api/representation/record-institution-filing`
- `POST /api/representation/artist-confirm`
- `POST /api/representation/amendment/request|resolve|withdraw`
- `POST /api/representation/end`

## RPCs (SQL editor, as authenticated user)

```sql
select public.get_gallery_representation_summary('<gallery_uuid>');
select public.get_artist_representation_review_queue();
select public.get_artist_representation_state('<artist_uuid>');
```
