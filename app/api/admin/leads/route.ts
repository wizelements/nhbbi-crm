import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth'
import { db, leads, users } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

const updateSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'qualified', 'closed', 'lost']).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = db
    .select({
      lead: leads,
      assignee: users,
    })
    .from(leads)
    .leftJoin(users, eq(users.id, leads.assignedTo))

  if (status) {
    query = query.where(eq(leads.status, status as typeof leads.$inferSelect.status)) as typeof query
  }

  const rows = await query.orderBy(sql`${leads.createdAt} desc`).limit(200)
  return NextResponse.json({
    leads: rows.map((row) => ({
      ...row.lead,
      assignedEmail: row.assignee?.email ?? null,
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

  const { leadId, status, assignedTo } = parsed.data
  const update: Partial<typeof leads.$inferInsert> = {}
  if (status) update.status = status
  if (assignedTo !== undefined) update.assignedTo = assignedTo
  update.updatedAt = new Date()

  await db.update(leads).set(update).where(eq(leads.id, leadId))

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'lead_updated',
    entityType: 'lead',
    entityId: leadId,
    metadata: { status, assignedTo },
  })

  return NextResponse.json({ ok: true })
}
