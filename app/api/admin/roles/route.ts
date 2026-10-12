import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db, staffRoles, staffRoleAssignments, users } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import { getAdminAccess } from '@/lib/admin/access'
import { validDelegation } from '@/lib/admin/permission-catalog'
import { logActivity } from '@/lib/admin/activity'

export const runtime = 'nodejs'
const schema = z.object({
  name: z.string().trim().min(2).max(64),
  description: z.string().trim().max(240).default(''),
  permissions: z.array(z.string()).min(1).max(12),
  active: z.boolean().default(true),
}).refine(input => validDelegation(input.permissions), 'Permissions cannot include owner-only actions')
const change = schema.partial().extend({ id: z.string().uuid() })

async function requireOwner() {
  const session = await auth()
  const access = await getAdminAccess(session?.user?.id)
  return { session, allowed: access.isOwnerAdmin }
}

export async function GET() {
  const { allowed } = await requireOwner()
  if (!allowed) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
  const [roles, assignments, accounts] = await Promise.all([
    db.select().from(staffRoles).orderBy(desc(staffRoles.createdAt)),
    db.select().from(staffRoleAssignments),
    db.select({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role }).from(users).limit(500),
  ])
  return NextResponse.json({ roles: roles.map(role => ({ ...role, permissions: JSON.parse(role.permissions) })), assignments, users: accounts })
}

export async function POST(request: Request) {
  const { session, allowed } = await requireOwner()
  if (!allowed || !session?.user?.id) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Check role name and permissions', details: parsed.error.flatten() }, { status: 400 })
  const { name, description, active } = parsed.data
  const permissions = Array.from(new Set(parsed.data.permissions))
  const [created] = await db.insert(staffRoles).values({
    name, description, active, permissions: JSON.stringify(permissions),
    createdBy: session.user.id,
  }).returning({ id: staffRoles.id })
  await logActivity({ actorType: 'user', actorId: session.user.id, action: 'staff_role_created',
    entityType: 'staff_role', entityId: created.id, metadata: { name, permissions } })
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { session, allowed } = await requireOwner()
  if (!allowed || !session?.user?.id) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const parsed = change.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid role update' }, { status: 400 })
  const [existing] = await db.select().from(staffRoles).where(eq(staffRoles.id, parsed.data.id)).limit(1)
  if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
  const { id, ...updates } = parsed.data
  await db.update(staffRoles).set({
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.description !== undefined ? { description: updates.description } : {}),
    ...(updates.active !== undefined ? { active: updates.active } : {}),
    ...(updates.permissions !== undefined ? { permissions: JSON.stringify([...new Set(updates.permissions)]) } : {}),
    updatedAt: new Date(),
  }).where(eq(staffRoles.id, id))
  await logActivity({ actorType: 'user', actorId: session.user.id, action: 'staff_role_updated',
    entityType: 'staff_role', entityId: id, metadata: { ...updates } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { session, allowed } = await requireOwner()
  if (!allowed || !session?.user?.id) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  const assigned = await db.select({ userId: staffRoleAssignments.userId }).from(staffRoleAssignments).where(eq(staffRoleAssignments.roleId, id)).limit(1)
  if (assigned.length) return NextResponse.json({ error: 'Remove member assignments before deleting this role' }, { status: 409 })
  await db.delete(staffRoles).where(eq(staffRoles.id, id))
  await logActivity({ actorType: 'user', actorId: session.user.id, action: 'staff_role_deleted', entityType: 'staff_role', entityId: id })
  return NextResponse.json({ ok: true })
}
