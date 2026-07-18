# Living Archive Foundation

**Experience E1 — engineering foundation**  
**Date:** 18 July 2026  
**Status:** E1 foundation complete; Experience 01 Release A connected to Studio Works without route, API, schema, or permission changes

---

## Purpose

The Living Archive is a new way to experience authored work while preserving the Registry as the system of record.

It is **not**:

- a carousel,
- a replacement for Ledger View,
- a new artwork record,
- a new API or schema,
- or an immersive visual treatment applied before interaction and performance foundations exist.

This sprint establishes:

1. a documented architecture,
2. a deterministic headless state/navigation model,
3. a bounded virtual-window strategy,
4. image-loading intent and budgets,
5. deep-link query conventions,
6. and unit-tested behavior from 1 to 10,000 works.

Implemented foundation:

- `lib/living-archive.ts`
- `lib/living-archive.test.ts`

Neither module is connected to current UI in E1. Existing Gallery and Ledger behavior remains unchanged.

---

## Experience 01 · Release A production behavior

Release A connects the foundation to Works as the first production Living Archive MVP.

- **Archive** replaces the user-facing **Gallery** presentation name.
- Legacy persisted `"gallery"` preferences migrate to `"archive"`; Ledger preferences remain intact.
- Archive is the default presentation for new sessions.
- Creative Works, Collector holdings, and Organisation catalogue use the reusable `LivingArchiveViewport`.
- Ledger remains available on every integrated surface.
- One work is active at all times, with adjacent works partially visible.
- Native horizontal touch/trackpad movement, mouse-wheel translation, and complete arrow/Home/End/Page keyboard movement share one focus model.
- Focused Registry IDs are represented by `section`, `view=archive`, and `work` query state on existing routes.
- The viewport restores linked/history focus and scroll position without adding a route.
- Collections above the small-set threshold render a bounded moving window.
- Only the active image and near neighbours are mounted or prefetched; missing and failed images use a neutral archival fallback.
- Creative detail history requests now run concurrently and ignore stale responses.
- Creative initial catalogue dependencies run concurrently; duplicate transferred-work and certificate read-model requests were removed.
- Shared modal behavior now includes Escape, focus containment, initial focus, and source-focus restoration.
- Reduced motion removes smooth movement and transition dependency without removing navigation.

The MVP deliberately does not add autoplay, looping, decorative transitions, schema/API changes, or new Registry actions.

---

# Part 1 — Current Works implementation audit

## Current component tree

```text
app/studio/creative/page.tsx
└── StudioShell
    └── ArtworksSection
        ├── section heading
        ├── StudioSearchRow
        │   ├── search input
        │   └── artwork filter <select>
        ├── StudioViewToggle
        │   └── ArchiveViewSwitcher
        ├── no-match state
        ├── Gallery mode
        │   └── ArchiveGalleryGrid
        │       └── GalleryTile[] (button or Link)
        ├── Ledger mode
        │   └── CreativeArtworkSlab[]
        │       ├── ArtworkTrustBadge
        │       ├── certificate / pricing / eligibility metadata
        │       ├── Attest authorship action
        │       └── Record value action
        └── empty registration state

Artwork selection from either presentation
└── app/studio/creative/page.tsx state
    ├── artworkDetail
    ├── selectedArtwork
    └── valueHistory
        └── ArtworkDetailModal
            ├── ModalShell
            ├── artwork image + record metadata
            └── value chronology

Canonical exits
├── /artwork/[registry_id] (legacy presentation route)
├── /field/record/[registry_id] (public record)
└── /registry/[registry_id]/ledger (authoritative chronology)
```

### Key files

| Concern | Current source |
|---------|----------------|
| Parent data/state | `app/studio/creative/page.tsx` |
| Works orchestration | `components/Dashboard/ArtworksSection.tsx` |
| Gallery renderer | `components/Studio/ArchiveGalleryGrid.tsx` |
| Ledger renderer | `components/Studio/CreativeArtworkSlab.tsx` |
| View persistence | `components/Studio/StudioViewToggle.tsx`, `ArchiveViewSwitcher.tsx` |
| Detail preview | `components/Dashboard/ArtworkDetailModal.tsx` |
| Shared modal | `components/ui/ModalShell.tsx` |
| Canonical record | `components/Field/FieldRecordView.tsx`, `RegistryRecordHero.tsx` |
| Studio section navigation | `lib/studio-nav/creative-nav.ts` |

