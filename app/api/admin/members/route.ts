import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth'
import { db, users, memberships, memberProfiles } from '@/lib/db'
import { eq, sql, like, or } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

const updateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['visitor', 'member', 'admin']).optional(),
  membershipStatus: z.enum(['active', 'pending', 'cancelled', 'expired']).optional(),
  membershipTier: z.enum(['bronze', 'silver', 'gold']).optional(),
  profileApproved: z.boolean().optional(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session || !isAdmin(session.user)) {
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
      ...row.user,
      membership: row.membership,
      profile: row.profile,
    })),
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { userId, role, membershipStatus, membershipTier, profileApproved } = parsed.data

  if (role) {
    await db.update(users).set({ role }).where(eq(users.id, userId))
  }

  if (membershipStatus || membershipTier) {
    const update: Partial<typeof memberships.$inferInsert> = {}
    if (membershipStatus) update.status = membershipStatus
    if (membershipTier) update.tier = membershipTier
    update.updatedAt = new Date()
    await db.update(memberships).set(update).where(eq(memberships.userId, userId))
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
    metadata: { role, membershipStatus, membershipTier, profileApproved },
  })

  return NextResponse.json({ ok: true })
}
