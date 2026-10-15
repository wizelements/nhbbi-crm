import { describe, it, expect } from 'vitest'
import { PERMISSION_KEYS, DELEGABLE_PERMISSIONS, validDelegation, parsePermissions } from './permission-catalog'

describe('admin role boundary', () => {
  it('does not delegate role creation / assignment', () => {
    expect(validDelegation(['roles.manage'])).toBe(false)
    expect(DELEGABLE_PERMISSIONS).not.toContain('roles.manage')
    expect(DELEGABLE_PERMISSIONS).not.toContain('ai.view')
    expect(PERMISSION_KEYS).toContain('roles.manage')
  })
  it('requires explicit permissions', () => {
    expect(validDelegation([])).toBe(false)
    expect(validDelegation(['directory.view', 'orders.view'])).toBe(true)
    expect(validDelegation(['directory.view', 'unknown'])).toBe(false)
  })
  it('fails closed for malformed or elevated stored roles', () => {
    expect(parsePermissions('not json')).toEqual([])
    expect(parsePermissions('{"admin":true}')).toEqual([])
    expect(parsePermissions('["roles.manage","directory.view"]')).toEqual(['directory.view'])
  })
})
