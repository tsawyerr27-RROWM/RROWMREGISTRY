# Experience 1.0 — Platform Experience Audit

**Phase 1 — Read-only implementation audit**  
**Date:** 18 July 2026  
**Scope:** All current Studio surfaces  
**Status:** Audit complete — no production code or UI changes

---

## Executive assessment

RROWM already has a distinctive institutional foundation. Its strongest surfaces feel like cultural infrastructure: paper filing sheets, serif hierarchy, mono identifiers, restrained motion, evidence tiers, and language centred on records rather than engagement.

The gap to world-class quality is **not primarily aesthetic**. It is the difference between the confidence promised by the visual system and the confidence delivered by the interaction system.

### Strongest qualities

- Canonical-record semantics are visible across Works, Ownership, Verification, Certificates, and Field records.
- Public artwork records are artwork-forward, citeable, and emotionally credible.
- Collector and Organisation Studio heroes establish stewardship and institutional responsibility well.
- Deals use unusually strong ledger and execution language.
- Inbox semantic signals map activity to registry meaning rather than generic notification state.
- The shared desktop/mobile Studio shell is coherent and broadly responsive.

### Highest-priority gaps

1. **Consequential interactions are not consistently safe or accessible.** Shared dialogs lack complete focus management; some record cards contain nested interactive controls; deal reads can mutate status; proposal creation is non-atomic.
2. **Performance perception is weakest on the largest Studio homes.** Creative and Organisation block first paint behind broad client-side data chains, including data for inactive sections.
3. **Artwork prominence is inconsistent.** Public records and Archive foreground works; operational Studio surfaces frequently reduce them to small thumbnails or omit them.
4. **Registry semantic colour drifts into generic UI state.** Cobalt, emerald, amber, and gradients are sometimes used for selection, success, health, or decoration.
5. **Several surfaces are too dense.** Repeated metrics, nested filing sheets, long settings stacks, and multiple co-equal actions reduce visual silence.
6. **Certificate navigation is incoherent.** The Certificates section does not directly open its named object, while shared certificate links lead external recipients to an authenticated route.
7. **History handling is not yet scale-ready.** Deals and Rights can load unbounded histories; Inbox silently caps history; large catalogues and chronologies lack paging or windowing.

### Overall conclusion

The platform is visually mature enough for Experience 1.0. The next quality gain should come from **interaction trust, progressive loading, accessibility, semantic discipline, and record-first hierarchy**—not new visual treatments.

---

## Audit method and limits

This is a static, evidence-based review of current routes, components, styles, loading paths, navigation, and product doctrine.

Reviewed references include:

- `docs/v2/registry-principles.md`
- `docs/v2/registry-voice.md`
- `docs/v2/founding-registry-experience-blueprint.md`
- `docs/rc1-design-system-freeze.md`
- `styles/studio-v2.ts`
- `styles/registry-v2.ts`
- `styles/workspace-design.ts`
- `app/globals.css`

No authenticated browser walkthrough, device lab, screen-reader session, network trace, Core Web Vitals measurement, or user research was available. Accessibility and performance observations are implementation-level predictions and should later be validated at runtime.

### Scoring

Scores are directional:

- **5** — world-class / exemplary
- **4** — strong
- **3** — competent, material gaps
- **2** — weak
- **1** — critical

Criteria abbreviations in surface scorecards:

`EI` Emotional impact · `FI` First impression · `VH` Visual hierarchy · `AP` Artwork prominence · `TY` Typography · `SR` Spatial rhythm · `NV` Navigation · `MO` Mobile · `AC` Accessibility · `PP` Performance perception · `RA` Registry alignment · `PQ` Premium quality

---

## Cross-platform scorecard

| Surface | EI | FI | VH | AP | TY | SR | NV | MO | AC | PP | RA | PQ |
|---------|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Creative Studio | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 4 | 2 | 2 | 4 | 4 |
| Collector Studio | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 2 | 5 | 4 |
| Organisation Studio | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 2 | 2 | 4 | 4 |
| Works | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 3 | 5 | 4 |
| Artwork Record | 5 | 5 | 4 | 5 | 5 | 4 | 3 | 4 | 2 | 3 | 5 | 5 |
| Certificates | 4 | 4 | 4 | 3 | 5 | 4 | 2 | 3 | 2 | 3 | 5 | 4 |
| Ownership | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 3 | 2 | 2 | 5 | 4 |
| Archive | 3 | 2 | 3 | 4 | 3 | 4 | 2 | 3 | 2 | 3 | 4 | 3 |
| Rights | 2 | 3 | 3 | 1 | 4 | 4 | 4 | 3 | 3 | 3 | 4 | 3 |
| Deals | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 2 | 2 | 4 | 4 |
| Inbox | 3 | 3 | 4 | 2 | 4 | 4 | 4 | 4 | 2 | 3 | 5 | 4 |
| Account | 3 | 4 | 3 | 2 | 4 | 3 | 4 | 3 | 3 | 2 | 3 | 3 |

