/** Scope a staff role to actual NHBBI workflows. Only owner/admin may manage roles. */
export const PERMISSIONS = {
  'members.view': 'View members',
  'members.manage': 'Manage member profiles and approvals',
  'directory.view': 'View business listings',
  'directory.moderate': 'Review and publish directory listings',
  'events.view': 'View events and registrations',
  'events.manage': 'Manage events',
  'jobs.view': 'View job postings',
  'jobs.moderate': 'Moderate job postings',
  'leads.view': 'View inquiries and leads',
  'leads.manage': 'Assign and update leads',
  'orders.view': 'View orders and payments',
  'ai.view': 'Use approved AI reporting',
  'roles.manage': 'Create roles and assign access',
} as const

export type Permission = keyof typeof PERMISSIONS
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[]
export const DELEGABLE_PERMISSIONS = PERMISSION_KEYS.filter(p => p !== 'roles.manage' && p !== 'ai.view')
export const hasPermission = (permissions: readonly Permission[], permission: Permission) =>
  permissions.includes(permission)
export const validDelegation = (requested: readonly string[]) =>
  requested.length > 0 && requested.every(p => DELEGABLE_PERMISSIONS.some(allowed => allowed === p))
export function parsePermissions(value: string): Permission[] {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((p): p is Permission =>
      typeof p === 'string' && DELEGABLE_PERMISSIONS.some(v => v === p))
  } catch { return [] }
}