---

## Gallery mode

Current Gallery is a responsive thumbnail grid:

- 2 columns by default,
- 3 at `sm`,
- 4 at `lg`,
- square image frame,
- title, subtitle, Registry ID,
- lazy-loaded raw image,
- entire tile is a button or link,
- all filtered items render into the DOM,
- stagger/reveal classes apply to every item.

### Strengths

- Already separates presentation from parent data ownership.
- Uses stable item IDs.
- Has link and callback modes.
- Provides a meaningful no-results state.
- Reused by Works, Certificates, and Collector holdings.
- Reduced-motion classes are present.

### Constraints

- It is a fixed grid, not a viewport architecture.
- It renders all items and has no virtual window.
- It has no active/focused item model.
- It has no roving focus or spatial keyboard navigation.
- Images have no responsive `sizes`, stable intrinsic dimensions, or load-priority contract.
- Tile metadata truncates at one line.
- Focus cannot be deep-linked or restored.

---

## Ledger mode

The current Works “Ledger” is a dense catalogue presentation. It remains the operational presentation alongside Living Archive, but it is not itself the canonical ownership ledger.

Each `CreativeArtworkSlab` includes:

- title, year, medium, Registry ID,
- trust tier,
- certificate class,
- pricing state,
- ownership/market eligibility,
- optional self-attestation,
- optional value filing,
- record open behavior.

### Strengths

- High registry information density.
- Explicit trust and consequence.
- Filing actions remain close to the record.
- Authorship remains visible after transfer.
- Does not depend on gallery imagery.

### Constraints to preserve

- Ledger must remain selectable at all collection sizes.
- Living Archive must consume the same filtered item order without changing registry operations.
- Attestation, value, certificate, ownership, and record-detail behavior remain available.
- Archive state must never become the source of canonical artwork state.

### Current accessibility issue

The slab is an `article role="button"` containing nested buttons. Living Archive must not repeat this pattern. Record navigation and filing actions require separate, valid focus targets.

### Three meanings that must remain distinct

1. **Works Ledger presentation** — the dense list in `ArtworksSection`.
2. **Studio ownership ledger modal** — value, provenance, ownership history, and authorized filing actions.
3. **Public authoritative ledger** — `/registry/[registry_id]/ledger`, built from canonical chronology.

Living Archive must not blur presentation choice with ledger authority.

---

## Artwork detail flow

Current flow is parent-state driven:

1. Gallery tile or Ledger slab calls `onArtworkClick(artwork)`.
2. Creative page stores both `artworkDetail` and `selectedArtwork`.
3. Existing effects load value, ownership, and provenance history.
4. `ArtworkDetailModal` renders a preview.
5. Title links onward to an artwork/public record route.
6. Closing clears detail state and sometimes selected ownership state.

### Limitations

- Selected artwork is not represented in the URL.
- Refresh loses the selection.
- Back does not close/restore the detail context.
- Scroll return is browser/incidental rather than explicit.
- Preview, public summary, and full ledger depth are not clearly modeled.
- Shared modal focus lifecycle is incomplete.
- Detail and ownership selection states overlap in one large page component.
- Detail history requests are sequential and have no cancellation/selected-ID guard, so rapid selection can expose stale-response races.

Living Archive therefore needs a distinct headless state contract for:

- **active item** — roving browse focus,
- **selected item** — explicitly opened focus view,
- **return anchor** — item and scroll offset restored on close,
- **canonical exit** — public record / ledger route.

---

## Current image loading

| Surface | Current behavior |
|---------|------------------|
| Gallery tile | Raw `<img>`, `loading="lazy"`, square CSS aspect ratio |
| Ledger thumbnail | Raw `<img>`, no explicit loading policy, hidden below `sm` |
| Detail modal | Raw `<img>`, 4:5 CSS ratio, no responsive source policy |
| Public record | Large artwork image; not part of Works controller |

### Bottlenecks

