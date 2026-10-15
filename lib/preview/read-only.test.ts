import { afterEach, describe, expect, it } from 'vitest'
import { canAccessPreviewPath, isReadOnlyPreview } from './read-only'
const origEnv = process.env.VERCEL_ENV
const origReadOnly = process.env.NHBBI_PREVIEW_READ_ONLY
afterEach(() => {
  if (origEnv === undefined) delete process.env.VERCEL_ENV
  else process.env.VERCEL_ENV = origEnv
  if (origReadOnly === undefined) delete process.env.NHBBI_PREVIEW_READ_ONLY
  else process.env.NHBBI_PREVIEW_READ_ONLY = origReadOnly
})
describe('NHBBI read-only preview isolation', () => {
  it('requires both an actual Vercel Preview and explicit read-only config', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.NHBBI_PREVIEW_READ_ONLY = 'true'
    expect(isReadOnlyPreview()).toBe(false)
    process.env.VERCEL_ENV = 'preview'
    expect(isReadOnlyPreview()).toBe(true)
  })
  it('rejects login, member and admin pages, all API access and writes', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.NHBBI_PREVIEW_READ_ONLY = 'true'
    for (const p of ['/admin','/admin/dashboard','/member/register','/login','/register','/api/square/process-payment','/api/auth/session','/donate']) {
      expect(canAccessPreviewPath(p,'GET')).toBe(false)
    }
    expect(canAccessPreviewPath('/events', 'POST')).toBe(false)
    expect(canAccessPreviewPath('/', 'GET')).toBe(true)
    expect(canAccessPreviewPath('/events', 'HEAD')).toBe(true)
  })
})
