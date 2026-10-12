import { and, eq } from 'drizzle-orm'
import { db, staffRoles, staffRoleAssignments, users } from '@/lib/db'
import { PERMISSION_KEYS, parsePermissions, type Permission } from '@/lib/admin/permission-catalog'

export interface AdminAccess {
  isOwnerAdmin: boolean
  permissions: Permission[]
}

/** Never authorize from a mutable or stale browser/JWT role claim. Read current DB state. */
export async function getAdminAccess(userId?: string | null): Promise<AdminAccess> {
  const denied: AdminAccess = { isOwnerAdmin: false, permissions: [] }
  if (!userId) return denied
  const [account] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  if (!account) return denied
  if (account.role === 'admin') return { isOwnerAdmin: true, permissions: [...PERMISSION_KEYS] }
  if (account.role !== 'member') return denied
  try {
    const assigned = await db.select({ permissions: staffRoles.permissions })
      .from(staffRoleAssignments)
      .innerJoin(staffRoles, eq(staffRoleAssignments.roleId, staffRoles.id))
      .where(and(eq(staffRoleAssignments.userId, userId), eq(staffRoles.active, true)))
    const permissions = Array.from(new Set(assigned.flatMap(row => parsePermissions(row.permissions))))
    return { isOwnerAdmin: false, permissions }
  } catch {
    // Until the role migration is applied, preserve member self-service
    // without granting any delegated staff authority.
    return denied
  }
}

export async function canAdmin(userId: string | null | undefined, permission: Permission): Promise<boolean> {
  return (await getAdminAccess(userId)).permissions.includes(permission)
}

/** Member and client access must also honor current DB role, not a stale JWT. */
export async function canMember(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false
  const [account] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  return account?.role === 'member' || account?.role === 'admin'
}
