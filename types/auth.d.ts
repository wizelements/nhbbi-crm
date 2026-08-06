import { type UserRole } from '@/lib/auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
  }

  interface Session {
    user: User
  }
}

declare module '@auth/core/types' {
  interface User {
    id: string
    email: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
  }

  interface Session {
    user: User
  }
}