**Reading:** Registry alignment and typography are consistently strongest. Accessibility and performance perception are the systemic weaknesses. Artwork prominence varies sharply between public/cultural surfaces and operational surfaces.

---

# Surface audits

## 1. Creative Studio

**Primary implementation:** `app/studio/creative/page.tsx`, `ArtistWorkspaceHero.tsx`, `StudioRoleBand.tsx`

### Current strengths

- Filing sheets, stamps, bone surfaces, serif display type, and mono metadata create an authoritative first impression.
- Authored catalogue, records, certificates, and ownership remain semantically distinct.
- Desktop sidebar and 56px mobile section switcher provide coherent role-local navigation.
- Major grids collapse cleanly and motion respects reduced-motion preferences.
- Registration language and completion slab align strongly with Registry Voice.

### Current weaknesses

- `StudioRoleBand` and `ArtistWorkspaceHero` both behave as hero-level introductions and render competing `<h1>` elements.
- Works, verified, and priced metrics repeat across role band, hero, health panels, and status text.
- Many actions compete in the first viewport; the work itself remains in a secondary preview.
- Generic emerald success/health styling and global lime hover states weaken semantic-colour discipline.
- Toasts are not consistently exposed as live status or alert messages.
- The 3,000+ line client route waits for artworks, representation, amendments, certificates, activity, and ownership before releasing the page.
- Nine-to-ten-pixel mono labels reduce legibility, especially on mobile and at zoom.

### Quick wins

- **E1-Q1:** Resolve duplicate heading hierarchy and remove one repeated metric layer.
- **E1-Q2:** Add live-region semantics to filing/error feedback.
- **E1-Q3:** Replace generic health/success colour with neutral presentation unless tied to a registry event.
- **E1-Q4:** Raise essential metadata to a practical 11–12px minimum.

### Medium improvements

- **E1-M1:** Separate first-paint identity/primary action data from inactive-section data.
- **E1-M2:** Reduce competing hero actions to one clear filing purpose.
- **E1-M3:** Increase the featured artwork’s relative prominence when imagery exists.

### Transformational opportunity

- **E1-T1:** Treat the home as one registry-status hierarchy rather than hero + analytics + claims + governance + archive summary simultaneously.

**Implementation complexity:** Quick wins low; loading and hierarchy medium–high.  
**Expected impact:** Very high—faster time to confidence, stronger emotional focus, lower cognitive load.

---

## 2. Collector Studio

**Primary implementation:** `app/studio/collector/page.tsx`, `CollectorWorkspaceHero.tsx`, `CollectorWorkspaceOverview.tsx`

### Current strengths

- The clearest expression of RROWM’s stewardship identity: archive, steward, ownership on record, continuity, and filing.
- Editorial artwork preview, Registry ID, public-record links, and semantic transfer attention feel consequential.
- Empty states now provide a clear claim path and Registry browse action.
- Desktop/mobile navigation is coherent and touch targets are generally strong.
- The hero and paper surfaces achieve premium institutional quality.

### Current weaknesses

- Held, verified, and continuity metrics repeat in the role band, hero, overview, and health slab.
- A large client-side chain resolves pending acquisitions, profile, owned works, transfers, artist labels, certificates, ownership events, signals, and metrics before clearing loading.
- Raw artwork images lack responsive sizing, stable dimensions, and deliberate hero/list loading priority.
- “Latest” preview selection lacks reliable `created_at` input.
- Secondary links and some pending-transfer controls are visually and physically too small.
- Activity and metrics can push actual holdings below the fold.

### Quick wins

- **E2-Q1:** Remove one repeated metric layer and elevate the first holding.
- **E2-Q2:** Correct “latest” artwork selection data.
- **E2-Q3:** Raise tiny metadata and normalize all actions to 44px touch targets.

### Medium improvements

- **E2-M1:** Apply responsive image delivery with stable dimensions.
- **E2-M2:** Prepare a critical collector snapshot first; defer activity and insights.

### Transformational opportunity

- **E2-T1:** Evolve the home into a collection dossier: one dominant work/collection moment, one continuity summary, and one consequential filing.

**Implementation complexity:** Low for hierarchy; high for data preparation.  
**Expected impact:** Very high—Collector is already strong, so these changes would make it exemplary.

---

## 3. Organisation Studio

**Primary implementation:** `app/studio/organisation/page.tsx`, `components/gallery/*`, `components/Studio/Opportunities/*`

### Current strengths

