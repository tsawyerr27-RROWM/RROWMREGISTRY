# RROWM Registry

**A verification layer for the global art market.**

RROWM is a system for recording authorship, provenance, and verification of artworks — designed to establish a persistent, trusted record across artists, galleries, and collectors.

---

## Why this exists

The art market operates on fragmented records, informal trust, and inconsistent documentation.  
Provenance is often reconstructed rather than recorded.

RROWM introduces a structured registry layer where:

- artworks are registered at source  
- ownership is tracked as an event chain  
- verification is explicit and attributable  
- records remain consistent over time  

This is not a marketplace.  
It is infrastructure.

---

## What the product does

RROWM provides a unified system for:

### 1. Artwork Registration
- Creation of a canonical registry record  
- Immutable registry IDs  
- Metadata hashing for integrity  

### 2. Ownership Tracking
- Event-based ownership chain (`ownership_events`)  
- Current ownership derived, not manually set  
- Controlled transfer flows  

### 3. Verification Layer
- Gallery and institutional verification  
- Certificate issuance with verifiable snapshots  
- Public vs private visibility controls  

### 4. Public Registry
- Searchable index of verified works  
- Transparent but permissioned data exposure  
- Separation between record, certificate, and presentation  

---

## System design principles

- **Event-first architecture**  
  State is derived from events, not overwritten fields  

- **Deterministic integrity**  
  Ownership, value, and verification must reconcile from history  

- **Separation of concerns**  
  Registry ≠ presentation ≠ certificate  

- **Controlled visibility**  
  Public transparency with private depth  

---

## Business model

Initial revenue layers:

- Gallery subscriptions (starting at £30/month)  
- Analytics and operational tooling upgrades  
- Transaction infrastructure (percentage-based fees)  
- Controlled transfer rails (non-financialised tokenisation layer)  

---

## Market opportunity

The global art market exceeds **$60B+ annually**, yet lacks a unified verification layer.

RROWM positions itself as:

- the **system of record** for artworks  
- the **verification backbone** for institutions  
- the **provenance infrastructure** for future digital and physical integrations  

Network effects emerge as:

- more galleries → more verified works  
- more works → more collectors rely on registry  
- more usage → higher trust and standardisation  

---

## Tech stack

- Next.js (App Router)
- Supabase (Postgres, Auth, RLS)
- TypeScript
- Vercel (deployment)

---

## Development

```bash
npm install
npm run dev 