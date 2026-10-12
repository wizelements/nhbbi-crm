import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, users, memberships, leads, directoryListings, orders } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  DollarSign,
  MessageSquare,
  Clock,
  Building2,
  CalendarDays,
  Briefcase,
  ArrowRight,
} from 'lucide-react'

async function getKpis() {
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'member'))

  const [pendingMemberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(eq(memberships.status, 'pending'))

  const [leadCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(eq(leads.status, 'new'))

  const [directoryPendingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(directoryListings)
    .where(eq(directoryListings.approved, false))

  const revenueRows = await db
    .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(eq(orders.status, 'paid'))

  const revenueCents = revenueRows[0]?.total ?? 0

  return {
    members: memberCount?.count ?? 0,
    pendingMembers: pendingMemberCount?.count ?? 0,
    leads: leadCount?.count ?? 0,
    pendingDirectory: directoryPendingCount?.count ?? 0,
    revenueCents,
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'roles.manage'))) {
    redirect('/login?callbackUrl=/admin/dashboard')
  }

  const kpis = await getKpis()

  const cards = [
    {
      title: 'Total Members',
      value: kpis.members,
      sub: `${kpis.pendingMembers} pending approval`,
      icon: Users,
      href: '/admin/members',
      color: 'text-blue-600',
    },
    {
      title: 'Revenue (lifetime)',
      value: formatCurrency(kpis.revenueCents),
      sub: 'Paid orders only',
      icon: DollarSign,
      href: '/admin/orders',
      color: 'text-green-600',
    },
    {
      title: 'New Leads',
      value: kpis.leads,
      sub: 'Awaiting follow-up',
      icon: MessageSquare,
      href: '/admin/leads',
      color: 'text-gold-600',
    },
    {
      title: 'Pending Approvals',
      value: kpis.pendingDirectory,
      sub: 'Directory listings',
      icon: Clock,
      href: '/admin/directory',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of membership, revenue, leads, and approvals.</p>
        </div>
        <Button asChild variant="navy">
          <Link href="/admin/ai-agent">Open AI Agent</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:border-gold/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={cn('h-4 w-4', card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">
                  <Link href={card.href}>View {card.title.toLowerCase()} <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin workflows one click away.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/members">
                <Users className="mr-2 h-4 w-4" /> Manage members
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/directory">
                <Building2 className="mr-2 h-4 w-4" /> Approve directory listings
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/events">
                <CalendarDays className="mr-2 h-4 w-4" /> Manage events
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/jobs">
                <Briefcase className="mr-2 h-4 w-4" /> Moderate jobs
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Agent</CardTitle>
            <CardDescription>Natural-language CRM assistant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask the agent to summarize leads, approve members, create event stubs, or run safe read/write actions.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/ai-agent">Launch Agent Console</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
