import { NextResponse } from 'next/server'
import { db, users, memberships, directoryListings, leads, orders, events } from '@/lib/db'
import { eq, sql, and, gte } from 'drizzle-orm'
import { sendTelegramAlert, formatAlert } from '@/lib/notifications/telegram'
import { env } from '@/lib/env'
import { verifyCronAuthorization } from '@/lib/notifications/cron-auth'

export async function GET(request: Request) {
  if (!verifyCronAuthorization(request.headers.get('authorization'), env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [memberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'member'))

  const [pendingMembers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(eq(memberships.status, 'pending'))

  const [pendingDirectory] = await db
    .select({ count: sql<number>`count(*)` })
    .from(directoryListings)
    .where(eq(directoryListings.approved, false))

  const [newLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(gte(leads.createdAt, since))

  const [revenueRows] = await db
    .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(and(eq(orders.status, 'paid'), gte(orders.createdAt, since)))

  const [upcomingEvents] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(and(gte(events.startAt, new Date()), eq(events.published, true)))

  const revenueCents = revenueRows?.total ?? 0

  await sendTelegramAlert(
    formatAlert({
      title: 'NHBBJ Daily Report',
      body: [
        `Members: ${memberCount?.count ?? 0}`,
        `Pending members: ${pendingMembers?.count ?? 0}`,
        `Pending directory: ${pendingDirectory?.count ?? 0}`,
        `New leads (24h): ${newLeads?.count ?? 0}`,
        `Revenue (24h): $${(revenueCents / 100).toFixed(2)}`,
        `Upcoming events: ${upcomingEvents?.count ?? 0}`,
      ].join('\n'),
      url: `${env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
    })
  )

  return NextResponse.json({
    members: memberCount?.count ?? 0,
    pendingMembers: pendingMembers?.count ?? 0,
    pendingDirectory: pendingDirectory?.count ?? 0,
    newLeads: newLeads?.count ?? 0,
    revenueCents,
    upcomingEvents: upcomingEvents?.count ?? 0,
  })
}