- Role band → organisation identity → verification command creates a credible institutional entrance.
- Verification, amendments, and record-depth language are among the platform’s strongest registry-aligned workflows.
- Catalogue priority and integrity ordering makes governance actionable.
- The typography and filing-sheet system remain coherent across most sections.
- Roster and opportunity empty states explain meaningful next filings.
- Shared responsive shell and reduced-motion handling are strong.

### Current weaknesses

- First paint is blocked behind membership plus broad staged queries for summary, amendments, confirmations, historical links, artworks, integrity, insights, and metrics.
- The 2,900-line client page imports all sections and owns a large hydration boundary.
- Overview repeats core counts across role band, hero, status, intelligence, and summary.
- Artwork is a small hero frame, absent from verification slabs, and only 40px in many catalogue rows.
- Local-state section navigation has no stable URL, browser history, refresh continuity, or heading focus.
- Opportunities uses a separate economic/SaaS visual vocabulary, generic emerald selection/publish states, and visible disabled placeholders.
- Compact record actions and invitation tables are difficult on mobile.
- Multiple in-page `<h1>` elements and incomplete tab semantics weaken accessibility.
- Cobalt selected navigation and generic amber attention dots do not consistently represent registry events.

### Quick wins

- **E3-Q1:** Remove disabled opportunity placeholders and dead `href="#"` links.
- **E3-Q2:** Normalize compact actions to 44px and establish one page `<h1>`.
- **E3-Q3:** Neutralize generic selected-state colour; announce attention textually.
- **E3-Q4:** Remove repeated overview metrics and retain one primary triplet.
- **E3-Q5:** Confirm test controls cannot appear for normal organisation users.

### Medium improvements

- **E3-M1:** Make sections URL/history-aware and move focus on section change.
- **E3-M2:** Bring Opportunities and Invitations onto the shared filing primitives and semantic signals.
- **E3-M3:** Split identity/attention from deferred intelligence and section datasets.
- **E3-M4:** Replace narrow-screen invitation tables with stacked filing rows.
- **E3-M5:** Add search/paging safeguards and stronger artwork context to operational queues.

### Transformational opportunity

- **E3-T1:** Organise the surface around stable command, record, and publishing workspaces while preserving the same registry model.

**Implementation complexity:** Low quick wins; medium–high structural work.  
**Expected impact:** Very high—especially perceived speed, institutional confidence, and scalability.

---

## 4. Works

**Primary implementation:** `ArtworksSection.tsx`, `CreativeArtworkSlab.tsx`, `ArchiveGalleryGrid.tsx`

### Current strengths

- “Authored works on file” reinforces persistent authorship.
- Ledger/gallery modes support both administrative review and cultural browsing.
- Trust tier, Registry ID, certificate state, pricing phase, and ownership context are visible.
- Filters match meaningful registry states: filed, self-attested, verified, priced, and unpriced.
- The empty state leads directly to registration.

### Current weaknesses

- `CreativeArtworkSlab` behaves as an ARIA button while containing nested action buttons, producing an unsafe composite interaction.
- Search relies on placeholder text rather than a persistent accessible label.
- View-switcher tab semantics omit expected keyboard behavior and tabpanel relationships.
- Ledger thumbnails disappear on small screens, making mobile especially text-heavy.
- Raw images lack responsive sizes and intrinsic dimensions.
- Titles, subtitles, and IDs are uniformly truncated.
- There is no visible list-size safeguard for large catalogues.
- The empty-state mark uses a decorative gradient despite the product doctrine.
- One search query persists across Works, Certificates, and Ownership.

### Quick wins

- **E4-Q1:** Correct the interactive-card model and label search.
- **E4-Q2:** Match switcher semantics to implemented keyboard behavior.
- **E4-Q3:** Remove decorative gradient and preserve essential metadata legibility.

### Medium improvements

- **E4-M1:** Deliver responsive images and preserve mobile artwork presence.
- **E4-M2:** Introduce large-list paging/windowing and section-local filters.

### Transformational opportunity

- **E4-T1:** Separate record navigation from consequential filing controls so each action has one unambiguous target.

**Implementation complexity:** Low–medium.  
**Expected impact:** Very high accessibility impact; high catalogue clarity.

---

## 5. Artwork Record

**Primary implementation:** `ArtworkDetailModal.tsx`, `FieldRecordView.tsx`, `RegistryRecordHero.tsx`, `PublicRegistryRecordView.tsx`, `StudioArtworkClient.tsx`

### Current strengths

- The canonical Field record is the most artwork-forward surface: a large 4:5 work image anchors title, Creative, Registry ID, trust, organisation, certificate, and date.
- Serif title plus mono ID makes the record citeable and permanent.
- Relationships, provenance, ownership, certificate state, and technical details create genuine record depth.
- Field and ledger routes are server-loaded.
- Studio holding detail uses artwork, holder, certificate, provenance, and value history coherently.

