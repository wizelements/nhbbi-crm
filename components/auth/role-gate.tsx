'use client'

import { type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { type UserRole, hasRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface RoleGateProps {
  allowedRole: UserRole
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGate({ allowedRole, fallback, children }: RoleGateProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="animate-pulse rounded-md bg-muted p-8">
        <div className="h-4 w-1/3 rounded bg-muted-foreground/20" />
      </div>
    )
  }

  const user = session?.user
  if (!user || !hasRole(user as { role: UserRole }, allowedRole)) {
    return (
      fallback || (
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-lg font-semibold">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to view this content.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      )
    )
  }

  return <>{children}</>
}
