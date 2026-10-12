import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { canMember } from '@/lib/admin/access'
import { db, users, memberProfiles } from '@/lib/db'
import { profileUpdateSchema } from '@/lib/validations/member'
import { logActivity } from '@/lib/admin/activity'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || !(await canMember(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const [profile] = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, userId))
    .limit(1)

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
    profile: profile ?? null,
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !(await canMember(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const userId = session.user.id
  const { firstName, lastName, phone, companyName, website, bio, category } = parsed.data

  await db
    .update(users)
    .set({
      firstName,
      lastName,
      phone: phone || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  const [existingProfile] = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, userId))
    .limit(1)

  if (existingProfile) {
    await db
      .update(memberProfiles)
      .set({
        companyName: companyName || null,
        website: website || null,
        phone: phone || null,
        bio: bio || null,
        category: category || null,
        updatedAt: new Date(),
      })
      .where(eq(memberProfiles.userId, userId))
  } else {
    await db.insert(memberProfiles).values({
      userId,
      companyName: companyName || null,
      website: website || null,
      phone: phone || null,
      bio: bio || null,
      category: category || null,
    })
  }

  await logActivity({
    actorType: 'user',
    actorId: userId,
    action: 'profile_updated',
    entityType: 'member_profile',
    entityId: existingProfile?.id ?? userId,
    metadata: { firstName, lastName, category },
  })

  return NextResponse.json({ ok: true })
}
