# NHBBI production gate: release candidate

**State:** blocked, not promoted. Owner: NHBBI administration. Security baseline: commit `98f1452a642cab4d13c84a2523098b9160216b5c` or later.

## Proven

- CI on `release/nhbbi-admin-candidate-20261012` passes clean install, zero high/critical runtime dependency advisory threshold, TypeScript, authorization unit tests, native numeric-account RBAC, both SQLite migration invariants, optimized Next.js 16 Webpack build, and ESLint.
- Existing CRM roles and client dashboard are implemented but **not** the live native NHBBI admin panel.
- Live NHBBI Vercel source and CRM are separate. No live data migration, production checkout, or member impersonation has occurred.

## Authoritative live-site facts

- Production project: `nhbbi`, team `theangelsilvers-projects`, latest known READY Vercel production deployment `dpl_98nLbATWsx3yejaQR4c9dStkx6sD`.
- CRM project: `nhbbi-crm`; automatic branch previews fail when required environment configuration is missing.
- Current live auth uses hashed `nhbbi_session` cookie and numeric NHBBI account IDs; CRM uses separate UUID + Auth.js models. Email must never be used as the identity merge key.
- Archived `wizelements/nhbbi` Git repository is not exact live source: `main` only has a README; `master` contains an earlier app. The VPS has an older source Git bundle and workspace, not a verified exact deployment.
- Vercel project-env listing is **HTTP 403** for both connected projects in this tool session. Deployment source API returns truncated file bodies.
- Earlier runtime errors reported attempted access to `file:nhbbi-local.db` within Vercel. The native adapter rejects local production DB fallbacks, but that fix is not live-installed.

## Release sequence — no bypass

1. **Source truth:** recover *exact* ready Vercel source upload into a **private writable** repository, verify file-tree/hash parity, tag immutable release, capture existing deployment ID and public route baseline. Do not use the archived earlier source as production truth.
2. **Credential scope:** grant an authorized Vercel project maintainer/service account the narrowly scoped rights to read and edit the `nhbbi` and `nhbbi-crm` Preview environment settings. Put independent nonproduction Turso and Square sandbox credentials into **Preview** only. Never commit credentials or copy production values into public workflows.
3. **Data protection:** take and verify a restorable snapshot of native `nhbbi_*` Turso data; inspect numeric users, session and payment schema; prove how to roll back an additive migration. Never overwrite users/orders or generate replacement IDs.
4. **Native admin integration:** install `integrations/native-nhbbi` against the deployed source's current `getCurrentUser()`, with an actual transactional Turso adapter, enforcing server-side RBAC for every read/mutation. Apply additive migration in Preview, not Production.
5. **Independent E2E:** exercise owner, delegated staff, regular client and anonymous sessions; verify denied cross-account reads/writes, immediate revoke, duplicate assignment, anti-CSRF protection, client profile/listing/event workflows, Square sandbox payment completion/refund, verified webhook replay handling, idempotency and audit log.
6. **Security review:** run dependency *full* audit and assess remaining build-tool findings separately; test Square API request validation and signing; verify no sensitive fields leak in API/page responses.
7. **Promotion:** deploy immutable release to preview, capture tests + accessible mobile review. After explicit authorized release approval, promote with independent health/checkout monitoring and documented one-click rollback. Production identity and Square settlement are authoritative.

## What CI does not prove

Synthetic CI URLs/tokens are deliberately fake and no live database/Square sandbox is contacted. A green CI build **does not mean NHBBI clients can sign in or pay**. The release must remain draft until every applicable gate above is supported by evidence.

## Evidence

- Consolidated implementation: https://github.com/wizelements/nhbbi-crm/pull/8
- Native adapter: https://github.com/wizelements/nhbbi-crm/pull/3
- Framework security: https://github.com/wizelements/nhbbi-crm/pull/6
- Runtime advisory pass: https://github.com/wizelements/nhbbi-crm/actions/runs/38335504744
- Production-style isolated CI: https://github.com/wizelements/nhbbi-crm/actions/runs/38335963535