### Current weaknesses

- Shared modal dialogs lack focus trap, initial focus, Escape handling, restoration, and labelled-dialog contracts.
- Public and Studio artwork images often use empty alternative text and raw `<img>`.
- Studio detail route is visually detached from `StudioShell`, creating navigation discontinuity.
- Some Studio links use legacy artwork routes before reaching canonical Field records.
- Mobile can open with a full 4:5 image before identity/trust context appears.
- Field record can show several competing secondary actions.
- Record loading performs sequential base record, artist, organisation, relationship, ownership, and acquisition queries.
- Preview, public summary, and forensic ledger are not consistently described as different levels.
- Studio holding “open” actions can trigger verification/write side effects without clearly communicating consequence.

### Quick wins

- **E5-Q1:** Complete dialog accessibility and meaningful artwork alternative text.
- **E5-Q2:** Remove legacy route hops and communicate side effects of record opening.
- **E5-Q3:** Audit hero action hierarchy and restore Studio navigation continuity.

### Medium improvements

- **E5-M1:** Parallelize independent record queries and optimize images.
- **E5-M2:** Reduce nested scrolling and label preview/public/ledger depth explicitly.

### Transformational opportunity

- **E5-T1:** Establish one canonical record-depth model across Studio preview, Field summary, and full ledger.

**Implementation complexity:** Medium–high.  
**Expected impact:** Very high—this is the platform’s central trust surface.

---

## 6. Certificates

**Primary implementation:** `CertificatesSection.tsx`, `CertificateOverviewModal.tsx`, `CertificateDocumentView.tsx`, `app/certificate/[registry_id]/page.tsx`

### Current strengths

- The full document convincingly resembles a certificate rather than a SaaS report.
- Seal, Registry ID, certificate number, dates, fingerprints, QR verification, and print rules establish authority.
- Revocation is explicit and certification uses monochrome semantics.
- Studio supports ledger/gallery views and explains eligibility in empty states.

### Current weaknesses

- The dedicated certificate callback is unused; selecting a certificate opens generic artwork detail instead of the certificate.
- Share links target an authenticated-only certificate route, contradicting the external sharing promise.
- Operational/share controls precede the certificate identity, weakening ceremony.
- Artwork is relatively small compared with document evidence.
- Artwork and QR alternatives are empty; overview inherits shared dialog defects.
- QR is generated per dynamic request; metadata and page load duplicate database work.
- Decorative gradients and emerald decoration remain.
- Missing/overview states are less mature than the document itself.
- Very small hash and metadata text challenges mobile readability.

### Quick wins

- **E6-Q1:** Restore direct certificate navigation from certificate tiles.
- **E6-Q2:** Align share language and destination access.
- **E6-Q3:** Add meaningful image/QR alternatives and remove decorative gradients.

### Medium improvements

- **E6-M1:** Optimize document image delivery and QR caching.
- **E6-M2:** Align missing, overview, and issued states to one document hierarchy.

### Transformational opportunity

- **E6-T1:** Unify filtered certificate list, trust overview, issued document, and sharing into one coherent certificate lifecycle.

**Implementation complexity:** Low for routing fixes; medium–high for lifecycle coherence.  
**Expected impact:** Very high—current navigation undermines one of RROWM’s most important trust objects.

---

## 7. Ownership

**Primary implementation:** `OwnershipSection.tsx`, `WorkspaceRecordCard.tsx`, `OwnershipEventsChronology.tsx`

### Current strengths

- Strong semantic mapping: transfer/stewardship lime, sale ember, certification seal, unresolved exception amber.
- Filters correctly separate held, transfer required, sold/transferred, and full authored catalogue.
- Holder, transfer depth, Registry ID, and ledger access reflect canonical ownership.
- Authorship persists after sale.
- Public chronology presents ordered lineage, dates, custody, and sale values.

### Current weaknesses

- `WorkspaceRecordCard` is an ARIA button containing a focusable ledger link.
- Keyboard activation depends on each caller rather than the component contract.
- Transfer depth relies on decorative dots and `title`, weak on touch and assistive technology.
- Cards combine dense status, holder, depth, ID, and actions.
- Consequential transfer forms and modals inherit focus, labeling, and nested-scroll issues.
- Some status copy remains hardcoded and generic emerald/amber styling persists.
- Ownership data loads before the section is opened.
- Long chronology has no scale safeguard.

### Quick wins

- **E7-Q1:** Correct card/form semantics and expose transfer depth as text.
- **E7-Q2:** Ensure every state is textual, localized, and not colour-only.
- **E7-Q3:** Communicate any ledger-open verification side effect.