- No responsive source sizing.
- Width/height metadata is not consistently propagated.
- No focused-neighbor prefetch contract.
- No decoded-image memory policy.
- Broken/offline images do not share one deterministic fallback.
- Every gallery item is mounted, so large collections can create many image candidates.

---

## Current state management

`app/studio/creative/page.tsx` owns:

- `artworks`,
- one shared `searchQuery`,
- Works filter,
- Certificates filter,
- Ownership filter,
- active Studio section,
- Gallery/Ledger mode through session storage,
- selected artwork,
- artwork detail,
- ownership detail,
- value history,
- certificate overview,
- and multiple filing modals.

Derived Works filtering is client-side `useMemo`.

### Current persistence

- View mode: `sessionStorage` via `useStudioViewMode`.
- Section: local state with a session-storage handoff; URL query can prime section.
- Search/filter: memory only.
- Selected artwork: memory only.
- Scroll: browser default only.

Because the stored mode is read after mount, a session stored as Gallery can first render Ledger and then switch after hydration.

### Foundation requirement

Living Archive state must be independently testable and must not add more ad-hoc state to the Creative mega-page.

---

## Current mobile behavior

- Filters and view switch stack.
- Gallery remains a two-column grid.
- Ledger becomes text-heavy because thumbnails are hidden.
- Tile tap opens modal detail.
- Shared Studio section navigation becomes a bottom sheet.
- Detail uses a constrained modal with internal scrolling.

This is a responsive collapse of desktop, not an independently defined phone experience.

---

## Current keyboard behavior

| Interaction | Current behavior |
|-------------|------------------|
| Gallery tile | Native button/link Enter/Space behavior |
| Ledger slab | Custom Enter/Space on `role="button"` |
| View switcher | Click/Tab only; no Arrow/Home/End tab behavior |
| Gallery spatial movement | None |
| Detail close | Depends on close control; shared focus lifecycle incomplete |
| Focus return | Not guaranteed |
| Deep-linked focus | Not available |

---

## Current accessibility

### Strong

- Native buttons/links in Gallery.
- Filter has a programmatic label.
- Major touch controls are often 44px.
- Reduced-motion styles exist.
- Trust state is expressed textually.

### Gaps

- Search relies on placeholder text.
- Gallery image alternatives are empty.
- Ledger contains nested interactive semantics.
- Tabs do not implement full keyboard expectations.
- Modal focus trap, initial focus, Escape, restoration, and accessible naming are incomplete.
- Tiny mono metadata reduces legibility.
- Virtualized-set semantics do not yet exist.

---

## Current performance bottlenecks

1. Entire Creative Studio is a large client boundary.
2. Initial page load fetches data for inactive sections.
3. All filtered Gallery and Ledger items render.
4. Every rendered tile participates in reveal/stagger styling.
5. Raw images lack source sizing and stable dimensions.
6. Search filters every artwork in memory on each query update.
7. Detail value, ownership, and provenance requests run sequentially and are not cancellable.
8. Initial catalogue work fans out into holder, transfer, acquisition, completed-sale, certificate, signal, and metric queries.
9. Some ownership derivations are fetched more than once.
10. The current data adapter selects the full read model with no paging or field projection; 10,000 works would be renderable only after an impractical initial transfer.

---

# Part 2 — Living Archive architecture

## Architectural principles

1. **The record remains canonical.** Archive state is presentation state only.
2. **Ledger is a peer view, never a fallback removed by Archive.**
3. **Native scrolling, not carousel mechanics.**
4. **One active item; one optional selected item.**
5. **URL represents explicit selection, not every pointer movement.**
6. **Rendering is bounded regardless of collection size.**
7. **Images are requested by intent, not by array membership.**
8. **Input modalities share one command model.**
9. **Reduced motion changes presentation, never capability.**
10. **Mobile has its own composition contract.**

---

## System layers

