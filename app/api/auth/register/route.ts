import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, users } from '@/lib/db'
import { hashPassword, isAdminSetupSecret } from '@/lib/auth'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  adminSecret: z.string().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { email, password, firstName, lastName, adminSecret } = parsed.data

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 }
    )
  }

  const role = adminSecret && isAdminSetupSecret(adminSecret) ? 'admin' : 'member'
  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      role,
      firstName: firstName || null,
      lastName: lastName || null,
      emailVerified: false,
    })
    .returning({ id: users.id })

  return NextResponse.json(
    { id: user.id, email: email.toLowerCase(), role },
    { status: 201 }
  )
}
