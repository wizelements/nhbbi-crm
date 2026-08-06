import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'

export async function AdminHeader({ user }: { user: AuthUser }) {
  return (
    <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-8">
      <h1 className="text-lg font-semibold">Admin CRM</h1>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground md:inline">{user.email}</span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <Button type="submit" variant="outline" size="sm">Sign out</Button>
        </form>
      </div>
    </header>
  )
}