```text
Existing artwork source
artwork_read_model / current Creative page data
        │
        ▼
LivingArchiveAdapter
normalizes existing rows into LivingArchiveItem
        │
        ▼
Headless archive core (implemented E1)
├── ordered identity index
├── reducer: active / selected / mode / return anchor
├── movement commands
├── virtual window
├── image intent
└── query-state parser/builder
        │
        ▼
Input adapters (future)
├── keyboard
├── pointer
├── touch
└── route/history
        │
        ▼
Presentation primitives (future)
├── ArchiveViewport
├── ArchiveIndex
├── ArchiveNavigator
├── ArchiveFocus
├── ArchiveRail
├── ArchiveMetadata
└── ArchiveImage
        │
        ├── Living Archive presentation
        ├── existing artwork detail / public record
        └── existing Ledger View and filing operations
```

---

## Implemented headless core

`lib/living-archive.ts` contains no React, DOM, route calls, fetching, or styling.

### Contracts

| Contract | Responsibility |
|----------|----------------|
| `LivingArchiveItem` | Minimal normalized identity and image facts |
| `LivingArchiveState` | Ordered IDs, active item, selected item, mode, modality, visible range, return offset |
| `livingArchiveReducer` | Deterministic state transitions |
| `indexForArchiveMove` | Linear, row, page, first, and last movement |
| `archiveCommandForKey` | Shared keyboard command mapping |
| `computeArchiveVirtualWindow` | Bounded uniform-grid render window |
| `archiveImageIntent` | Priority / prefetch / visible / deferred policy |
| `parseLivingArchiveLocation` | Reads Archive/focused-work query state |
| `buildLivingArchiveLocation` | Preserves unrelated query parameters |
| `LIVING_ARCHIVE_PERFORMANCE_BUDGET` | Shared latency, image-memory, overscan, and render budgets |

### Why IDs, not row objects, live in state

- Avoids duplicating mutable artwork data.
- Survives data refreshes.
- Keeps history state small.
- Supports chunked data sources later.
- Prevents stale metadata in selection state.

---

## Future component model

These are architectural boundaries, not implemented visual components in E1.

### `ArchiveViewport`

Owns:

- scroll container,
- viewport measurement,
- visible range,
- virtual padding,
- scroll restoration,
- orientation/breakpoint contract.

Does not own:

- artwork data,
- record operations,
- selected item truth,
- animation choreography.

### `ArchiveIndex`

Owns:

- collection ordering,
- visible virtual slice,
- list semantics,
- active-item registration,
- `aria-setsize` / `aria-posinset`,
- empty and offline placeholders.

### `ArchiveNavigator`

Owns:

- input modality adapters,
- movement command dispatch,
- previous/next/row/page boundaries,
- focus visibility,
- no-wrap default.

It must not implement autoplay, snapping, or infinite looping.

### `ArchiveFocus`

Owns:

- selected-work presentation boundary,
- initial focus,
- focus containment if modal,
- close and focus return,
- previous/next commands while focused,
- canonical record and Ledger exits.

It does not own artwork mutations.

### `ArchiveRail`

Optional desktop/tablet orientation surface:

- position in collection,
- concise index marks,
- jump-to-letter/year/group when supported,
- no miniature carousel.

Hidden or replaced on phone.

### `ArchiveMetadata`

Pure record presentation:

- title,
- year/medium,
- Registry ID,
- trust/certificate state,
- optional single record action.

Must consume existing Registry vocabulary and semantic signals.

### `ArchiveImage`

Owns:

- intrinsic ratio,
- responsive sizes,
- lazy/priority intent,
- decode state,
- error/offline fallback,
- abortable prefetch registration.

Does not own decorative transitions.

### `ArchiveTransition`

Future presentation adapter only.

- Receives state change (`browse → focus`, `focus A → focus B`).
- Must honor reduced motion.
- Must not determine navigation or selection.
- Not implemented in E1.

---

# Part 3 — Interaction model

## Universal rules

1. Native page/viewport scrolling remains available.
2. Movement never wraps from last to first unless a future explicit setting permits it.
3. Hover does not select or change URL.
4. Active item is a navigation cursor; selected item is an explicit opened work.
5. Opening a work pushes one history entry.
6. Moving the active cursor may replace ephemeral URL state only after explicit product review; E1 recommends no URL update.
7. Closing focus restores the originating item and scroll offset.
8. Filtering preserves selection if the work remains; otherwise focus closes safely.
9. No gesture performs a Registry write.
10. Existing record actions remain explicit buttons outside the archive tile activation target.

---