### Medium improvements

- **E7-M1:** Defer ownership datasets until needed; optimize artwork images.
- **E7-M2:** Reduce modal/nested-scroll density and safeguard long chronologies.

### Transformational opportunity

- **E7-T1:** Separate catalogue browsing, canonical-holder interpretation, sale resolution, transfer filing, and verification into clearly staged consequences.

**Implementation complexity:** Medium–high.  
**Expected impact:** Very high due to legal/trust consequence.

---

## 8. Archive

**Primary implementation:** `PersonalArchiveShell.tsx`, `PersonalArchivePageContent.tsx`

### Current strengths

- Four-by-five artwork imagery dominates populated cards.
- Archive remains a personal reference and links to the current canonical record rather than rewriting it.
- Cards expose Registry ID, artist, status, continuity, date, and record routes.
- Empty-state language is institutional and links toward the Registry.

### Current weaknesses

- Loading, error, empty, and populated states have different structural roots; only populated state includes the page title/lede.
- Error state has no retry.
- No count, sort, filter, view switch, or archive orientation.
- Linked images use `alt=""`, leaving the first link unnamed.
- Raw images omit lazy loading, dimensions, and responsive sources.
- Essential 10–11px neutral-400 metadata is likely below contrast requirements.
- The route repeats auth/profile gating before fetching archive content.
- The fixed card gallery feels less like an archival instrument than surrounding Studio surfaces.

### Quick wins

- **E8-Q1:** Preserve title/lede across all states and add retry.
- **E8-Q2:** Name image links; add dimensions/lazy loading; fix metadata contrast.

### Medium improvements

- **E8-M1:** Add count/sort and existing archive list/gallery primitives.
- **E8-M2:** Reuse guarded role context instead of duplicate client auth gating.

### Transformational opportunity

- **E8-T1:** Develop the personal archive as a research/reference instrument with filing context and continuity changes, without altering canonical records.

**Implementation complexity:** Low–medium; transformation high.  
**Expected impact:** High—Archive currently has the largest presentation gap.

---

## 9. Rights

**Primary implementation:** `StudioRightsWorkspace.tsx`, `RightsLicenseRow.tsx`, `lib/rights-ledger.ts`

### Current strengths

- Clear framing of active, expiring, and historical agreements.
- Simple heading → tabs → ledger hierarchy is easy to scan.
- Empty copy explains that rights originate from accepted deals and activate on record.
- Deep links select the correct rights folder.
- Server enrichment batches artwork and participant metadata.

### Current weaknesses

- Near-identical text cards produce little emotional or artwork impact.
- Work identity lacks image, Registry ID, term progress, scope visualization, and provenance connection.
- Deep-link target receives only a DOM ID—no scroll, focus, or visible highlight.
- Tabs are undersized and lack complete keyboard/tab relationships.
- Every license is loaded and rendered without pagination, search, or virtualization.
- Generic retry/loading language is less refined than Registry Voice.

### Quick wins

- **E9-Q1:** Make deep links scroll/focus/highlight and enlarge tab targets.
- **E9-Q2:** Complete tab semantics and named loading/error language.

### Medium improvements

- **E9-M1:** Add paging/search safeguards and work/Registry context.
- **E9-M2:** Distinguish expiring/revoked states through text/structure, not arbitrary colour.

### Transformational opportunity

- **E9-T1:** Evolve Rights from a card archive into a canonical rights instrument: work identity, scope, term, obligations, and provenance.

**Implementation complexity:** Low–medium; instrument model high.  
**Expected impact:** High strategic value; medium immediate user value until rights volume grows.

---

## 10. Deals

**Primary implementation:** `StudioDealsWorkspace.tsx`, `DealWorkspace.tsx`, `DealEditorWorkspace.tsx`, `AcquisitionFilingHero.tsx`

### Current strengths

- “Execution room,” negotiation record, filing, and ledger language establish seriousness.
- Desktop split view and mobile Inbox/Deal/Execution panes are intentionally responsive.
- Acquisition filing correctly separates sale, transfer, seller, buyer, blocked, and ownership-complete states.
- Long-form negotiation measure and typography feel editorial rather than chat-like.

### Current weaknesses

- Opening an incoming proposal silently changes its status to `under_review`; a read action mutates the record.
- Proposal creation uses sequential deal/message/status writes and can leave partial records.
- Accept, decline, send, close, and status actions lack consistent pending locks, deduplication, confirmation, and consequence acknowledgement.
- Repeated nested surfaces make hierarchy visually dense.
- Artwork prominence varies by deal type; non-acquisition deals may omit it.
- Selected rows/navigation use registration cobalt for generic selection.
- Tabs and correspondence textarea have incomplete semantics/labels.
- Artwork/counterparty context arrives through client waterfalls.
- Deals can load unbounded history.

