import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, events } from '@/lib/db'
import { eq, sql, like } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()).optional(),
  priceCents: z.coerce.number().min(0).default(0),
  capacity: z.coerce.number().int().optional(),
  published: z.boolean().default(false),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'events.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''

  let query = db.select().from(events)
  if (q) {
    query = query.where(like(events.title, `%${q}%`)) as typeof query
  }

  const rows = await query.orderBy(sql`${events.startAt} desc`).limit(200)
  return NextResponse.json({ events: rows })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'events.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const values = {
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    location: data.location ?? null,
    startAt: new Date(data.startAt),
    endAt: data.endAt ? new Date(data.endAt) : null,
    priceCents: data.priceCents,
    capacity: data.capacity ?? null,
    published: data.published,
  }

  if (data.id) {
    await db.update(events).set({ ...values, updatedAt: new Date() }).where(eq(events.id, data.id))
    await logActivity({
      actorType: 'user',
      actorId: session.user.id,
      action: 'event_updated',
      entityType: 'event',
      entityId: data.id,
      metadata: { title: data.title },
    })
    return NextResponse.json({ ok: true, id: data.id })
  }

  const [inserted] = await db.insert(events).values(values).returning({ id: events.id })
  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'event_created',
    entityType: 'event',
    entityId: inserted.id,
    metadata: { title: data.title },
  })
  return NextResponse.json({ ok: true, id: inserted.id })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'events.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await db.delete(events).where(eq(events.id, id))
  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'event_deleted',
    entityType: 'event',
    entityId: id,
  })
  return NextResponse.json({ ok: true })
}
