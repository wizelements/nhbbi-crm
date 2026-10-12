import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, users } from '@/lib/db'
import { env } from '@/lib/env'
import { verifyPassword, isValidRole, isAdminSetupSecret, hashPassword, type UserRole } from '@/lib/auth'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

async function ensureFirstAdmin() {
  const existing = await db.select().from(users).limit(1)
  if (existing.length > 0) return

  const email = env.ADMIN_DEFAULT_EMAIL
  const password = env.ADMIN_DEFAULT_PASSWORD
  if (password.length < 16 || password === 'ChangeMeNow!') throw new Error('Secure admin bootstrap credentials required')
  const passwordHash = await hashPassword(password)

  await db.insert(users).values({
    email,
    passwordHash,
    role: 'admin',
    emailVerified: true,
  })
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        await ensureFirstAdmin()

        const { email, password } = parsed.data
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1)

        if (!user) return null

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role as UserRole
        token.firstName = user.firstName ?? null
        token.lastName = user.lastName ?? null
      }
      return token
    },
    async session({ session, token }) {
      const role = isValidRole(token.role) ? token.role : 'visitor'
      const user = {
        id: token.id as string,
        email: token.email as string,
        role,
        firstName: (token.firstName as string | null | undefined) ?? null,
        lastName: (token.lastName as string | null | undefined) ?? null,
      }
      session.user = user as typeof session.user
      return session
    },
  },
})

export { isAdminSetupSecret }
