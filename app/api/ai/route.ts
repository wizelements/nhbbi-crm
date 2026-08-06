import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/auth'
import { db, users, memberships, memberProfiles, directoryListings, leads, events, orders, aiAgentSessions } from '@/lib/db'
import { eq, sql, gte } from 'drizzle-orm'
import { logActivity } from '@/lib/admin/activity'
import { env } from '@/lib/env'
import { z } from 'zod'

const intentSchema = z.object({
  intent: z.string().min(1).max(1000),
})

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authHeader = request.headers.get('x-ai-agent-secret')
  if (authHeader !== env.AI_AGENT_SECRET) {
    return NextResponse.json({ error: 'Invalid agent secret' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = intentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { intent } = parsed.data
  const normalized = normalize(intent)
  const actions: string[] = []
  let result = ''

  try {
    if (normalized.includes('lead') && (normalized.includes('summary') || normalized.includes('summarize'))) {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const rows = await db
        .select({
          count: sql<number>`count(*)`,
          statuses: sql<string>`group_concat(${leads.status})`,
        })
        .from(leads)
        .where(gte(leads.createdAt, since))

      const count = rows[0]?.count ?? 0
      const statuses = rows[0]?.statuses ?? ''
      result = `There are ${count} new leads in the last 7 days. Status distribution: ${statuses || 'none'}.`
      actions.push('lead_summary')
    } else if (normalized.includes('member') && normalized.includes('pending')) {
      const rows = await db
        .select({
          user: users,
          membership: memberships,
        })
        .from(users)
        .leftJoin(memberships, eq(memberships.userId, users.id))
        .where(eq(memberships.status, 'pending'))
        .limit(50)

      result = `Found ${rows.length} pending member${rows.length === 1 ? '' : 's'}.`
      actions.push('pending_members_listed')

      if (normalized.includes('approve')) {
        for (const row of rows) {
          await db
            .update(memberships)
            .set({ status: 'active', updatedAt: new Date() })
            .where(eq(memberships.userId, row.user.id))
          await db
            .update(memberProfiles)
            .set({ approved: true, updatedAt: new Date() })
            .where(eq(memberProfiles.userId, row.user.id))
          actions.push(`approved_member_${row.user.id}`)
        }
        result += ` Approved ${rows.length} pending member${rows.length === 1 ? '' : 's'}.`
      }
    } else if (normalized.includes('directory') && normalized.includes('pending')) {
      const rows = await db
        .select()
        .from(directoryListings)
        .where(eq(directoryListings.approved, false))
        .limit(50)

      result = `Found ${rows.length} pending directory listing${rows.length === 1 ? '' : 's'}.`
      actions.push('pending_directory_listed')

      if (normalized.includes('approve')) {
        for (const listing of rows) {
          await db
            .update(directoryListings)
            .set({ approved: true, updatedAt: new Date() })
            .where(eq(directoryListings.id, listing.id))
          actions.push(`approved_directory_${listing.id}`)
        }
        result += ` Approved ${rows.length} listing${rows.length === 1 ? '' : 's'}.`
      }
    } else if (normalized.includes('revenue') || normalized.includes('sales')) {
      const [row] = await db
        .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
        .from(orders)
        .where(eq(orders.status, 'paid'))

      const totalCents = row?.total ?? 0
      result = `Lifetime paid revenue is $${(totalCents / 100).toFixed(2)}.`
      actions.push('revenue_summary')
    } else if (normalized.includes('event') && (normalized.includes('create') || normalized.includes('add'))) {
      const title = intent.match(/["']([^"']+)["']/)?.[1] || 'Untitled Event'
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      const [inserted] = await db
        .insert(events)
        .values({
          title,
          slug,
          description: `Created by AI agent from prompt: "${intent}"`,
          startAt,
          priceCents: 0,
          published: false,
        })
        .returning({ id: events.id })

      result = `Created draft event "${title}" (slug: ${slug}, id: ${inserted.id}). Publish it from the Events page.`
      actions.push('event_created')
    } else {
      result = `I understood "${intent}" but I don't have a safe action mapped for it yet. Try asking about leads, pending members, pending directory listings, revenue, or creating an event.`
      actions.push('no_op')
    }

    await db.insert(aiAgentSessions).values({
      agentId: session.user.id,
      sessionKey: crypto.randomUUID(),
      intent,
      actions: JSON.stringify(actions),
      result,
    })

    await logActivity({
      actorType: 'ai_agent',
      actorId: session.user.id,
      action: 'ai_agent_intent',
      entityType: 'ai_agent_session',
      metadata: { intent, actions, result },
    })

    return NextResponse.json({ ok: true, result, actions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Agent execution failed'
    await logActivity({
      actorType: 'ai_agent',
      actorId: session.user.id,
      action: 'ai_agent_error',
      entityType: 'ai_agent_session',
      metadata: { intent, error: message },
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
