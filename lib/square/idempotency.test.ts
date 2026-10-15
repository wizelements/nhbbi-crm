import { describe, expect, it } from 'vitest'
import { deriveSquareIdempotencyKey } from './idempotency'

describe('Square checkout retry idempotency', () => {
  it('reuses the exact key for retries by the same actor', () => {
    const first = deriveSquareIdempotencyKey('payment', 'user-1', 'checkout-1')
    expect(deriveSquareIdempotencyKey('payment', 'user-1', 'checkout-1')).toBe(first)
    expect(first).toMatch(/^[0-9a-f]{64}$/)
  })

  it('separates user identities, checkout attempts and operations', () => {
    const original = deriveSquareIdempotencyKey('order', 'user-1', 'checkout-1')
    expect(deriveSquareIdempotencyKey('order', 'user-2', 'checkout-1')).not.toBe(original)
    expect(deriveSquareIdempotencyKey('order', 'user-1', 'checkout-2')).not.toBe(original)
    expect(deriveSquareIdempotencyKey('payment', 'user-1', 'checkout-1')).not.toBe(original)
  })

  it('rejects malformed identifiers instead of generating unstable keys', () => {
    expect(() => deriveSquareIdempotencyKey('order', '', 'reference')).toThrow()
    expect(() => deriveSquareIdempotencyKey('payment', 'user', '  ')).toThrow()
    expect(() => deriveSquareIdempotencyKey('payment', 'user', 'x'.repeat(129))).toThrow()
  })
})
