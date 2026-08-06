# NHBBJ AI-Admin CRM — OPEE Implementation Specification

## OBJECTIVE
Build a fully working NHBBJ (Bronner Business Institute) admin AI OpenClaw CRM site with Square REST API integration, membership tiers, business directory, events, job board, and beyond-human implementation practices.

## PREFLIGHT
- Reference architecture extracted from Gratog (Square payments, server-authoritative pricing, Resend/Telegram alerts).
- Reference database pattern from ASCA PWA (Turso/libSQL, edge-serverless).
- Reference admin dashboard pattern from c3bai.
- Existing nhbbi.org assets inventoried at `~/.openclaw/workspace/audit/nhbbi/2026-08-05/`.
- Workspace initialized at `/data/data/com.termux/files/home/.openclaw/workspace/nhbbi-crm`.

## PLAN

### Phase 1 — Foundation
1. Initialize Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui.
2. Configure `next.config.js`, `.env.example`, `tsconfig.json`, ESLint/Prettier.
3. Set up Turso/libSQL client and Drizzle ORM schema.
4. Configure NextAuth.js v5 with credentials provider and RBAC.
5. Add middleware for route protection.

### Phase 2 — Data Model
Tables:
- `users` (id, email, password_hash, role, profile, created_at, updated_at)
- `memberships` (id, user_id, tier, status, square_subscription_id, expires_at)
- `member_profiles` (id, user_id, company_name, website, phone, bio, logo_url, category, approved)
- `directory_listings` (id, owner_user_id, company_name, slug, description, category, contact, logo_url, approved, featured)
- `events` (id, title, slug, description, start_at, end_at, location, price_cents, square_item_id, published, capacity)
- `event_registrations` (id, event_id, user_id, status, payment_status, square_order_id, created_at)
- `jobs` (id, company_id, title, description, location, contact_email, published, created_at)
- `orders` (id, user_id, type, square_order_id, total_cents, status, metadata, created_at)
- `leads` (id, name, email, phone, interest, message, source, assigned_to, status, created_at)
- `contacts` (id, name, email, subject, message, status, created_at)
- `activity_logs` (id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at)
- `ai_agent_sessions` (id, agent_id, session_key, intent, actions, result, created_at)

### Phase 3 — Square REST API Integration
- `lib/square/client.ts` — Square SDK client with environment switching.
- `lib/square/catalog.ts` — sync catalog items (membership tiers, events, donations).
- `lib/square/orders.ts` — create orders server-authoritatively.
- `lib/square/payments.ts` — payment token → Square payment.
- `lib/square/webhooks.ts` — verify Square webhook signatures.
- `lib/square/subscriptions.ts` — recurring membership billing.
- API routes:
  - `POST /api/square/create-order`
  - `POST /api/square/process-payment`
  - `POST /api/square/webhook`
  - `GET /api/square/catalog`

### Phase 4 — Public Site
Pages:
- `/` — hero, mission, services, upcoming events, latest media.
- `/about` — history, mission, leadership.
- `/services/training` — NxLevel training details + registration CTA.
- `/services/consulting` — consulting details.
- `/services/networking` — Kingdom Connections events.
- `/membership` — tier comparison + checkout.
- `/directory` — searchable/filterable member business directory.
- `/events` — event listing + registration.
- `/jobs` — job board.
- `/contact` — contact form.
- `/donate` — donation form.

### Phase 5 — Member Portal
- `/member/dashboard` — profile, membership status, events registered, job postings.
- `/member/profile/edit` — update company info, logo.
- `/member/directory/manage` — manage directory listing.
- `/member/jobs/manage` — post/manage jobs.
- `/member/events` — registered events.

### Phase 6 — Admin AI CRM
- `/admin/dashboard` — KPIs, recent activity, revenue, leads, pending approvals.
- `/admin/members` — member management, approve, upgrade tiers.
- `/admin/directory` — directory approval/featured management.
- `/admin/events` — event CRUD + registrations.
- `/admin/jobs` — job moderation.
- `/admin/leads` — lead pipeline.
- `/admin/orders` — order/payment history.
- `/admin/ai-agent` — OpenClaw agent console:
  - Natural language queries against CRM data.
  - Action hooks: approve member, send alert, summarize leads, create event.
  - Audit trail of all AI actions.

### Phase 7 — Notifications
- Resend email templates:
  - welcome, membership confirmation, event registration, receipt, lead alert, contact form.
- Telegram owner alerts:
  - new member, new order, new lead, new contact, AI agent action.
- Cron jobs:
  - daily report, event reminders, membership renewal reminders.

### Phase 8 — Testing + Deployment
- Vitest unit tests.
- Playwright E2E tests for critical flows.
- Vercel deployment.
- Environment-specific `.env` files.
- Security hardening: CSP, rate limiting, input validation, webhook signature verification.

## EXECUTE
Implementation begins with Phase 1 scaffolding and parallel module development.

## EVALUATE
- Build must pass `npm run build`.
- TypeScript strict mode enabled.
- Square sandbox end-to-end order/payment verified.
- Auth flows tested (login, register, role-based access).
- Admin AI agent actions logged and verified.

## CHALLENGE
- Avoid over-engineering; keep admin AI actions deterministic and auditable.
- Ensure Square pricing is server-authoritative (never trust client totals).
- Design for mobile-first, since user runs on Android/Termux.

## EVOLVE
- Post-MVP: AI-generated email campaigns, automated lead scoring, SMS fallback (not primary), mobile app wrapper.

## CHECKPOINT
- Workspace: `/data/data/com.termux/files/home/.openclaw/workspace/nhbbi-crm`
- Goal ID: `a656193b-edb5-4c67-a358-0b5160f9abaf`
- ACTIVE_CONTEXT.md updated.
