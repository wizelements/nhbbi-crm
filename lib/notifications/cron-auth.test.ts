import { describe, expect, it } from 'vitest'
import { verifyCronAuthorization } from './cron-auth'
describe('cron bearer authentication',()=>{
  const secret='a'.repeat(40)
  it('allows an exact authorized request',()=>expect(verifyCronAuthorization('Bearer '+secret,secret)).toBe(true))
  it('refuses query-only and missing headers',()=>{
    expect(verifyCronAuthorization(null,secret)).toBe(false)
    expect(verifyCronAuthorization('Bearer '+secret+'x',secret)).toBe(false)
  })
  it('refuses weak keys and malformed bearer values',()=>{
    expect(verifyCronAuthorization('Bearer weak','weak')).toBe(false)
    expect(verifyCronAuthorization('Basic '+secret,secret)).toBe(false)
    expect(verifyCronAuthorization('Bearer '+secret+' extra',secret)).toBe(false)
  })
})
