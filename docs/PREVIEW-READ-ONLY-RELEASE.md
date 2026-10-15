# NHBBI isolated preview

Set `NHBBI_PREVIEW_READ_ONLY=true` for the exact Vercel Preview branch. When `VERCEL_ENV=preview`, the app skips validation of uninstalled credentials solely to build public preview content. Protected paths, all /api routes, any mutations, payments, membership and login are blocked by middleware. Database imports receive a throwing stub rather than a live client.

Do not use this as evidence of a functional administration deployment. It is a visual **public read-only preview** while isolated Turso / Square credentials and member-data migrations are being certified.

When valid secrets are configured through an authorized secrets-management channel, unset `NHBBI_PREVIEW_READ_ONLY`, redeploy and test real admin/member flows. Never turn on production promotion until full checkout, authorization and migration certification.
