# NHBBI staff access — release checklist

The `nhbbi-crm` app currently lives in a separate GitHub/Vercel project from the live NHBBI site. Do not promote this role-manager branch to the main NHBBI domain or claim shared accounts until the source-of-truth databases and authentication boundaries are reconciled.

## Access model

- Built-in administrators retain owner-level authority.
- Administrators can create roles and assign them to member accounts in `/admin/roles`.
- Roles use a closed permission catalog; `roles.manage` and AI operations cannot be delegated.
- Route and API authorization re-reads current account status and current role assignment from the database; it does not trust the client-stored role.
- Deactivating a role or revoking an assignment takes effect on the next request.
- Log every role, assignment, and moderation mutation in `activity_logs`.
- Staff never receive password hashes. Members should see only their own data.

## Required before preview is functional

1. Configure environment-specific secrets in the *nhbbi-crm* Vercel project. Preview must use independent sandbox database and Square credentials. Do not copy production secrets into a publicly accessible preview.
2. Back up the CRM database and apply `drizzle/0001_staff_roles.sql` transactionally. Confirm both tables and indexes exist.
3. Verify role owner login, create/edit/disable/delete role, assign/revoke, and that user B cannot access anything except B's explicitly authorized modules. Verify anonymous requests fail.
4. Run CI, Playwright E2E on desktop and Android widths, and security tests for revoked access, cross-account writes, race-condition duplicate assignments, CSRF/origin controls, and audit trails. CI typechecking and permission-catalog unit tests alone are not end-to-end certification.
5. Connect the production NHBBI site account model to the approved admin backend only after checkout, memberships, event registration, and directory data-source reconciliation. No isolated CRM data should be presented as production NHBBI truth.

## Verified production identity and data mismatch (Oct 11, 2026)

Live NHBBI source recovered read-only from Vercel's source upload uses:

- `src/lib/auth.ts`: signed-in accounts have numeric `AccountUser.id`, role `member | admin`, and a hashed `nhbbi_session` cookie backed by `nhbbi_sessions`.
- `src/lib/db.ts`: a libSQL/Turso connection and namespaced `nhbbi_*` tables including `nhbbi_businesses`, `nhbbi_jobs`, etc.
- `src/app/account/page.tsx`: member self-service at `/account`.

This CRM instead uses Auth.js credentials/JWT, UUID `users.id`, and unprefixed Drizzle tables. **Do not deploy the CRM admin panel at the live domain and assume the users, member records, payments, or directory listings are shared.** A deliberate source-control migration/native permission adapter and verified account mapping are required. Email address alone is not a safe foreign key.

### Client and administrator release design

- Admin home: an actionable queue for membership review, directory submissions, event tasks, leads needing follow-up, orders requiring reconciliation, and audit/security alerts.
- Client home: membership and payment state, profile completion, directory listing status, registered events, business opportunities, and support. Own data only.
- Role builder: least-privilege checkboxes, preview effective permissions, named roles, clearly labeled owner-only privileges, confirmation for changes affecting multiple assignees, and immediate revocation.
- Every data mutation: validation, authorization, auditable actor, explicit result, informative failure, no blind success states.
- No cross-database writes or background sync until idempotency, rollback, account mapping, and Square reconciliation are tested.

## Known blockers

- Vercel Preview build fails during page-data collection with missing required configuration (APP_URL, BASE_URL, Turso, Square, JWT and auth secrets). Do not use dummy values to make a green build.
- Live NHBBI site is a separate non-Git Vercel source upload; admin deployment here does not automatically modify or merge into that site.
- Existing Next.js 14.2.5 is flagged deprecated/vulnerable by Vercel build logs. Plan dependency security upgrade and full regression before production promotion.
- The administrative assistant has been converted to deterministic, owner-only, read-only reporting. Separate confirmation workflows are still required before AI-assisted writes may be reintroduced.
