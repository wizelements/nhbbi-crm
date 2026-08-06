import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth'
import { db, directoryListings, users } from '@/lib/db'
import { eq, sql, like, or } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

const updateSchema = z.object({
  listingId: z.string().uuid(),
  approved: z.boolean().optional(),
  featured: z.boolean().optional(),
  category: z.string().optional(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const approved = searchParams.get('approved')
  const featured = searchParams.get('featured')

  const baseQuery = db
    .select({
      listing: directoryListings,
      owner: users,
    })
    .from(directoryListings)
    .leftJoin(users, eq(users.id, directoryListings.ownerUserId))

  let query = baseQuery

  if (q) {
    query = query.where(
      or(
        like(directoryListings.companyName, `%${q}%`),
        like(directoryListings.category, `%${q}%`),
        like(directoryListings.contactEmail, `%${q}%`)
      )
    ) as typeof baseQuery
  }

  if (approved === 'true') {
    query = query.where(eq(directoryListings.approved, true)) as typeof baseQuery
  } else if (approved === 'false') {
    query = query.where(eq(directoryListings.approved, false)) as typeof baseQuery
  }

  if (featured === 'true') {
    query = query.where(eq(directoryListings.featured, true)) as typeof baseQuery
  }

  const rows = await query.orderBy(sql`${directoryListings.createdAt} desc`).limit(200)

  return NextResponse.json({
    listings: rows.map((row) => ({
      ...row.listing,
      ownerEmail: row.owner?.email ?? null,
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

  const { listingId, approved, featured, category } = parsed.data
  const update: Partial<typeof directoryListings.$inferInsert> = {}
  if (typeof approved === 'boolean') update.approved = approved
  if (typeof featured === 'boolean') update.featured = featured
  if (category) update.category = category
  update.updatedAt = new Date()

  await db.update(directoryListings).set(update).where(eq(directoryListings.id, listingId))

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'directory_updated',
    entityType: 'directory_listing',
    entityId: listingId,
    metadata: { approved, featured, category },
  })

  return NextResponse.json({ ok: true })
}