## Desktop — mouse

- Wheel scroll is native and unsnapped.
- Single click on a work opens focus.
- Hover may expose visual affordance but cannot load full detail or change state.
- Previous/next controls in focus move one work.
- Browser Back closes focus before leaving Works.
- Opening public record or Ledger uses existing routes.

## Desktop — keyboard

Browse mode uses one roving `tabIndex=0` item.

| Key | Command |
|-----|---------|
| Left / Right | Previous / next item |
| Up / Down | Same approximate column, previous / next row |
| Home / End | First / last item |
| Page Up / Page Down | Previous / next viewport-sized group |
| Enter / Space | Open focused work |
| Escape | No action in browse; close in focus |
| Tab | Leaves archive to the next interface region |

The active item must scroll into view without forced smooth motion when reduced motion is requested.

## Desktop — trackpad

- Two-axis input remains native scroll.
- No horizontal gesture interception in browse.
- Trackpad momentum cannot change selection.
- Focus changes only through explicit click, key, or control.

## Tablet

- Native vertical browse remains primary.
- Layout may use two or three index columns according to measured width.
- Tap opens focus.
- Keyboard behavior remains available for connected keyboards.
- Rail is optional only when it does not reduce artwork space.

## Phone — portrait

Phone is not a compressed desktop grid.

Foundation contract:

- one continuous vertical archive index,
- one dominant work region per row or compact two-up index only when labels remain legible,
- title/identity remains available without hover,
- tap opens a full-height focus layer or route-aware sheet,
- explicit previous/next controls meet 44px targets,
- Ledger remains available from the view control and focused work.

No horizontal swipe navigation is required in E1. Native vertical scrolling must never be hijacked.

## Phone — landscape

- Preserve native vertical scroll.
- Focus may place image and concise metadata side by side if height permits.
- Controls remain outside safe-area insets.
- Do not force a desktop rail into limited height.

## Touch behavior

- Tap: open focus.
- Tap focused close control: close and restore source.
- Vertical swipe: scroll.
- Pinch zoom: browser behavior must not be disabled.
- Long press: no required archive action.
- Horizontal swipe between works is deferred; if introduced later it dispatches the same `previous` / `next` commands and cannot loop.

---

## Focus behavior

### Browse

- One active work.
- DOM focus and state `activeId` agree after keyboard movement.
- Pointer scrolling does not continuously move DOM focus.
- Virtualization must keep the active item mounted or move the window before focusing.

### Focused work

- `selectedId` is explicit.
- Initial focus moves to focused title or close control according to container pattern.
- If rendered as a modal/sheet: trap focus, support Escape, restore focus.
- If rendered as a nested route/page: place focus on `<h1>` and use browser navigation for return.
- Closing restores `activeId` and `returnScrollOffset`.

### Selection

- Selection never changes canonical record state.
- Filing actions do not share the tile’s activation element.
- Active and selected state must be conveyed by text/ARIA, not semantic registry colour.

---

## Deep linking and browser history

No new route is required.

Proposed query contract on the existing Creative Studio route:

```text
/studio/creative?section=artworks&view=archive
/studio/creative?section=artworks&view=archive&work=RROWM-2026-001
```

Implemented helpers preserve unrelated query parameters.

### History rules

| Event | History operation |
|-------|-------------------|
| Enter Living Archive view | `replace` if migrating current Gallery preference; otherwise explicit view selection may `push` |
| Open a focused work | `push` with `work=Registry-ID` |
| Move active browse cursor | No history update |
| Move next/previous while focused | `replace` by default; optional `push` only after usability validation |
| Close focus | `back` when focus was opened in-session; otherwise remove `work` with `replace` |
| Change Ledger/Living Archive view | Preserve section/filter; explicit user choice updates URL |

### Direct-link failure

If `work` is unknown or excluded by permissions:

- remain in Archive browse,
- remove invalid `work` with `replace`,
- announce that the requested record is unavailable,
- never disclose private record existence.

---

## Scroll restoration

Store:

- source `activeId`,
- pixel `returnScrollOffset`,
- current virtual range,
- optional filter/sort identity.

Restoration sequence:

