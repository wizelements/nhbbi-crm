import { describe, expect, it } from 'vitest'
import { isSameOriginMutation } from './request-integrity'
describe('admin CSRF origin boundary', () => {
  it('permits same-origin privileged changes',()=>expect(isSameOriginMutation('PATCH','https://portal.example','https://portal.example')).toBe(true))
  it('denies missing, cross-origin and spoofed-subdomain origins',()=>{
    expect(isSameOriginMutation('POST',null,'https://portal.example')).toBe(false)
    expect(isSameOriginMutation('DELETE','https://evil.example','https://portal.example')).toBe(false)
    expect(isSameOriginMutation('PATCH','https://portal.example.evil','https://portal.example')).toBe(false)
  })
  it('permits read-only requests',()=>expect(isSameOriginMutation('GET',null,'https://portal.example')).toBe(true))
})
