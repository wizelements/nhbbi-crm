import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { middlewareAuthorizationDecision } from '../lib/middleware-policy'

function installedVersion(packageName: string): string {
  const pkg = JSON.parse(
    readFileSync(`node_modules/${packageName}/package.json`, 'utf8'),
  ) as { version: string }
  return pkg.version
}

const user = (role: 'visitor' | 'member' | 'admin') => ({ role })

describe('installed Next.js patch', () => {
  it('installs 14.2.35, the lowest 14.2.x that includes the reachable fixes', () => {
    // CVE-2025-29927 middleware bypass is fixed in 14.2.25.
    // CVE-2025-55173 image-optimizer content injection is fixed in 14.2.31.
    // CVE-2025-55184 / CVE-2025-67779 App Router DoS is fully fixed in 14.2.35.
    expect(installedVersion('next')).toBe('14.2.35')
  })

  it('keeps eslint-config-next on the same Next.js release', () => {
    expect(installedVersion('eslint-config-next')).toBe('14.2.35')
  })

  it('uses the SWC wasm build that Next.js 14.2.35 loads', () => {
    // 14.2.35 publishes no @next/swc-wasm-nodejs of its own. Its loader
    // requests 14.2.33, which is the last published 14.2 wasm binary.
    expect(installedVersion('@next/swc-wasm-nodejs')).toBe('14.2.33')
  })
})

describe('middleware authorization', () => {
  it('sends anonymous and non-admin visitors away from admin pages', () => {
    expect(middlewareAuthorizationDecision('/admin/leads', null)).toEqual({
      type: 'redirect',
      callbackUrl: '/admin/leads',
    })
    expect(middlewareAuthorizationDecision('/admin/orders', user('member'))).toEqual({
      type: 'redirect',
      callbackUrl: '/admin/orders',
    })
  })

  it('allows an admin through admin and member pages', () => {
    expect(middlewareAuthorizationDecision('/admin/members', user('admin'))).toEqual({
      type: 'next',
    })
    expect(middlewareAuthorizationDecision('/member/profile', user('admin'))).toEqual({
      type: 'next',
    })
  })

  it('requires a member session for member pages and lets members through', () => {
    expect(middlewareAuthorizationDecision('/member/directory', null)).toEqual({
      type: 'redirect',
      callbackUrl: '/member/directory',
    })
    expect(middlewareAuthorizationDecision('/member/jobs', user('member'))).toEqual({
      type: 'next',
    })
  })

  it('does not treat CRM API routes as middleware-authorized pages', () => {
    expect(middlewareAuthorizationDecision('/api/admin/leads', null)).toEqual({ type: 'next' })
    expect(middlewareAuthorizationDecision('/api/members/profile', null)).toEqual({ type: 'next' })
  })
})
