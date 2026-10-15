import { createHash } from 'node:crypto'

/**
 * Stable, actor-scoped Square idempotency key. Never generate a fresh UUID
 * for a retry of the same logical order/payment reference.
 *
 * Changing the body with the same reference produces a Square conflict
 * instead of silently creating a second order or charging a second card.
 */
export function deriveSquareIdempotencyKey(
  operation: 'order' | 'payment',
  actorId: string,
  referenceId: string
): string {
  const actor = actorId.trim()
  const reference = referenceId.trim()
  if (!actor || !reference || reference.length > 128) {
    throw new Error('Idempotency requires an authenticated actor and a valid reference ID')
  }

  return createHash('sha256')
    .update(JSON.stringify(['nhbbi-square-v1', operation, actor, reference]))
    .digest('hex')
}
