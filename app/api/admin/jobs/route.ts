import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, jobs } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

const updateSchema = z.object({
  jobId: z.string().uuid(),
  published: z.boolean().optional(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'jobs.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const published = searchParams.get('published')

  let query = db.select().from(jobs)
  if (published === 'true') {
    query = query.where(eq(jobs.published, true)) as typeof query
  } else if (published === 'false') {
    query = query.where(eq(jobs.published, false)) as typeof query
  }

  const rows = await query.orderBy(jobs.createdAt)
  return NextResponse.json({ jobs: rows })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'jobs.moderate'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { jobId, published } = parsed.data
  const update: Partial<typeof jobs.$inferInsert> = {}
  if (typeof published === 'boolean') update.published = published
  update.updatedAt = new Date()

  await db.update(jobs).set(update).where(eq(jobs.id, jobId))

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: published ? 'job_published' : 'job_unpublished',
    entityType: 'job',
    entityId: jobId,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session || !(await canAdmin(session?.user?.id, 'jobs.moderate'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await db.delete(jobs).where(eq(jobs.id, id))
  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'job_deleted',
    entityType: 'job',
    entityId: id,
  })
  return NextResponse.json({ ok: true })
}
