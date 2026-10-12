import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, users, memberships, memberProfiles } from '@/lib/db'
import { eq, sql, like, or } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

const updateSchema = z.object({
  userId: z.string().uuid(),
  profileApproved: z.boolean().optional(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'members.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const status = searchParams.get('status') as 'active' | 'pending' | 'cancelled' | 'expired' | null

  const baseQuery = db
    .select({
      user: users,
      membership: memberships,
      profile: memberProfiles,
    })
    .from(users)
    .leftJoin(memberships, eq(memberships.userId, users.id))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))

  let query = baseQuery

  if (q) {
    query = query.where(
      or(
        like(users.email, `%${q}%`),
        like(users.firstName, `%${q}%`),
        like(users.lastName, `%${q}%`),
        like(memberProfiles.companyName, `%${q}%`)
      )
    ) as typeof baseQuery
  }

  if (status) {
    query = query.where(eq(memberships.status, status)) as typeof baseQuery
  }

  const rows = await query.orderBy(sql`${users.createdAt} desc`).limit(200)

  return NextResponse.json({
    members: rows.map((row) => ({
      id: row.user.id,
      email: row.user.email,
      role: row.user.role,
      firstName: row.user.firstName,
      lastName: row.user.lastName,
      createdAt: row.user.createdAt,
      membership: row.membership,
      profile: row.profile,
    })),
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'members.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { userId, profileApproved } = parsed.data
  if (Object.prototype.hasOwnProperty.call(body, 'membershipStatus') ||
      Object.prototype.hasOwnProperty.call(body, 'membershipTier') ||
      Object.prototype.hasOwnProperty.call(body, 'role')) {
    return NextResponse.json({ error: 'Membership billing and account roles cannot be changed through this endpoint' }, { status: 403 })
  }
  if (profileApproved === undefined) {
    return NextResponse.json({ error: 'No supported change provided' }, { status: 400 })
  }
  if (typeof profileApproved === 'boolean') {
    await db
      .update(memberProfiles)
      .set({ approved: profileApproved, updatedAt: new Date() })
      .where(eq(memberProfiles.userId, userId))
  }

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'member_updated',
    entityType: 'user',
    entityId: userId,
    metadata: { profileApproved },
  })

  return NextResponse.json({ ok: true })
}
