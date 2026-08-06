# NHBBJ CRM — Square REST API Payments Module

This module provides a server-authoritative Square integration for the NHBBJ CRM. All prices and totals are calculated on the server. The client only collects payment tokens via Square Web Payments SDK and passes them to these endpoints.

## Environment Variables

```bash
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_APPLICATION_ID=your_application_id
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox          # or production
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key
SQUARE_WEBHOOK_URL=https://your-domain.com/api/webhooks/square
```

**Defaults to sandbox.** Never run `production` until you have rotated to production credentials and verified webhooks.

## Module Layout

```
lib/square/
  client.ts      # SDK client with environment switching + helpers
  catalog.ts     # Sync membership tiers and events as Square catalog items
  orders.ts      # Server-side order creation with Zod validation
  payments.ts    # Payment token processing with server-calculated totals
  webhooks.ts    # HMAC-SHA256 webhook signature verification + helpers

app/api/square/
  create-order/route.ts      # POST create Square order
  process-payment/route.ts   # POST process payment token
  catalog/route.ts           # GET list catalog, POST sync membership/event

app/api/webhooks/square/route.ts  # Square webhook receiver
```

## API Endpoints

### `POST /api/square/create-order`

Create a Square order from server-calculated line items. Requires authenticated user.

```json
{
  "referenceId": "order_123",
  "lineItems": [
    {
      "name": "Gold Membership",
      "quantity": "1",
      "basePriceCents": 25000,
      "catalogObjectId": "CATALOG_ITEM_ID",
      "variationId": "CATALOG_VARIATION_ID"
    }
  ],
  "buyerEmail": "member@example.com",
  "metadata": { "type": "membership", "tier": "gold" }
}
```

### `POST /api/square/process-payment`

Process a payment token from Square Web Payments SDK. Creates an order, verifies the server total matches Square's returned total, then charges the token.

```json
{
  "sourceId": "cnon:card-nonce-ok",
  "verificationToken": "optional-3ds-token",
  "referenceId": "order_123",
  "lineItems": [
    {
      "name": "Gold Membership",
      "quantity": "1",
      "basePriceCents": 25000,
      "catalogObjectId": "CATALOG_ITEM_ID",
      "variationId": "CATALOG_VARIATION_ID"
    }
  ],
  "buyerEmail": "member@example.com"
}
```

Response:

```json
{
  "success": true,
  "squarePaymentId": "...",
  "squareOrderId": "...",
  "status": "COMPLETED",
  "totalCents": 25000,
  "receiptUrl": "..."
}
```

### `GET /api/square/catalog?types=ITEM,CATEGORY`

List Square catalog objects. Authenticated users.

### `POST /api/square/catalog`

Sync a membership tier or event to Square catalog. Admin only.

**Membership:**

```json
{
  "type": "membership",
  "tier": "gold",
  "name": "Gold Membership",
  "description": "Annual gold membership",
  "priceCents": 25000,
  "durationMonths": 12
}
```

**Event:**

```json
{
  "type": "event",
  "eventId": "local-event-id",
  "title": "Annual Gala",
  "description": "Our biggest event of the year",
  "priceCents": 5000
}
```

### `POST /api/webhooks/square`

Square webhook receiver. Verifies `x-square-hmacsha256-signature` and updates local `orders`, `memberships`, and `eventRegistrations` records.

Supported events:

- `payment.created`
- `payment.updated`
- `payment.completed`
- `order.created`
- `order.updated`

### `GET /api/webhooks/square`

Health/status endpoint.

## Security Rules

1. **Never trust client totals.** `process-payment` recalculates the total server-side and rejects mismatches.
2. **Webhook signatures are verified in production.** Set `SQUARE_SKIP_WEBHOOK_VERIFICATION=true` only in local development.
3. **Tokens are single-use.** The `sourceId` from Square Web Payments SDK is passed once and consumed by Square.
4. **Admin-only catalog writes.** Only admins can create or update Square catalog items.
5. **Environment default is sandbox.** Production must be explicit.

## Local Development

1. Copy `.env.example` to `.env.local` and fill Square sandbox credentials.
2. Use the Square Sandbox Dashboard to generate test cards and webhooks.
3. For local webhook testing, use `ngrok` or similar and set `SQUARE_WEBHOOK_URL`.
4. Optionally set `SQUARE_SKIP_WEBHOOK_VERIFICATION=true` for manual webhook payload testing.

## Testing

Use the Square Sandbox test values:

- Successful payment nonce: `cnon:card-nonce-ok`
- Failed CVV nonce: `cnon:card-nonce-rejected-cvv`
- Failed postal code nonce: `cnon:card-nonce-rejected-postalcode`

See [Square Sandbox Testing](https://developer.squareup.com/docs/devtools/sandbox/payments) for the full list.

## Production Checklist

- [ ] Rotate to production Square credentials.
- [ ] Set `SQUARE_ENVIRONMENT=production`.
- [ ] Configure webhook URL in Square Developer Dashboard.
- [ ] Verify webhook signature key matches `SQUARE_WEBHOOK_SIGNATURE_KEY`.
- [ ] Remove `SQUARE_SKIP_WEBHOOK_VERIFICATION`.
- [ ] Enable 3-D Secure verification token handling if required.
- [ ] Test a real $1 charge and refund before public launch.