1. restore data/order,
2. compute the virtual window containing `activeId`,
3. set scroll offset,
4. mount active item,
5. restore focus only for keyboard-originated focus,
6. avoid smooth scrolling under reduced motion.

Scroll state is presentation state; it does not belong in database or Registry activity.

---

# Part 4 — Performance architecture

## Scale tiers

| Collection | Strategy |
|------------|----------|
| 1–10 | Render complete index; no virtualization required |
| 11–99 | Render complete or virtualize based on measured device/memory |
| 100–999 | Virtualize index; bounded image requests |
| 1,000–10,000+ | Virtualize; chunk data through adapter; searchable/filterable index required |

The implemented core supports a 10,000-item identity array and a bounded render window. The current Creative data source still loads the full artwork array; the adapter boundary exists so data acquisition can become chunked later without changing archive interaction state.

---

## Virtualization strategy

E1 implements a deterministic uniform-grid window:

- measured columns,
- estimated/measured row height,
- viewport height and scroll offset,
- default two-row overscan,
- hard maximum of 120 mounted items,
- before/after spacer heights.

### Rules

- Do not virtualize the focused work’s metadata.
- Keep the active item in or adjacent to the mounted window.
- Update measurements through `ResizeObserver` in the future viewport adapter.
- Avoid variable-height masonry in the foundation; it makes spatial keyboard movement and restoration less deterministic.
- If richer layouts arrive later, use measured row groups rather than unbounded absolute positioning.

No virtualization dependency exists in `package.json`. E1 uses a small pure window function. A dependency should be added only if variable measurement, SSR, and accessibility requirements exceed this contract.

---

## Lazy loading and image loading

Implemented intent levels:

| Intent | Meaning |
|--------|---------|
| `priority` | Active/focused work only |
| `prefetch` | Near active neighbors |
| `visible` | In virtual visible range; lazy load |
| `deferred` | Do not mount/request |

### Prefetch radius

- Phone/tablet: 1 neighbor each side.
- Desktop: 2 neighbors each side.
- Slow connection / data saver: 0.
- Stale prefetch must be abortable.

### Image requirements

- Intrinsic dimensions or stable aspect-ratio placeholder.
- Responsive `sizes`.
- `loading="lazy"` for non-priority images.
- `decoding="async"` except where measured otherwise.
- Neutral paper placeholder when URL absent, offline, or failed.
- Placeholder includes visible title/Registry ID; image alternative describes the work where needed.
- Never prefetch every image in a collection.

---

## Memory limits

Foundation budgets:

- **Phone decoded image target:** 64 MB.
- **Desktop decoded image target:** 160 MB.
- **Mounted archive items:** maximum 120.
- **Focused full-size images:** one.
- **Prefetched neighbors:** one radius mobile, two desktop.

Browsers do not expose reliable decoded-image eviction. The renderer must reduce retained DOM/image references and revoke any object URLs it owns. Budgets are design targets, validated through device profiling.

---

## Animation budget

No archive animation is implemented in E1.

Future constraints:

- transform/opacity only for focus transition,
- maximum 240ms for focus transition,
- one transition at a time,
- cancel/reconcile on rapid input,
- no animation for virtual-window item recycling,
- no layout-driven parallax,
- zero-duration presentation under reduced motion,
- input state updates before animation begins.

---

## Interaction latency

| Interaction | Maximum acceptable |
|-------------|--------------------|
| Key/tap visual response | 100ms |
| Active-item movement | one frame where mounted; ≤100ms otherwise |
| Focus metadata from memory | 100ms |
| Focus metadata requiring fetch | useful shell ≤200ms; nonblocking image follows |
| Scroll handler work | ≤4ms per frame target |
| Virtual-window computation | <1ms for 10,000 items target |

The 100ms interaction budget is codified in `LIVING_ARCHIVE_PERFORMANCE_BUDGET`.

---

# Part 5 — Accessibility

## Keyboard

- One roving browse target, not thousands of tab stops.
- Arrow/Home/End/Page commands map through the headless command model.
- Tab exits the archive.
- Enter/Space opens focus.
- Escape closes focus.
- No key triggers a Registry write.

## Focus management