### Quick wins

- **E10-Q1:** Remove generic cobalt selection and label correspondence controls/errors.
- **E10-Q2:** Add pending/disabled/aria-busy states and confirmation to consequential actions.

### Medium improvements

- **E10-M1:** Bundle selected-deal context and page histories.
- **E10-M2:** Reduce nested container hierarchy and normalize artwork context across relevant deal types.

### Transformational opportunity

- **E10-T1:** Make deal review read-only until explicit acknowledgement, and provide one atomic “issue proposal” operation.

**Implementation complexity:** Medium–high.  
**Expected impact:** Critical—this directly affects trust and data integrity.

---

## 11. Inbox

**Primary implementation:** `NotificationInboxPanel.tsx`, `NotificationInboxBell.tsx`, `app/studio/inbox/page.tsx`

### Current strengths

- Best semantic-signal use: registration, sale, transfer, certification, and correction come from central mapping.
- Notifications group by Registry meaning rather than generic read/unread state.
- Serif title, restrained body, timestamp, and event rail create compact hierarchy.
- Mobile sheet respects safe areas, body scroll lock, bounded scrolling, and reduced motion.
- Read updates are optimistic and errors are retained.

### Current weaknesses

- Dialog declares modal semantics but lacks initial focus, focus trap, inert background, and focus restoration.
- Standalone page begins at `<h2>` and lacks a route-level `<h1>`.
- Page caps history at 50 with no pagination, total, or explanation.
- Load/action errors and unread-count changes are not consistently announced.
- Page load error has no retry.
- Header bell and page can issue separate notification requests.
- Scroll fades use CSS gradients despite the visual doctrine.
- Artwork context is minimal even when a notification is work-specific.

### Quick wins

- **E11-Q1:** Add page `<h1>`, retry, live regions, and 44px top actions.
- **E11-Q2:** Remove gradient fades or replace with neutral structural cues.

### Medium improvements

- **E11-M1:** Share accessible sheet focus behavior and notification state/cache.
- **E11-M2:** Add cursor pagination and optional work identity where relevant.

### Transformational opportunity

- **E11-T1:** Address Inbox, Deal ledger, Rights, and record chronology through one event-addressable registry history model.

**Implementation complexity:** Low–medium; unified history high.  
**Expected impact:** High accessibility and continuity value.

---

## 12. Account

**Primary implementation:** `app/studio/account/page.tsx`, `AccountPageContent.tsx`, `AccountPresenceHero.tsx`, `PrivacyDataSection.tsx`

### Current strengths

- Role-aware content prevents irrelevant fields.
- Visibility copy distinguishes public presence from internal records.
- Form labels, switch roles, checked states, and save/error announcements are generally strong.
- Desktop sticky in-page nav and mobile section nav help a long form.
- Deletion language preserves provenance/audit history.

### Current weaknesses

- Hero contains role, identity, visibility concepts, multiple tiles, actions, Registry links, snapshot, and optional artwork—too many competing elements.
- Generic emerald/violet communicates arbitrary on/live/anonymous state.
- Mixed visual systems—Studio hero, floating blocks, glass tiles, pills, and form panels—reduce coherence.
- Profile completeness and checklist language feels SaaS-like and conflicts with Registry Principles.
- Account blocks behind actor/profile and collector artwork-preview loading.
- Privacy children duplicate CSRF requests.
- Smooth section scrolling does not explicitly respect reduced motion.
- Mobile section navigation lacks explicit current-state semantics.
- The long stack gives profile settings and consequential legal lifecycle similar visual weight.

### Quick wins

- **E12-Q1:** Neutralize generic state colour and respect reduced motion/current-state semantics.
- **E12-Q2:** Reduce hero duplication; move visibility details nearer controls.
- **E12-Q3:** Reframe completeness/checklist copy as public-presence information, not progress.

### Medium improvements

- **E12-M1:** Standardize on one paper/surface vocabulary.
- **E12-M2:** Release critical identity first, defer preview, and share CSRF state.

### Transformational opportunity

- **E12-T1:** Treat Account as a participant dossier with weighted identity, public presence, privacy, and legal lifecycle filings—not one flat settings page.

**Implementation complexity:** Low quick wins; medium–high dossier hierarchy.  
**Expected impact:** High—Account is trusted infrastructure and must feel as deliberate as records.

---

# Cross-surface findings

## Accessibility

### Critical patterns

- Shared `ModalShell` does not provide complete focus lifecycle or accessible naming.
- Mobile Studio and Inbox sheets do not trap/restore focus.
- Several record cards emulate buttons while containing links/buttons.
- Tabs often expose ARIA roles without full keyboard/tab-panel behavior.
- Archive image links can be unnamed.
- Essential metadata frequently uses 8–10px type and weak muted contrast.
- Some async outcomes/errors are not announced.

