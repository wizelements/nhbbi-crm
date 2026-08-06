import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/lib/env'

export type UserRole = 'visitor' | 'member' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  firstName?: string | null
  lastName?: string | null
}

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function isAdminSetupSecret(secret: string): boolean {
  return secret === env.ADMIN_SETUP_SECRET
}

export function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && ['visitor', 'member', 'admin'].includes(role)
}

export function hasRole(user: { role: UserRole } | null | undefined, role: UserRole): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === role
}

export function isAdmin(user: { role: UserRole } | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isMember(user: { role: UserRole } | null | undefined): boolean {
  return user?.role === 'member' || user?.role === 'admin'
}

export async function signJwt(payload: Record<string, unknown>): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJwt(token: string): Promise<AuthUser | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const { id, email, role, firstName, lastName } = payload as Record<string, unknown>
    if (
      typeof id !== 'string' ||
      typeof email !== 'string' ||
      !isValidRole(role)
    ) {
      return null
    }
    return {
      id,
      email,
      role,
      firstName: typeof firstName === 'string' ? firstName : null,
      lastName: typeof lastName === 'string' ? lastName : null,
    }
  } catch {
    return null
  }
}