- Active item persists by stable ID.
- Virtualizer mounts before focus moves.
- Focus mode has a labelled title.
- Modal/sheet focus is trapped and restored.
- Route focus moves to the page heading.
- Closing returns to source when it still exists; otherwise the nearest surviving item.

## Reduced motion

- Capability and keyboard order remain identical.
- Focus transitions become immediate.
- Scroll restoration uses `auto`, not smooth.
- No parallax, scale drift, or stagger.

## Screen readers and ARIA

Recommended browse semantics:

- viewport: named region, e.g. `aria-label="Living Archive"`,
- index: semantic list,
- item: list item containing one primary button or link,
- virtual items: `aria-posinset` and `aria-setsize`,
- active position: announced as “Work 18 of 240” in a polite live region after keyboard movement,
- focused work: labelled dialog/sheet or page heading,
- metadata remains visible text.

Avoid `role="grid"` unless the implementation fully supports grid rows/cells and expected keyboard behavior.

## Touch targets

- All actionable controls: minimum 44 × 44 CSS pixels.
- Previous/next/close cannot overlap safe areas.
- Metadata links cannot be tiny inline-only targets on phone.

## Contrast

- Essential title, position, Registry ID, and controls meet WCAG AA.
- Active/selected state is not colour-only.
- Semantic colours retain text/shape/stamp labels.
- Offline placeholders use neutral paper/graphite, not arbitrary signals.

---

# Part 6 — Responsive behavior

## Desktop contract

- Native vertical viewport.
- Multi-column virtual index.
- Optional index rail.
- Keyboard spatial movement.
- Focus presentation may use image + metadata split.
- Ledger switch remains persistently discoverable.

## Tablet contract

- Two/three-column measured index.
- No assumption of hover.
- Touch and keyboard coexist.
- Rail appears only if it does not compress work.
- Focus respects portrait and landscape separately.

## Phone contract

- Independently composed vertical archive index.
- Identity is visible without hover.
- Focus uses available height and safe areas.
- Explicit close and movement controls.
- Native vertical scroll and browser zoom preserved.
- Ledger is one clear view switch away.
- No forced rail, miniature desktop sidebar, or intercepted horizontal scrolling.

## Orientation changes

- Preserve `activeId`, `selectedId`, and approximate visual anchor.
- Recompute columns/window.
- Restore by item ID, not old row number.
- Do not close focus.
- Do not animate reflow under reduced motion.

---

# Part 7 — Migration strategy

## Phase 0 — Foundation (this sprint)

```text
Current Gallery View
        +
headless Living Archive core (unused)
```

- Document current behavior.
- Add tested state/navigation/virtual/image/deep-link core.
- No UI integration.
- No mode or route change.
- Ledger untouched.

## Phase 1 — Shadow integration

```text
Existing artwork array
├── Current Gallery renderer
└── LivingArchiveAdapter + controller (no visual exposure)
```

- Adapt existing filtered items.
- Verify order, selection, and Registry IDs.
- Exercise 1/10/100/10,000 fixture tests.
- Add runtime instrumentation for window and input latency.
- Existing Gallery remains user-facing.

## Phase 2 — Opt-in Living Archive

```text
Ledger | Gallery | Living Archive (limited cohort)
```

- Add a temporary third mode for controlled validation.
- Use existing `/studio/creative` route and query contract.
- Filing actions continue through existing callbacks/modals.
- Compare accessibility, latency, and task completion.
- Session storage migration preserves `ledger` and `gallery`.

## Phase 3 — Gallery migration

```text
Ledger | Living Archive
```

Only after parity gates pass:

- Existing `gallery` preference maps to `archive`.
- Existing Gallery implementation remains available behind rollback for one release.
- No user is forced out of Ledger.
- Deep links remain on existing route.
- No existing record operation changes.

## Phase 4 — Future immersive archive

- May add richer spatial composition and transitions.
- Must use the same reducer, navigation commands, URL contract, image intent, and Registry item adapter.
- Must pass all E1 gates before new motion or interaction is accepted.

---

# Engineering roadmap

## E1 — completed foundation