### Strong patterns to preserve

- Many controls meet 44px targets.
- Forms usually have labels.
- Switches expose state.
- Reduced-motion CSS exists across shared Studio motion.
- Semantic event markers are centrally mapped.

## Performance perception

- Creative and Organisation are monolithic client pages with broad blocking initialization.
- Collector and Account also withhold critical identity behind secondary data.
- Raw images are common in artwork-heavy routes.
- Archive duplicates role/session gating.
- Deals and selected-record panels add client waterfalls.
- Deals/Rights histories are unbounded; Inbox truncates without navigation.
- Plain-text loading states produce abrupt replacement instead of stable page geometry.

## Registry alignment

### Strong

- Ownership, verification, amendments, certificate document, public record, and Inbox event grouping.

### Drift

- Cobalt for selected navigation/list state.
- Emerald for success, health, publish, and visibility.
- Amber as generic attention.
- Gradients in artwork empty marks, certificate decoration, and scroll fades.
- Portfolio, completeness, dashboard metrics, and generic “Loading/Processing” language.

## Premium quality

Premium quality is highest where the interface has:

1. One cultural object or record as the focal point.
2. One clear hierarchy.
3. Generous paper space.
4. Specific filing language.
5. Restrained semantic signals.

It drops where the interface accumulates:

- nested rounded cards,
- repeated metrics,
- tiny metadata,
- visible placeholders,
- generic status colours,
- text-only loading,
- and co-equal actions.

---

# Prioritised roadmap

## Ranking model

Scores use 1–5:

- **Impact:** effect on quality/risk
- **Effort:** implementation cost (5 highest)
- **User value:** direct participant benefit
- **Strategic:** importance to Registry Principles and trust

The order prioritizes trust/accessibility first, then time-to-use, record hierarchy, scale, and long-horizon transformations.

| Rank | ID | Opportunity | Surfaces | Impact | Effort | User value | Strategic |
|-----:|----|-------------|----------|-------:|-------:|-----------:|----------:|
| 1 | R1 | Complete shared dialog/sheet focus, Escape, restoration, naming, and background isolation | All modal surfaces, Inbox, mobile nav | 5 | 3 | 5 | 5 |
| 2 | R2 | Correct nested interactive record-card patterns and complete tab/search semantics | Works, Ownership, Rights, Deals | 5 | 3 | 5 | 5 |
| 3 | R3 | Stop implicit deal mutation on open; add explicit acknowledgement | Deals | 5 | 2 | 5 | 5 |
| 4 | R4 | Make proposal issuance atomic and safeguard consequential mutations | Deals | 5 | 4 | 5 | 5 |
| 5 | R5 | Restore direct certificate navigation and align sharing access promise | Certificates | 5 | 2 | 5 | 5 |
| 6 | R6 | Separate critical first-paint data from inactive/secondary datasets | Creative, Collector, Organisation, Account | 5 | 4 | 5 | 5 |
| 7 | R7 | Remove semantic-colour drift and decorative gradients | Shared shell, all Studios | 4 | 2 | 4 | 5 |
| 8 | R8 | Fix image alternatives, unnamed links, tiny essential text, and contrast | Artwork Record, Archive, Certificates, all lists | 5 | 2 | 5 | 5 |
| 9 | R9 | Add responsive artwork delivery, stable dimensions, and priority policy | All artwork surfaces | 4 | 3 | 4 | 4 |
| 10 | R10 | Establish one page heading and announced section transitions | Creative, Organisation, Inbox | 4 | 2 | 4 | 4 |
| 11 | R11 | Remove repeated Studio-home metrics and enforce one primary action | Creative, Collector, Organisation | 4 | 2 | 5 | 5 |
| 12 | R12 | Make Organisation section navigation URL/history-aware | Organisation | 4 | 3 | 4 | 4 |
| 13 | R13 | Bring Opportunities onto Registry Voice, filing primitives, and neutral selection state | Organisation | 4 | 3 | 4 | 5 |
| 14 | R14 | Preserve stable page identity and retry across loading/error/empty states | Archive, Inbox, Rights, Studio routes | 4 | 2 | 4 | 4 |
| 15 | R15 | Add pending, busy, dedupe, confirmation, and live feedback to consequential actions | Deals, Ownership, Verification | 5 | 3 | 5 | 5 |
| 16 | R16 | Page/window large catalogues, histories, and chronologies | Works, Organisation, Rights, Deals, Inbox, Ownership | 4 | 4 | 4 | 5 |
| 17 | R17 | Clarify preview vs public summary vs full ledger | Artwork Record | 4 | 3 | 4 | 5 |
| 18 | R18 | Restore Studio navigation continuity on holding/artwork detail | Artwork Record | 4 | 2 | 4 | 4 |
| 19 | R19 | Improve artwork prominence in operational queues and mobile ledger rows | Creative, Organisation, Works, Rights, Deals | 4 | 3 | 4 | 4 |
| 20 | R20 | Consolidate notification state/cache and add history pagination | Inbox | 3 | 3 | 4 | 4 |
| 21 | R21 | Normalize mobile touch targets and transform wide tables into filing rows | Organisation, Rights | 4 | 3 | 5 | 4 |
| 22 | R22 | Defer Account preview, share CSRF context, and reduce hero duplication | Account | 4 | 3 | 4 | 4 |
| 23 | R23 | Add archive count/sort/view primitives and reuse guarded role context | Archive | 3 | 3 | 4 | 4 |
| 24 | R24 | Communicate read-like actions that perform ledger verification/write effects | Ownership, Artwork Record | 5 | 2 | 5 | 5 |
| 25 | R25 | Remove production placeholders, dead links, and test-control exposure risk | Organisation | 4 | 1 | 4 | 5 |
| 26 | R26 | Unify certificate list, overview, issued document, and missing states | Certificates | 5 | 4 | 5 | 5 |
| 27 | R27 | Establish a canonical rights instrument around work, scope, term, and obligations | Rights | 4 | 5 | 4 | 5 |
| 28 | R28 | Establish one event-addressable history across Inbox, Deals, Rights, and chronology | Cross-platform | 5 | 5 | 5 | 5 |
| 29 | R29 | Reframe Account as a weighted participant dossier | Account | 4 | 5 | 4 | 4 |
| 30 | R30 | Reframe Studio homes around identity, Registry Status, and one consequential filing | Creative, Collector, Organisation | 5 | 5 | 5 | 5 |

