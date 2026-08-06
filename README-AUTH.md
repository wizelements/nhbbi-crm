# NHBBJ Authentication & RBAC Module

This module provides credential-based authentication and role-based access control (RBAC) for the NHBBJ CRM using NextAuth.js v5 (Auth.js), bcrypt password hashing, and JWT sessions.

## Roles

- `visitor` — unauthenticated or basic public user
- `member` — authenticated community member
- `admin` — full administrative access

Admins implicitly pass member checks.

## Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Password hashing, JWT helpers, role utilities |
| `auth.ts` | NextAuth.js v5 configuration, credentials provider, callbacks |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js API route handlers |
| `app/api/auth/register/route.ts` | Registration endpoint with admin setup secret |
| `middleware.ts` | Route protection for `/admin/*`, `/member/*`, and matching API routes |
| `components/auth/login-form.tsx` | Client sign-in form |
| `components/auth/register-form.tsx` | Client registration form |
| `components/auth/role-gate.tsx` | Client component role gate |
| `app/login/page.tsx` | Sign-in page |
| `app/register/page.tsx` | Registration page |

## Environment Variables

Required in `.env`:

```env
JWT_SECRET=your-jwt-secret-at-least-32-characters
ADMIN_SETUP_SECRET=your-admin-setup-secret
ADMIN_DEFAULT_EMAIL=admin@nhbbi.org
ADMIN_DEFAULT_PASSWORD=your-secure-admin-password
```

`ADMIN_SETUP_SECRET` is used to create the first admin account via registration.

## First Admin Bootstrap

On the first credentials login attempt, the system auto-creates an admin user using `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` if no users exist. Change this password immediately after first login.

## Registration

`POST /api/auth/register`

```json
{
  "email": "member@example.com",
  "password": "securepassword",
  "firstName": "Optional",
  "lastName": "Optional",
  "adminSecret": "optional-admin-setup-secret"
}
```

If `adminSecret` matches `ADMIN_SETUP_SECRET`, the new account is created with the `admin` role. Otherwise it defaults to `member`.

## Middleware

- `/admin/*` → requires `admin` role
- `/member/*` → requires `member` or `admin` role
- `/api/admin/*` and `/api/member/*` → same role checks

Unauthenticated users are redirected to `/login` with a `callbackUrl`.

## Client Session

Use `useSession` from `next-auth/react` or `auth()` from `auth.ts` in server components. The session user shape is:

```ts
{
  id: string
  email: string
  role: 'visitor' | 'member' | 'admin'
  firstName: string | null
  lastName: string | null
}
```

## Security Notes

- Passwords are hashed with bcrypt at 12 rounds.
- JWTs are signed with `HS256` and expire after 7 days.
- No secrets are committed to git.
- The default admin password must be changed after first login in production.
