import { describe, expect, it } from 'vitest'
import { PERMISSION_KEYS, DELEGABLE_PERMISSIONS, parsePermissions, validDelegation } from './permission-catalog'
describe('staff authorization invariants',()=>{
  it('does not delegate owner-only or AI powers',()=>{
    expect(DELEGABLE_PERMISSIONS).not.toContain('roles.manage')
    expect(DELEGABLE_PERMISSIONS).not.toContain('ai.view')
    expect(PERMISSION_KEYS).toContain('roles.manage')
    expect(validDelegation(['roles.manage'])).toBe(false)
    expect(validDelegation(['ai.view'])).toBe(false)
  })
  it('fails closed for unknown and corrupted stored grants',()=>{
    expect(parsePermissions('malformed')).toEqual([])
    expect(parsePermissions('["roles.manage","members.view","evil"]')).toEqual(['members.view'])
    expect(validDelegation(['members.view','evil'])).toBe(false)
  })
})