---

## Recommended implementation order

### Stage 1 — Protect interaction trust

**R1–R5, R8, R15, R24, R25**

Address accessibility, unsafe composite controls, implicit mutations, proposal atomicity, certificate routing, action safeguards, and hidden ledger consequences before visual refinement.

**Why first:** These issues can cause error, exclusion, or loss of trust even when the screen looks premium.

### Stage 2 — Improve time to confidence

**R6, R9, R14, R18, R22**

Release critical identity and record context first; optimize image delivery; preserve stable loading/error geometry; remove route discontinuity and duplicate client gating.

**Why second:** Perceived reliability is part of institutional trust.

### Stage 3 — Restore semantic and visual discipline

**R7, R10–R13, R19, R21**

Remove generic event colours/gradients, normalize headings and mobile controls, reduce repeated metrics, stabilize Organisation navigation, align Opportunities, and return artwork to operational context.

**Why third:** This produces a coherent Experience 1.0 without redesigning the platform.

### Stage 4 — Prepare for real catalogue scale

**R16, R20, R23**

Page or window long lists/histories, consolidate notifications, and give Archive basic retrieval controls.

**Why fourth:** These safeguards become urgent as the Founding Registry grows.

### Stage 5 — Strengthen canonical product models

**R17, R26–R30**

Clarify record-depth levels; unify certificate lifecycle; establish rights/history models; reframe Account and Studio hierarchy.

**Why last:** These are high-value structural opportunities that require product specification and principle review—not opportunistic UI work.

---

## Experience 1.0 acceptance gates

Before implementation is considered complete:

- [ ] No read action silently mutates a Registry state.
- [ ] Consequential writes are atomic or safely recoverable.
- [ ] Every dialog/sheet passes keyboard focus lifecycle testing.
- [ ] Every record card has one valid interaction model.
- [ ] Every page has one clear heading and one primary purpose.
- [ ] Essential text meets WCAG contrast and remains legible at 200% zoom.
- [ ] Mobile actions meet practical touch-target requirements.
- [ ] Artwork images have meaningful alternatives, stable dimensions, and responsive delivery.
- [ ] Initial Studio content is not blocked by inactive-section data.
- [ ] Registry semantic colours represent events—not selection, success, or decoration.
- [ ] Empty, loading, error, and populated states preserve page identity.
- [ ] Long histories and catalogues have an explicit scale strategy.
- [ ] Certificate list, overview, document, and sharing form one coherent path.
- [ ] Runtime validation covers keyboard, screen reader, mobile devices, network traces, and Core Web Vitals.

---

## Final recommendation

Do not redesign the platform.

The current visual language is sufficiently distinctive. Experience 1.0 should first make the implementation **as trustworthy as it looks**:

1. protect consequential interactions,
2. expose content sooner,
3. restore semantic consistency,
4. foreground the work,
5. and make every route feel like one surface on the same permanent Registry.

