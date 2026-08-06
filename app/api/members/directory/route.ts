import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { isMember } from '@/lib/auth'
import { db, directoryListings } from '@/lib/db'
import { directoryListingSchema } from '@/lib/validations/member'
import { logActivity } from '@/lib/admin/activity'

export async function GET() {
  const session = await auth()
  if (!session || !isMember(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const listings = await db
    .select()
    .from(directoryListings)
    .where(eq(directoryListings.ownerUserId, session.user.id))
    .orderBy(directoryListings.createdAt)

  return NextResponse.json({ listings })
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

  const parsed = directoryListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const data = parsed.data
  const userId = session.user.id

  const existing = await db
    .select({ id: directoryListings.id })
    .from(directoryListings)
    .where(eq(directoryListings.slug, data.slug))
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'A directory listing with that URL slug already exists.' },
      { status: 409 }
    )
  }

  const [inserted] = await db
    .insert(directoryListings)
    .values({
      ownerUserId: userId,
      companyName: data.companyName,
      slug: data.slug.toLowerCase(),
      description: data.description || null,
      category: data.category,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      approved: false,
      featured: false,
    })
    .returning({ id: directoryListings.id })

  await logActivity({
    actorType: 'user',
    actorId: userId,
    action: 'directory_listing_created',
    entityType: 'directory_listing',
    entityId: inserted.id,
    metadata: { companyName: data.companyName, slug: data.slug },
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

  const parsed = directoryListingSchema.extend({ id: directoryListingSchema.shape.slug.uuid() }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { id, ...data } = parsed.data
  const userId = session.user.id

  const [existing] = await db
    .select()
    .from(directoryListings)
    .where(eq(directoryListings.id, id))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  if (existing.ownerUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (data.slug.toLowerCase() !== existing.slug) {
    const slugConflict = await db
      .select({ id: directoryListings.id })
      .from(directoryListings)
      .where(eq(directoryListings.slug, data.slug.toLowerCase()))
      .limit(1)

    if (slugConflict.length > 0) {
      return NextResponse.json(
        { error: 'That URL slug is already in use.' },
        { status: 409 }
      )
    }
  }

  await db
    .update(directoryListings)
    .set({
      companyName: data.companyName,
      slug: data.slug.toLowerCase(),
      description: data.description || null,
      category: data.category,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(directoryListings.id, id))

  await logActivity({
    actorType: 'user',
    actorId: userId,
    action: 'directory_listing_updated',
    entityType: 'directory_listing',
    entityId: id,
    metadata: { companyName: data.companyName, slug: data.slug },
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

  const [existing] = await db
    .select()
    .from(directoryListings)
    .where(eq(directoryListings.id, id))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  if (existing.ownerUserId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.delete(directoryListings).where(eq(directoryListings.id, id))

  await logActivity({
    actorType: 'user',
    actorId: session.user.id,
    action: 'directory_listing_deleted',
    entityType: 'directory_listing',
    entityId: id,
    metadata: { companyName: existing.companyName },
  })

  return NextResponse.json({ ok: true })
}
