import { describe, expect, it } from 'vitest'
import { arePreviewSquareTransactionsDisabled } from './preview-gate'

describe('Square preview fail-closed policy', () => {
  it('disables all preview payment calls by default', () => {
    expect(arePreviewSquareTransactionsDisabled('preview')).toBe(true)
    expect(arePreviewSquareTransactionsDisabled('preview', '')).toBe(true)
    expect(arePreviewSquareTransactionsDisabled('preview', 'false')).toBe(true)
    expect(arePreviewSquareTransactionsDisabled('preview', 'TRUE')).toBe(true)
  })

  it('requires deliberate exact opt-in before connecting preview sandbox', () => {
    expect(arePreviewSquareTransactionsDisabled('preview', 'true')).toBe(false)
  })

  it('does not change existing production or local behavior', () => {
    expect(arePreviewSquareTransactionsDisabled('production')).toBe(false)
    expect(arePreviewSquareTransactionsDisabled('development')).toBe(false)
    expect(arePreviewSquareTransactionsDisabled(undefined)).toBe(false)
  })
})
