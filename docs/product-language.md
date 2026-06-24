# RROWM product language

Canonical vocabulary for beta copy. Prefer these terms in UI, docs, and support.

| Concept | Canonical | Avoid |
| --- | --- | --- |
| Auth workspace | **Studio** | Overview, Workspace |
| Public discovery | **Field** | Marketplace |
| Trust record | **Registry** | Record (unless naming a specific page) |
| Chronology | **Provenance** | History |
| Economic negotiation | **Deal** | Offer, Interest, Proposal (as noun for the deal itself) |
| Current holder | **Steward** | Custodian, Holder (in product UI) |
| Deal completion | **Execution** | Complete, Finalize, Mark complete |
| Deal status (closed) | **Executed** | Complete, Closed (in user-facing status) |
| Deal status (rejected) | **Declined** | Rejected, Declined proposal |
| Rights container | **Rights ledger** | License registry (container name) |
| Rights grant | **License** | Rights (when referring to a single grant) |

## Surfaces

- **Field** — public discovery: profiles, records, verify, opportunities.
- **Registry ledger** — authoritative chronology for a work (`/registry/{id}/ledger`).
- **Studio** — authenticated workspace for creatives, organisations, and collectors.
- **Deals** — private negotiation and execution between participants.

## CTA defaults

| Context | Label |
| --- | --- |
| Creative profile | Propose deal |
| Organisation profile | Propose representation |
| Registry / Field record | Start acquisition deal |
| Accepted deal (close) | Record execution |
| Deal execution panel | Record execution / Activate license (by type) |

## Beta story (four pillars)

1. Register works
2. Verify authorship
3. Preserve provenance
4. Enable trusted cultural transactions

## Known drift (post PR-BETA.3)

- `nav.stewardship` locale key still used in header; label reads **Studio**.
- Collector URLs may use `/collector-studio/` in studio activity feeds while Field uses `/field/collector/`.
- Deals UI is partially English-hardcoded; registry/field surfaces are i18n-complete.
- French nav may translate **Deals** as **Accords**.
