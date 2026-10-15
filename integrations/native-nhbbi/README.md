# Native NHBBI staff administration adapter

**Release state: SOURCE-READY, NOT INSTALLED.** This module is deliberately standalone and does **not** connect the unrelated `nhbbi-crm` UUID/Auth.js database to the live NHBBI site.

## Verified basis
Live Vercel deployment source uses `getCurrentUser()`, numeric `AccountUser.id`, `role: member | admin`, a hashed `nhbbi_session` cookie, and the native `nhbbi_*` Turso tables. Historic GitHub `wizelements/nhbbi` is **archived** and its `main` branch is only a README. Historic `master` is an earlier version, not the current Vercel upload. Do not overwrite production with either historic branch.

## Live database safety correction
The current Vercel source `src/lib/db.ts` uses `process.env.TURSO_DATABASE_URL || 'file:nhbbi-local.db'`. That fallback creates a nonpersistent, unwritable database on serverless Vercel and caused recorded production health errors in earlier deployments. In the recovered source, replace this fallback with `liveDatabaseConfig(process.env)` from this adapter; configuration errors should yield a controlled 503 health response without logging credentials. Unit tests enforce that production cannot use local SQLite. This change is NOT live-installed.

## Integration order
1. Recover the EXACT active Vercel deployment's full source into a writable, protected Git repository; review file hashes and keep a rollback deployment ID.
2. Inspect the production users/session table schema read-only and run migration against a separate cloned Preview database. Do not guess an account table or use email as a foreign key.
3. Hook `resolveAccess(await getCurrentUser(), dbAdapter)` into native admin server routes. `getCurrentUser` must verify the server session and current role. Never accept `userId`/role from the browser as the actor.
4. Adapt the site's existing `query` and `execute` to `ReadClient` for reads, and provide a **real transactional** `NativeDatabase` adapter before enabling `management.ts`; transactions must roll back failed audit writes.
5. Validate target accounts via the live DB's numeric user primary key and current role. Create/assign/revoke/disable through owner-only endpoints with same-origin CSRF protection, rate limiting, and audit.
6. Verify every client view queries only their own native account records. Membership billing and Square payment state remain provider-controlled, not manually editable via roles.
7. Prove staging role creation, assignment, immediately denied access after revocation, concurrent grant idempotency, audit failure rollback, mobile usability, and rollback BEFORE promoting.

## UX scope
Owner sees overview, member approvals, directory moderation, events, jobs, leads, order reconciliation, security/audit, and People & Roles. Staff sees only granted tasks. Each client sees self-owned membership, business listing/status, event registration and support. Default denied.

## Known blockers
- Exact live Vercel source is an unlinked uploaded deployment. Some large file reads are truncated by the available source API; no safe complete recovery has been demonstrated.
- The archived site GitHub repo cannot be written through the currently available connector actions.
- Vercel environment metadata access is denied; no Preview database, account migration or authenticated full E2E can yet be performed.
