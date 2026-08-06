# NHBBJ Public Website Frontend Module

This module contains the public-facing website for the NHBBJ (Bronner Business Institute) AI-Admin CRM project.

## Scope

- **UI only** — no auth logic, no payment processing, no real data mutations.
- **Data fetching stubs** live in `lib/public/data.ts` and return static/demo data. Replace with real Turso/Drizzle queries or API calls when backend modules are integrated.
- **Brand colors** are NHBBJ blue (`#15224a` / `navy`) and gold (`#d39d39` / `gold`) on white.
- **Mobile-first** responsive layouts using Tailwind CSS.
- **Radix-based shadcn-style primitives** under `components/ui/`.

## Brand Colors

Updated in `app/globals.css` and `tailwind.config.ts`:

- `navy` / `primary` in light mode: `#15224a`
- `gold` / `secondary` / `accent`: `#d39d39`
- Dark mode flips primary/secondary for readability.

## Layout Components

| File | Purpose |
|------|---------|
| `components/layout/header.tsx` | Top bar, desktop nav with Services dropdown, mobile hamburger menu, search, Donate CTA. |
| `components/layout/footer.tsx` | Four-column footer (Join, Connect, Donate, Contact), tagline band, copyright. |
| `components/layout/public-shell.tsx` | Wraps pages with Header + main + Footer. |
| `components/public/page-banner.tsx` | Reusable navy/gold page hero banner. |

## Public Home Sections

| File | Purpose |
|------|---------|
| `components/public/hero.tsx` | Headline, CTA buttons, NxLevel promo video. |
| `components/public/mission.tsx` | Welcome copy + gold fact card (founded, services, mission, membership). |
| `components/public/services.tsx` | Three service cards: Training, Consulting, Networking. |
| `components/public/events-preview.tsx` | Featured events grid with date, location, price, register CTA. |
| `components/public/media-preview.tsx` | Latest videos grid. |
| `components/public/connector.tsx` | Job board teaser / BBI Connector CTA. |

## Shared UI Primitives

Located in `components/ui/`:

- `button.tsx` — includes `gold` and `navy` variants.
- `card.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`
- `badge.tsx` — includes `gold` and `navy` variants.
- `select.tsx`, `dialog.tsx`, `accordion.tsx`

## Public Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Hero, Mission, Services, Events, Media, Connector. |
| `/about` | `app/about/page.tsx` | History, mission, values, creed, leadership. |
| `/services` | `app/services/page.tsx` | Service overview cards. |
| `/services/training` | `app/services/training/page.tsx` | NxLevel training detail. |
| `/services/consulting` | `app/services/consulting/page.tsx` | Consulting detail. |
| `/services/networking` | `app/services/networking/page.tsx` | Networking / Kingdom Connections detail. |
| `/membership` | `app/membership/page.tsx` | Tier comparison (Associate, Bronze, Silver, Gold). |
| `/directory` | `app/directory/page.tsx` | Searchable/filterable business directory. |
| `/events` | `app/events/page.tsx` | Event listing with register CTAs. |
| `/jobs` | `app/jobs/page.tsx` | Job board from BBI Champion businesses. |
| `/contact` | `app/contact/page.tsx` | Contact form stub + contact info. |
| `/donate` | `app/donate/page.tsx` | Donation amount selector stub. |
| `/login` | `app/login/page.tsx` | Login form UI only. |
| `/member/register` | `app/member/register/page.tsx` | Registration form UI only. |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy placeholder. |
| `/terms` | `app/terms/page.tsx` | Terms placeholder. |

## Data Stubs

`lib/public/data.ts` exports:

- `getFeaturedEvents()`, `getAllEvents()`
- `getDirectoryListings()`, `getDirectoryCategories()`
- `getJobs()`
- `getMediaItems()`
- Static content: `MISSION_STATEMENT`, `ABOUT_BLURB`, `ABOUT_HISTORY`, `CREED`, `VALUES`, `LEADERSHIP`, membership tiers, service details.

## Utilities

`lib/utils.ts` exports:

- `cn(...)` — Tailwind class merging.
- `formatCurrency(cents)` — USD formatting.
- `formatDate(date)`, `formatDateTime(date)` — locale formatting.

## What Is NOT Included

- Authentication logic, session handling, middleware.
- Square payment processing, webhooks, or server-authoritative pricing.
- Real database queries or mutations.
- Admin dashboard, member portal, AI agent console.
- Tests, E2E flows, or deployment configuration.

These are handled by separate backend/admin modules per `OPEE-SPEC.md`.

## Next Steps for Integration

1. Replace stub functions in `lib/public/data.ts` with real Drizzle/Turso queries.
2. Wire `/login` and `/member/register` to NextAuth.js v5 credentials flow.
3. Wire `/donate` and membership CTAs to Square order/payment APIs.
4. Add `/events/[slug]` detail and registration pages.
5. Add `/directory/[slug]` business profile pages.
6. Run `npm install` and `npm run build` to verify TypeScript and rendering.
