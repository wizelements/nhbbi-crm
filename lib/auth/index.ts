import { auth as nextAuth } from '@/auth'
import {
  isAdmin as checkAdmin,
  isMember as checkMember,
  type UserRole,
} from '@/lib/auth'

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  name?: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface Session {
  user: SessionUser
  expires: string
}

export async function auth(): Promise<Session | null> {
  const session = (await nextAuth()) as Session | null
  return session
}

export async function requireAuth(): Promise<Session> {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (!checkAdmin(session.user)) {
    throw new Error('Forbidden')
  }
  return session
}

export async function requireMember(): Promise<Session> {
  const session = await requireAuth()
  if (!checkMember(session.user)) {
    throw new Error('Forbidden')
  }
  return session
}
