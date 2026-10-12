import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db, staffRoles, staffRoleAssignments, users } from '@/lib/db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getAdminAccess } from '@/lib/admin/access'
import { logActivity } from '@/lib/admin/activity'

export const runtime = 'nodejs'
const schema = z.object({ userId: z.string().uuid(), roleId: z.string().uuid() })
async function owner() {
  const session = await auth()
  const access = await getAdminAccess(session?.user?.id)
  return { session, allowed: access.isOwnerAdmin }
}
async function validated(request: Request) {
  const body = await request.json().catch(() => null)
  return schema.safeParse(body)
}
export async function POST(request: Request) {
  const { session, allowed } = await owner()
  if (!allowed || !session?.user?.id) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
  const parsed = await validated(request)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 })
  const { userId, roleId } = parsed.data
  if (userId === session.user.id) return NextResponse.json({ error: 'Self-assignment is disabled' }, { status: 403 })
  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  const [role] = await db.select({ id: staffRoles.id, active: staffRoles.active }).from(staffRoles).where(eq(staffRoles.id, roleId)).limit(1)
  if (!target || !role) return NextResponse.json({ error: 'User or role not found' }, { status: 404 })
  if (target.role !== 'member' || !role.active) return NextResponse.json({ error: 'Only member accounts may receive active staff roles' }, { status: 409 })
  const existing = await db.select({ id: staffRoleAssignments.id }).from(staffRoleAssignments)
    .where(and(eq(staffRoleAssignments.userId, userId), eq(staffRoleAssignments.roleId, roleId))).limit(1)
  if (existing.length) return NextResponse.json({ ok: true, alreadyAssigned: true })
  const created = await db.insert(staffRoleAssignments).values({ userId, roleId, assignedBy: session.user.id })
    .onConflictDoNothing().returning({ id: staffRoleAssignments.id })
  if (!created.length) return NextResponse.json({ ok: true, alreadyAssigned: true })
  await logActivity({ actorType: 'user', actorId: session.user.id, action: 'staff_role_assigned', entityType: 'user', entityId: userId, metadata: { roleId } })
  return NextResponse.json({ ok: true }, { status: 201 })
}
export async function DELETE(request: Request) {
  const { session, allowed } = await owner()
  if (!allowed || !session?.user?.id) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
  const parsed = await validated(request)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 })
  const { userId, roleId } = parsed.data
  const deleted = await db.delete(staffRoleAssignments).where(and(eq(staffRoleAssignments.userId, userId), eq(staffRoleAssignments.roleId, roleId)))
    .returning({ id: staffRoleAssignments.id })
  if (!deleted.length) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  await logActivity({ actorType: 'user', actorId: session.user.id, action: 'staff_role_revoked', entityType: 'user', entityId: userId, metadata: { roleId } })
  return NextResponse.json({ ok: true })
}
