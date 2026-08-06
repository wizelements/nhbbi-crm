'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  UserCircle,
  Building2,
  Briefcase,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import type { AuthUser } from '@/lib/auth'

const navItems = [
  { href: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/member/profile', label: 'Profile', icon: UserCircle },
  { href: '/member/directory', label: 'Directory Listing', icon: Building2 },
  { href: '/member/jobs', label: 'Job Postings', icon: Briefcase },
  { href: '/member/events', label: 'My Events', icon: CalendarDays },
]

export function MemberShell({
  children,
  user,
}: {
  children: ReactNode
  user: AuthUser
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-navy text-white transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <Link href="/member/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-bold text-navy">
                BBI
              </div>
              <span className="font-semibold">Member Portal</span>
            </Link>
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-gold text-navy'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 text-sm">
              <p className="font-medium text-white">{user.firstName || user.email}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Link href="/member/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-bold text-navy">
            BBI
          </div>
          <span className="font-semibold text-navy">Member Portal</span>
        </Link>
        <button
          className="p-2 text-navy"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto px-4 py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