- [x] Current Works implementation audit.
- [x] Headless archive item/state contracts.
- [x] Deterministic movement commands.
- [x] Focus/open/close/restore reducer.
- [x] Bounded 10,000-item virtual-window computation.
- [x] Image intent policy and budgets.
- [x] Deep-link parser/builder preserving query state.
- [x] Unit coverage for 0, 1, 10, and 10,000-scale behavior.
- [x] Architecture, interaction, accessibility, performance, responsive, and migration specification.

## E2 — controller and adapter

- [ ] `LivingArchiveAdapter` for current artwork read-model rows.
- [ ] React controller hook around reducer.
- [ ] Resize/viewport measurement adapter.
- [ ] Route/history adapter.
- [ ] Scroll/focus restoration adapter.
- [ ] Connection-aware image intent.
- [ ] Development fixtures for 1/10/100/10,000.

## E3 — accessible index prototype

- [ ] `ArchiveViewport`.
- [ ] `ArchiveIndex`.
- [ ] `ArchiveNavigator`.
- [ ] `ArchiveImage` with offline/error placeholder.
- [ ] Roving focus and virtual-set semantics.
- [ ] No animation.
- [ ] Ledger/Gallery remain unchanged during prototype.

## E4 — focus and Registry operations

- [ ] `ArchiveFocus`.
- [ ] Focus trap/restoration or nested-route focus contract.
- [ ] Existing detail, attestation, value, certificate, ownership, and public-record actions.
- [ ] Deep-link validation and browser history.
- [ ] Phone-specific focused composition.

## E5 — migration validation

- [ ] Controlled third-mode exposure.
- [ ] Keyboard/screen-reader/device testing.
- [ ] 10,000-item performance profiling.
- [ ] Image memory profiling.
- [ ] Offline and data-saver testing.
- [ ] Gallery parity and rollback decision.

## E6 — future immersive layer

- [ ] Transition adapter only after all foundation gates pass.
- [ ] No carousel, autoplay, infinite loop, or scroll hijacking.

---

# Acceptance criteria

## Architecture

- [x] Archive state contains stable identities, not duplicated record data.
- [x] Core is independent of React, DOM, routes, APIs, and presentation.
- [x] Ledger remains an independent peer view.
- [x] Existing Registry operations remain outside archive navigation state.
- [x] Explicit selection can be represented by existing-route query state.

## Collection scale

- [x] 1 artwork: active/focus behavior remains valid.
- [x] 10 artworks: full render window remains valid.
- [x] 100 artworks: bounded virtualization contract applies.
- [x] 10,000 artworks: render window remains below configured maximum.
- [ ] 10,000 artworks: runtime data acquisition/profile validation (E2/E5).

## Input

- [x] Shared commands defined for keyboard.
- [x] Mouse, trackpad, and touch interaction rules defined.
- [x] No movement command wraps by default.
- [x] No navigation action performs a Registry write.
- [ ] Runtime input adapters and device validation (E2/E5).

## Responsive

- [x] Desktop, tablet, phone portrait, and phone landscape contracts defined.
- [x] Phone does not depend on compressed desktop behavior.
- [x] Orientation restoration is ID-based.
- [ ] Runtime responsive prototype validation (E3/E5).

## Accessibility

- [x] Roving-focus model defined.
- [x] Screen-reader virtual-set strategy defined.
- [x] Reduced-motion behavior defined.
- [x] Touch and contrast requirements defined.
- [ ] Runtime focus, ARIA, screen-reader, zoom, and contrast validation (E3/E5).

## Performance

- [x] Virtual window and render cap implemented.
- [x] Image intent and memory targets defined.
- [x] Interaction and animation budgets defined.
- [x] Offline placeholder contract defined.
- [ ] Runtime network, memory, decoding, and Core Web Vitals validation (E5).

## Regression

- [x] No Gallery UI change in E1.
- [x] No Ledger change in E1.
- [x] No route change.
- [x] No schema change.
- [x] No API change.
- [x] No permission change.
- [x] No animation implementation.
- [x] No carousel implementation.

---

## Governing decision

The Living Archive may become immersive later, but its foundation must remain ordinary in the best engineering sense:

- deterministic,
- bounded,
- addressable,
- accessible,
- input-agnostic,
- and subordinate to the canonical Registry record.

The signature experience should come from the work and its history—not from hiding familiar controls or inventing motion before trust.
