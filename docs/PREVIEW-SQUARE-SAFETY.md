# NHBBI preview-payment policy

All Square API endpoints and webhooks are disabled by default in Vercel Preview, independent of whether Square credentials are configured. The Square SDK constructor separately enforces the gate.

To run **live sandbox-only** integration tests later, the operator must first verify real Square *sandbox* access and location IDs in an isolated Vercel Preview environment, then explicitly set `NHBBI_PREVIEW_PAYMENTS_ENABLED=true` for the branch. Never enable with production Square credentials.

The gate is controlled by Vercel's `VERCEL_ENV`, not `NODE_ENV`; Vercel sets `NODE_ENV=production` in both Production and Preview builds. A preview that lacks valid Square credentials must not accept or replay payments, create orders, change catalogs, or process webhooks.

This guard **does not certify** the existing application against payment retries, duplicate orders, member account migration, or production deployment. Independent E2E certification and verified secrets are required.
