'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Briefcase,
  MessageSquare,
  ShoppingCart,
  Bot,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'
import type { Permission } from '@/lib/admin/permission-catalog'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'roles.manage' },
  { href: '/admin/members', label: 'Members', icon: Users, permission: 'members.view' },
  { href: '/admin/directory', label: 'Directory', icon: Building2, permission: 'directory.view' },
  { href: '/admin/events', label: 'Events', icon: CalendarDays, permission: 'events.view' },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase, permission: 'jobs.view' },
  { href: '/admin/leads', label: 'Leads', icon: MessageSquare, permission: 'leads.view' },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, permission: 'orders.view' },
  { href: '/admin/ai-agent', label: 'AI Agent', icon: Bot, permission: 'ai.view' },
  { href: '/admin/roles', label: 'People & Roles', icon: ShieldCheck, permission: 'roles.manage' },
]

export function AdminSidebar({ user, permissions }: { user: AuthUser, permissions: Permission[] }) {
  const pathname = usePathname()
  const visibleItems = navItems.filter(item => permissions.includes(item.permission as Permission))

  return (
    <aside className="sticky top-0 z-30 flex h-16 w-full flex-row items-center justify-between border-b bg-navy px-4 text-white md:h-screen md:w-64 md:flex-col md:items-stretch md:justify-start md:px-0 md:py-6">
      <div className="flex items-center gap-3 px-0 md:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-gold font-bold text-navy">N</div>
        <span className="hidden text-lg font-bold md:inline">NHBBI Workspace</span>
      </div>

      <nav className="hidden flex-1 space-y-1 overflow-y-auto px-3 py-6 md:block">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 text-white/80 hover:bg-white/10 hover:text-white',
                  active && 'bg-white/10 text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <nav aria-label="Admin navigation" className="flex max-w-[70vw] items-center gap-1 overflow-x-auto md:hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  'text-white/80 hover:bg-white/10 hover:text-white',
                  active && 'bg-white/10 text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="hidden border-t border-white/10 px-6 py-4 md:block">
        <p className="truncate text-sm font-medium">{user.email}</p>
        <p className="text-xs capitalize text-white/60">{user.role}</p>
      </div>
    </aside>
  )
}
