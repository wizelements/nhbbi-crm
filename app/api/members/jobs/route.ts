import { NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import { isMember } from '@/lib/auth'
import { db, jobs } from '@/lib/db'
import { jobSchema } from '@/lib/validations/member'
import { logActivity } from '@/lib/admin/activity'

export async function GET() {
  const session = await auth()
  if (!session || !isMember(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.ownerUserId, session.user.id))
    .orderBy(desc(jobs.createdAt))

  return NextResponse.json({ jobs: rows })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !isMember(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = jobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const data = parsed.data
  const [inserted] = await db
    .insert(jobs)
    .values({
      ownerUserId: session.user.id,
      companyId: data.companyId || null,
      title: data.title,
      description: data.description,
      location: data.location || null,
      contactEmail: data.contactEmail,
      published: false,
    })
    .returning({ id: jobs.id })

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'job_created',
    entityType: 'job',
    entityId: inserted.id,
    metadata: { title: data.title },
  })

  return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session || !isMember(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const schema = jobSchema.extend({ id: jobSchema.shape.title.uuid() })
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { id, ...data } = parsed.data
  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (!existing) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
  if (existing.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db
    .update(jobs)
    .set({
      title: data.title,
      description: data.description,
      location: data.location || null,
      contactEmail: data.contactEmail,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'job_updated',
    entityType: 'job',
    entityId: id,
    metadata: { title: data.title },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session || !isMember(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
  if (!existing) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
  if (existing.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.delete(jobs).where(eq(jobs.id, id))

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'job_deleted',
    entityType: 'job',
    entityId: id,
    metadata: { title: existing.title },
  })

  return NextResponse.json({ ok: true })
}
