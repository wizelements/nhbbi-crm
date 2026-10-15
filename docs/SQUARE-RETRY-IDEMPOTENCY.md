# Stable Square retry keys

A checkout request uses a stable SHA-256 key derived from authenticated actor ID, logical reference ID, and operation. Order creation and payment creation have separate keys, but identical retry requests reuse the same keys across application instances and restarts. A different actor cannot reuse the same key by guessing a reference ID.

The payment request now explicitly supplies Square's `idempotencyKey`, and order creation no longer uses a random UUID key.

**Important:** This is one necessary mitigation, not full checkout certification. The client must preserve its logical checkout reference across double-clicks/retries, and the server must enforce unique persisted checkout attempts and derive authoritative catalog prices rather than trusting browser-provided `basePriceCents`. Until those are certified, do not enable preview Square payments or promote this CRM candidate into production.
